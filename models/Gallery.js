const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
  imageUrl: String,
  publicId: String, // Used to delete image from Cloudinary
  category: { type: String, default: "General" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Gallery", gallerySchema);