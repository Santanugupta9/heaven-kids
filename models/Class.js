const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  title: String,
  age: String,
  description: String,
  imageUrl: String,
  publicId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Class", classSchema);