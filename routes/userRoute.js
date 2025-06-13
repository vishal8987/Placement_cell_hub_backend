const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const userRouter=express.Router();
const sendEmail=require("../utils/sendEmail");
const otpStore=new Map();
function generateOTP(email){
  const otp=Math.floor(100000+Math.random()*900000).toString();
  const expiresAt=Date.now()+3*60*1000;

  otpStore.set(email,{otp,expiresAt});
  return otp;
}

// POST /api/user/signup
userRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Please provide all fields" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hasNumber=/\d./.test(email);
    if (!email.endsWith("@nsec.ac.in"))
      return res.status(400).json({ message: "Email must be from @nsec.ac.in domain" });

    const role=hasNumber?"user":"admin";
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ name, email, password: hashedPassword,role });
    const genOtp=generateOTP(email);
    await sendEmail(email,genOtp);
   const { _id, name: userName, email: userEmail } = newUser;
    res.status(201).json({ message: "User created", user: { _id, userName, userEmail, role } });
  } catch (err) {
    console.log(err);
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
    const genOtp=generateOTP(email);
    await sendEmail(email,genOtp);
    res.status(200).json({ result: existingUser, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/dashboard (Protected)
userRouter.get("/dashboard", auth, (req, res) => {
  res.status(200).json({ message: `Welcome, user ${req.userId}` });
  
});


userRouter.post("/verify", async (req, res) => {
  const { email, inputOtp } = req.body;
  const record = otpStore.get(email);

  if (!record) {
    return res.status(400).json({ valid: false, message: "No OTP found" });
  }

  const { otp, expiresAt } = record;

  if (Date.now() > expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ valid: false, message: "OTP expired" });
  }

  if (otp !== inputOtp) {
    return res.status(400).json({ valid: false, message: "Incorrect OTP" });
  }

  otpStore.delete(email);

  // ✅ Update user verified status
  await User.updateOne({ email }, { verified: true });

  return res.status(200).json({ valid: true, message: "OTP verified and account activated" });
});

module.exports = userRouter;
