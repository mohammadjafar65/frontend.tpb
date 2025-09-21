// lib/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // e.g. smtp.gmail.com
  port: process.env.SMTP_PORT || 587,
  secure: false,                     // true if 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendBookingConfirmation(toEmail, booking, pkg) {
  const subject = `Your booking confirmation - ${pkg.packageName}`;
  const html = `
    <h2>Booking Confirmation</h2>
    <p>Hi ${booking.customer_name},</p>
    <p>Thank you for booking <b>${pkg.packageName}</b> with us.</p>
    <p><b>Booking ID:</b> ${booking.booking_id}</p>
    <p><b>Dates:</b> ${booking.start_date} → ${booking.end_date}</p>
    <p><b>Guests:</b> ${booking.guests}</p>
    <p><b>Total Paid:</b> ₹${booking.total_amount}</p>

    <h3>Package Details:</h3>
    <p>${pkg.description || "See attached snapshot"}</p>

    <br>
    <p>Warm regards,<br>The Pilgrim Beez</p>
  `;

  return transporter.sendMail({
    from: `"The Pilgrim Beez" <${process.env.SMTP_USER}>`,
    to: [toEmail, process.env.ADMIN_EMAIL], // send to customer + your inbox
    subject,
    html,
  });
}

module.exports = { sendBookingConfirmation };