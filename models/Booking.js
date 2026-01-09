const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  parentName: String,
  email: String,
  phone: String,
  childName: String,
  program: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
