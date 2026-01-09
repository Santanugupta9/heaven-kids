const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");
const Gallery = require("../models/Gallery");

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "heaven-kids-gallery",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage: storage });

// GET all images
router.get("/", async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload image
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const newImage = await Gallery.create({
      imageUrl: req.file.path,
      publicId: req.file.filename,
      category: req.body.category || "General"
    });
    res.json({ success: true, image: newImage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE image
router.delete("/:id", async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (image && image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;