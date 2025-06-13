const router = require("express").Router();
const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");

router.post("/", async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(req.body.password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ ok: "ok" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
