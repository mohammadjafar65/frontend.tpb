// controllers/admin.js
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const COOKIE_NAME = process.env.COOKIE_NAME || "tpb_auth";
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (app, pool) => {
  function requireAuth(req, res, next) {
    try {
      const token = req.cookies?.[COOKIE_NAME];
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  // ---------- LIST USERS (search + pagination)
  // GET /admin/users?search=&page=1&pageSize=20
  app.get("/admin/users", requireAuth, async (req, res) => {
    try {
      // only admins can list users
      const [[me]] = await pool.query("SELECT role FROM users WHERE id = ?", [req.user.id]);
      if (!me || me.role !== "admin") return res.status(403).json({ error: "Forbidden" });

      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || "20", 10)));
      const search = String(req.query.search || "").trim();

      const where = [];
      const params = [];
      if (search) {
        where.push("(name LIKE ? OR email LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
      }
      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM users ${whereSql}`,
        params
      );

      const offset = (page - 1) * pageSize;
      const [rows] = await pool.query(
        `
        SELECT id, name, email, email_verified, role, created_at
        FROM users
        ${whereSql}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `,
        [...params, pageSize, offset]
      );

      res.json({ users: rows, total, page, pageSize });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ---------- UPDATE ROLE
  app.patch("/admin/users/:id/role", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const Body = z.object({ role: z.enum(["user", "admin"]) });
      const { role } = Body.parse(req.body);

      const [[me]] = await pool.query("SELECT id, role FROM users WHERE id=?", [req.user.id]);
      if (!me || me.role !== "admin") return res.status(403).json({ error: "Forbidden" });

      if (id === String(req.user.id)) {
        return res.status(400).json({ error: "You cannot change your own role." });
      }

      const [[target]] = await pool.query("SELECT id, role FROM users WHERE id=?", [id]);
      if (!target) return res.status(404).json({ error: "User not found" });

      if (target.role === "admin" && role === "user") {
        const [[{ admin_count }]] = await pool.query(
          "SELECT COUNT(*) AS admin_count FROM users WHERE role='admin' AND id<>?",
          [id]
        );
        if (admin_count === 0) {
          return res.status(400).json({ error: "Cannot remove the last admin." });
        }
      }

      await pool.query("UPDATE users SET role=?, updated_at=NOW() WHERE id=?", [role, id]);
      const [[updated]] = await pool.query(
        "SELECT id, name, email, email_verified, role, created_at FROM users WHERE id=?",
        [id]
      );
      res.json({ user: updated });
    } catch (e) {
      if (e.errors) return res.status(400).json({ error: "Invalid role" });
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ---------- DELETE USER
  app.delete("/admin/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      const [[me]] = await pool.query("SELECT id, role FROM users WHERE id=?", [req.user.id]);
      if (!me || me.role !== "admin") return res.status(403).json({ error: "Forbidden" });

      if (id === String(req.user.id)) {
        return res.status(400).json({ error: "You cannot delete your own account." });
      }

      const [[target]] = await pool.query("SELECT id, role FROM users WHERE id=?", [id]);
      if (!target) return res.status(404).json({ error: "User not found" });

      if (target.role === "admin") {
        const [[{ admin_count }]] = await pool.query(
          "SELECT COUNT(*) AS admin_count FROM users WHERE role='admin' AND id<>?",
          [id]
        );
        if (admin_count === 0) {
          return res.status(400).json({ error: "Cannot delete the last admin." });
        }
      }

      await pool.query("DELETE FROM users WHERE id=?", [id]);
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  });
};
