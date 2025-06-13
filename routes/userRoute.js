const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const auth = require("../middleware/auth");
const userRouter=express.Router();
// POST /api/user/signup
userRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Please provide all fields" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ name, email, password: hashedPassword });

    const { _id, name: userName, email: userEmail } = newUser;
    res.status(201).json({ message: "User created", user: { _id, userName, userEmail } });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/user/signin
userRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const secret = process.env.JWT_SECRET || "SECRET_KEY";
    const token = jwt.sign({ id: existingUser._id }, secret, { expiresIn: "1h" });

    res.status(200).json({ result: existingUser, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/dashboard (Protected)
userRouter.get("/dashboard", auth, (req, res) => {
  res.status(200).json({ message: `Welcome, user ${req.userId}` });
  
});

module.exports = userRouter;
