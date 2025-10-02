// controllers/paymentController.js
const express = require("express");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const { sendBookingConfirmation } = require("../lib/mailer");

module.exports = (app, db) => {
  const router = express.Router();
  const COOKIE_NAME = process.env.COOKIE_NAME || "tpb_auth";
  const JWT_SECRET = process.env.JWT_SECRET;

  const requireAuth = (req, _res, next) => {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user;
      next();
    } catch {
      next(Object.assign(new Error("Invalid token"), { status: 401 }));
    }
  };

  // Create order + booking in one shot
  app.post("/api/orders", requireAuth, async (req, res) => {
    const conn = await db.getConnection();
    try {
      // inside router.post("/orders", requireAuth, async (req,res) => { ... })
      const { packageId, booking = {}, booking_id: existingBookingId } = req.body || {};

      // fetch package (authoritative per-person price)
      const [[pkg]] = await conn.query(
        "SELECT packageId, packageName, basePrice FROM travel_packages WHERE packageId=?",
        [packageId]
      );
      if (!pkg) return res.status(404).json({ error: "Package not found" });

      // we will compute: perPerson * guests
      let bookingId = existingBookingId || null;
      let perPerson = Number(pkg.basePrice);
      let guests = Number(booking?.guests ?? booking?.selection?.guests ?? 1);

      await conn.beginTransaction();

      if (bookingId) {
        const [[b]] = await conn.query(
          "SELECT * FROM tpb_bookings WHERE booking_id=? FOR UPDATE",
          [bookingId]
        );
        if (!b) { await conn.rollback(); return res.status(404).json({ error: "Booking not found" }); }
        if (b.status === "paid") { await conn.rollback(); return res.status(400).json({ error: "Booking already paid" }); }

        // prefer values already saved in DB
        perPerson = Number(b.price_per_person ?? perPerson);
        guests = Number(b.guests ?? guests);

        const totalAmount = perPerson * guests;
        const amountPaise = Math.round(totalAmount * 100);

        // keep booking up to date (idempotent)
        await conn.query(
          `UPDATE tpb_bookings SET
      user_id       = COALESCE(user_id, ?),
      package_id    = ?,
      amount_paise  = ?,
      currency      = 'INR',
      price_per_person = ?,
      guests        = ?,
      total_amount  = ?,
      customer_name = COALESCE(?, customer_name),
      email         = COALESCE(?, email),
      phone         = COALESCE(?, phone),
      address1      = COALESCE(?, address1),
      address2      = COALESCE(?, address2),
      state         = COALESCE(?, state),
      zip           = COALESCE(?, zip),
      special_requests = COALESCE(?, special_requests),
      start_date    = COALESCE(?, start_date),
      end_date      = COALESCE(?, end_date),
      updated_at    = NOW()
     WHERE booking_id=?`,
          [
            req.user?.id ?? null,
            packageId,
            amountPaise,
            perPerson,
            guests,
            totalAmount,
            booking.customer_name || null,
            booking.email || null,
            booking.phone || null,
            booking.address1 || null,
            booking.address2 || null,
            booking.state || null,
            booking.zip || null,
            booking.special_requests || null,
            booking.start_date || null,
            booking.end_date || null,
            bookingId
          ]
        );

        // create Razorpay order for *total* amount
        const shortReceipt = `pkg${packageId.toString().slice(0, 8)}_${Date.now().toString().slice(-6)}`;

        const order = await global.razorpay.orders.create({
          amount: amountPaise,
          currency: "INR",
          receipt: shortReceipt,
          notes: {
            packageId: pkg.packageId,
            packageName: pkg.packageName,
            userId: req.user.id,
            bookingId
          },
        });

        console.log("Backend created order:", order);

        await conn.query(
          `INSERT INTO tpb_orders
   (order_id, receipt, user_id, package_id, booking_id, amount_paise, currency, status, notes_json, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, 'INR', 'created', ?, NOW(), NOW())`,
          [order.id, order.receipt || null, req.user.id, packageId, bookingId, amountPaise, JSON.stringify(order.notes)]
        );
        await conn.query(`UPDATE tpb_bookings SET order_id=?, updated_at=NOW() WHERE booking_id=?`, [order.id, bookingId]);

        await conn.commit();
        return res.json({ order, bookingId, package: { id: pkg.packageId, name: pkg.packageName, price: perPerson, currency: "INR" } });
      } else {
        // fallback: create booking now if none existed
        const totalAmount = perPerson * guests;
        const amountPaise = Math.round(totalAmount * 100);
        bookingId = uuidv4();

        await conn.query(
          `INSERT INTO tpb_bookings
     (booking_id, user_id, package_id, amount_paise, currency, status,
      customer_name, email, phone, address1, address2, state, zip, special_requests,
      start_date, end_date, guests, price_per_person, total_amount, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'INR', 'pending',
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            bookingId, req.user.id, packageId, amountPaise,
            booking.customer_name || null,
            booking.email || null,
            booking.phone || null,
            booking.address1 || null,
            booking.address2 || null,
            booking.state || null,
            booking.zip || null,
            booking.special_requests || null,
            booking.start_date || null,
            booking.end_date || null,
            guests, perPerson, totalAmount
          ]
        );

        const order = await global.razorpay.orders.create({
          amount: amountPaise,
          currency: "INR",
          receipt: `pkg_${packageId}_${Date.now()}`,
          notes: { packageId: pkg.packageId, packageName: pkg.packageName, userId: req.user.id, bookingId },
        });

        await conn.query(
          `INSERT INTO tpb_orders
   (order_id, receipt, user_id, package_id, booking_id, amount_paise, currency, status, notes_json, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, 'INR', 'created', ?, NOW(), NOW())`,
          [order.id, order.receipt || null, req.user.id, packageId, bookingId, amountPaise, JSON.stringify(order.notes)]
        );
        await conn.query(`UPDATE tpb_bookings SET order_id=?, updated_at=NOW() WHERE booking_id=?`, [order.id, bookingId]);

        await conn.commit();
        return res.json({ order, bookingId, package: { id: pkg.packageId, name: pkg.packageName, price: perPerson, currency: "INR" } });
      }
    } catch (e) {
      try { await (conn && conn.rollback()); } catch { }
      console.error("Create order failed:", e);
      res.status(500).json({ error: "create order error" });
    } finally {
      if (conn) conn.release();
    }
  });

  // Verify payment signature (client confirmation)
  app.post("/api/payments/verify", requireAuth, async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
        return res.status(400).json({ success: false, message: "Missing fields" });

      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const ok =
        expected.length === razorpay_signature.length &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));

      if (!ok) return res.status(400).json({ success: false, message: "Payment verification failed" });

      // Fetch order, verify ownership
      const [[ord]] = await db.query(
        "SELECT * FROM tpb_orders WHERE order_id=?",
        [razorpay_order_id]
      );
      // if (!ord) return res.status(404).json({ success: false, message: "Order not found" });
      if (String(ord.user_id) !== String(req.user.id)) {
        console.warn("⚠️ Order ownership mismatch", { dbUser: String(ord.user_id), jwtUser: String(req.user.id) });
        return res.status(403).json({ success: false, message: "Not your order" });
      }

      // Mark paid (idempotent)
      await db.query(
        `UPDATE tpb_orders
         SET status='paid', payment_id=?, signature=?, updated_at=NOW()
         WHERE order_id=?`,
        [razorpay_payment_id, razorpay_signature, razorpay_order_id]
      );

      // Mark booking paid
      await db.query(
        `UPDATE tpb_bookings
         SET status='paid', payment_id=?, updated_at=NOW()
         WHERE order_id=?`,
        [razorpay_payment_id, razorpay_order_id]
      );

      // Grant package (idempotent)
      await db.query(
        `INSERT IGNORE INTO tpb_user_packages
         (user_id, package_id, order_id, payment_id, amount_paise, status, purchased_at)
         VALUES (?, ?, ?, ?, ?, 'active', NOW())`,
        [ord.user_id, ord.package_id, razorpay_order_id, razorpay_payment_id, ord.amount_paise]
      );

      // Fetch booking & package details for email
      const [[booking]] = await db.query(
        "SELECT * FROM tpb_bookings WHERE order_id=? LIMIT 1",
        [razorpay_order_id]
      );

      // Pull package name for summary
      const [[pkg]] = await db.query(
        "SELECT packageName FROM travel_packages WHERE packageId=?",
        [ord.package_id]
      );

      // Send confirmation email
      try {
        await sendBookingConfirmation(booking.email, booking, pkg);
        await db.query(`UPDATE tpb_bookings SET email_sent=1 WHERE booking_id=?`, [booking.booking_id]);
      } catch (mailErr) {
        console.error("❌ Email send failed:", mailErr);
      }

      return res.json({
        success: true,
        message: "Payment verified",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        summary: {
          orderId: razorpay_order_id,
          purchasedAt: new Date().toISOString(),
          amount: (ord.amount_paise / 100).toFixed(2),
          currency: ord.currency || "INR",
          method: "Razorpay",
          packageName: pkg?.packageName || "Your package",
          customerName: booking.customer_name,
          email: booking.email,
          phone: booking.phone,
          startDate: booking.start_date,
          endDate: booking.end_date,
          guests: booking.guests,
        },
      });
    } catch (e) {
      console.error("Verify payment error:", e);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Simple preview to show discount for a package
  app.post("/api/promos/preview", async (req, res) => {
    try {
      const { packageId, code } = req.body || {};
      if (!packageId || !code) return res.status(400).json({ error: "packageId and code required" });

      const [[pkg]] = await db.query(
        "SELECT basePrice FROM travel_packages WHERE packageId=?",
        [packageId]
      );
      if (!pkg) return res.status(404).json({ error: "Package not found" });

      const [[promo]] = await db.query("SELECT * FROM tpb_promocodes WHERE code=? AND is_active=1", [code]);
      if (!promo) return res.status(400).json({ error: "Invalid promo code" });
      if (promo.expires_at && new Date(promo.expires_at) < new Date())
        return res.status(400).json({ error: "Promo expired" });

      const basePaise = Math.round(Number(pkg.basePrice) * 100);
      if (promo.min_amount_paise && basePaise < promo.min_amount_paise)
        return res.status(400).json({ error: "Order does not meet minimum amount" });

      const percent = Number(promo.percent_off || 0);
      const fixed = Number(promo.amount_off_paise || 0);
      const discount = Math.min(basePaise, Math.floor(basePaise * (percent / 100)) + fixed);

      return res.json({ discount_paise: discount, pay_amount_paise: basePaise - discount, message: "Promo applied" });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // List purchases for logged-in user
  app.get("/api/auth/me/purchases", requireAuth, async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT up.*, p.packageName, (up.amount_paise/100.0) AS amount
         FROM tpb_user_packages up
         LEFT JOIN travel_packages p ON p.packageId = up.package_id
         WHERE up.user_id = ?
         ORDER BY up.purchased_at DESC`,
        [req.user.id]
      );
      res.json(rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  // app.use("/api", router);
};
