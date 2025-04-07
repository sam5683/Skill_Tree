// MongoDB Connection
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = "mongodb://localhost:27017/skilltree"; // Use MongoDB Atlas URI if preferred
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;