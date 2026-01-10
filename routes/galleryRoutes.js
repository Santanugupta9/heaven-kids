const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");
const Gallery = require("../models/Gallery");
const protect = require("./authMiddleware");

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
router.post("/upload", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
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

// CLEANUP: Remove Facebook CDN images that are blocked (403 Forbidden)
// This is a utility endpoint to clean up invalid images
router.delete("/cleanup/facebook-cdn", protect, async (req, res) => {
  try {
    // Find all images from Facebook CDN
    const fbcdnRegex = /fbcdn\.net|facebook\.com/;
    const invalidImages = await Gallery.find({ imageUrl: { $regex: fbcdnRegex } });
    
    const deletedCount = invalidImages.length;
    
    // Delete all found images from both database and Cloudinary
    for (const img of invalidImages) {
      // Only delete from Cloudinary if it has a publicId (was uploaded to Cloudinary)
      if (img.publicId) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (cloudErr) {
          console.log("Cloudinary deletion skipped:", img.publicId);
        }
      }
      await Gallery.findByIdAndDelete(img._id);
    }
    
    res.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} Facebook CDN images`,
      deletedCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE image
router.delete("/:id", protect, async (req, res) => {
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
