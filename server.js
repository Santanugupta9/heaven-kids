const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from client folder
app.use(express.static(path.join(__dirname, "client")));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error:", err));

// Routes
app.use("/api/booking", require("./routes/bookingRoutes"));
app.use("/api/book", require("./routes/bookingRoutes")); // Fallback for legacy frontend
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));

// Test route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
