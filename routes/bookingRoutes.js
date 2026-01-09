const express = require("express");
const Booking = require("../models/Booking");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/", async (req, res) => {

  try {
    const booking = await Booking.create(req.body);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Heaven Kids" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "📩 New Booking Received",
      html: `
        <h3>New Admission Request</h3>
        <p><b>Parent:</b> ${booking.parentName}</p>
        <p><b>Phone:</b> ${booking.phone}</p>
        <p><b>Program:</b> ${booking.program}</p>
      `
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
