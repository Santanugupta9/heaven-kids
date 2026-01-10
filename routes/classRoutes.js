const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");
const Class = require("../models/Class");
const protect = require("../middleware/authMiddleware");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "heaven-kids-classes",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage: storage });

// GET all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create class
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const newClass = await Class.create({
      title: req.body.title,
      age: req.body.age,
      description: req.body.description,
      imageUrl: req.file.path,
      publicId: req.file.filename
    });
    res.json({ success: true, class: newClass });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE class
router.delete("/:id", protect, async (req, res) => {
  try {
    const classItem = await Class.findByIdAndDelete(req.params.id);
    if (classItem && classItem.publicId) {
      await cloudinary.uploader.destroy(classItem.publicId);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;