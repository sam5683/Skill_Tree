// User Controller
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!/^[a-zA-Z0-9_]{4,16}$/.test(username)) {
      return res.status(400).json({ message: "Invalid username format" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username taken" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
};

exports.checkUsername = async (req, res) => {
  const { username } = req.params;
  try {
    if (!/^[a-zA-Z0-9_]{4,16}$/.test(username)) {
      return res.json({ available: false, message: "Invalid username format" });
    }
    const user = await User.findOne({ username });
    res.json({ available: !user });
  } catch (err) {
    res.status(500).json({ message: "Error checking username" });
  }
};