const crypto = require("crypto");

module.exports = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const raw = req.body;

    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (expected.length !== (signature || "").length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ""))) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(raw.toString("utf8"));
    const db = req.app.locals.db;

    if (event.event === "payment.captured") {
      const p = event.payload.payment.entity;
      await db.query(
        `UPDATE tpb_orders SET status='paid', payment_id=?, updated_at=NOW()
     WHERE order_id=?`,
        [p.id, p.order_id]
      );
      await db.query(
        `UPDATE tpb_bookings SET status='paid', payment_id=?, updated_at=NOW()
     WHERE order_id=?`,
        [p.id, p.order_id]
      );
    }

    if (event.event === "payment.failed") {
      const p = event.payload.payment.entity;
      await db.query(
        `UPDATE tpb_orders SET status='failed', payment_id=?, updated_at=NOW()
     WHERE order_id=?`,
        [p.id, p.order_id]
      );
      await db.query(
        `UPDATE tpb_bookings SET status='failed', payment_id=?, updated_at=NOW()
     WHERE order_id=?`,
        [p.id, p.order_id]
      );
    }
    return res.json({ received: true });
  } catch (e) {
    console.error("Webhook error:", e);
    res.status(500).send("Webhook handler error");
  }
};