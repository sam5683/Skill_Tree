// Server Setup
const express = require("express");
const connectDB = require("./db");
const userRoutes = require("./routes/userRoutes");
const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/user", userRoutes);

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));