const express = require("express");
const Booking = require("../models/Booking");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/", async (req, res) => {

  try {
    const booking = await Booking.create(req.body);

    // 1. Respond to the client IMMEDIATELY so they don't get a timeout
    res.json({ success: true });

    // 2. Send email in the background (do not await)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    transporter.sendMail({
      from: `"Heaven Kids" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "📩 New Booking Received",
      html: `
        <h3>New Admission Request</h3>
        <p><b>Parent:</b> ${booking.parentName}</p>
        <p><b>Phone:</b> ${booking.phone}</p>
        <p><b>Program:</b> ${booking.program}</p>
        <p><b>Message:</b> ${booking.message}</p>
      `
    }).catch(err => console.error("❌ Email Sending Failed:", err));

  } catch (err) {
    console.error("❌ Booking Error:", err);
    // Only send error response if we haven't sent success yet
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

module.exports = router;
