const express = require("express");
const Booking = require("../Booking");
const nodemailer = require("nodemailer");
const protect = require("../authMiddleware");

const router = express.Router();

// GET all bookings (for Admin page)
router.get("/", protect, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {

  try {
    const booking = await Booking.create(req.body);

    // 1. Respond to the client IMMEDIATELY so they don't get a timeout
    res.json({ success: true });

    // 2. Send email in the background (do not await)
    console.log("📨 Attempting to send email to: princegupta3637@gmail.com");

    // SendGrid Transport
    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY
      },
      family: 4, // Force IPv4 to avoid timeouts on Render
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000, // 30 seconds
      debug: true, // Enable debug logs
      logger: true // Log to console
    });

    // Format the date and time
    const bookingTime = new Date(booking.createdAt).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    transporter.sendMail({
      from: `"Heaven Kids" <${process.env.EMAIL_USER}>`,
      to: "princegupta3637@gmail.com",
      subject: "📩 New Booking Received",
      html: `
        <h3>New Admission Request</h3>
        <p><b>Parent:</b> ${booking.parentName}</p>
        <p><b>Child:</b> ${booking.childName}</p>
        <p><b>Email:</b> ${booking.email}</p>
        <p><b>Phone:</b> ${booking.phone}</p>
        <p><b>Program:</b> ${booking.program}</p>
        <p><b>Message:</b> ${booking.message}</p>
        <hr>
        <p><b>Received At:</b> ${bookingTime}</p>
      `
    }).then(() => console.log("✅ Email sent successfully"))
    .catch(err => console.error("❌ Email Sending Failed:", err));

  } catch (err) {
    console.error("❌ Booking Error:", err);
    // Only send error response if we haven't sent success yet
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

// DELETE a booking
router.delete("/:id", protect, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
