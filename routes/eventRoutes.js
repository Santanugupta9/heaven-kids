const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");
const Event = require("../models/Event");
const protect = require("./authMiddleware");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "heaven-kids-events",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage: storage });

// GET all events (Sorted by date)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create event
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const eventData = {
      title: req.body.title,
      date: req.body.date,
      description: req.body.description,
      location: req.body.location
    };

    if (req.file) {
      eventData.imageUrl = req.file.path;
      eventData.publicId = req.file.filename;
    }

    const newEvent = await Event.create(eventData);
    res.json({ success: true, event: newEvent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE event
router.delete("/:id", protect, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (event && event.publicId) {
      await cloudinary.uploader.destroy(event.publicId);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;