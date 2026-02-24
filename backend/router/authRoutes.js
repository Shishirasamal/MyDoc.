import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();
let otpStore = {};

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(404).json({ message: "Email not registered" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = { otp, expires: Date.now() + 60000 };

  await sendEmail(email, "QuickDoc OTP", `Your OTP is ${otp}`);
  res.json({ message: "OTP sent to email" });
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const data = otpStore[email];

  if (!data || Date.now() > data.expires)
    return res.status(400).json({ message: "OTP expired" });

  if (data.otp != otp)
    return res.status(400).json({ message: "Invalid OTP" });

  res.json({ message: "OTP verified" });
});

router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await Admin.updateOne({ email }, { password: hashed });
  delete otpStore[email];
  res.json({ message: "Password reset successful" });
});

export default router;
