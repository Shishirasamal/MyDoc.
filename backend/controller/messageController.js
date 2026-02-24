import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { sendEmail } from "../utils/emailUtil.js";
import User from "../models/userSchema.js";
import Message from "../models/messageSchema.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

/* ================= CONTACT MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const savedMessage = await Message.create({
      firstName,
      lastName,
      email,
      phone,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message saved successfully",
      data: savedMessage,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Message not stored" });
  }
};

/* ================= GET ALL MESSAGES (ADMIN) ================= */
export const getAllMessages = async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    messages,
  });
};
/* ================= SEND OTP ================= */
export const sendOtp = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetOtp = otp;
  user.resetOtpExpire = Date.now() + 5 * 60 * 1000; // 5 min
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  });

  res.status(200).json({
    success: true,
    message: "OTP sent to your email",
  });
});

/* ================= VERIFY OTP ================= */
export const verifyOtp = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || !user.resetOtp) {
    return next(new ErrorHandler("OTP not generated", 400));
  }

  if (
    user.resetOtp !== otp ||
    user.resetOtpExpire < Date.now()
  ) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  // ✅ clear OTP after success
  user.resetOtp = undefined;
  user.resetOtpExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
});

/* ================= RESET PASSWORD ================= */
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(new ErrorHandler("Password fields are required", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.password = password; // pre-save hook hashes it
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

/* ================= LOGIN ================= */
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password required", 400));
  }

const user = await User.findOne({ email }).select("+password");

 if (user.role !== role) {
  return next(new ErrorHandler("Unauthorized role", 403));
}


  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid password", 401));
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    user,
  });
});
