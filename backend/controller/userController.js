import bcrypt from "bcryptjs";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";

// ================= PATIENT REGISTER =================
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Patient",
  });

  generateToken(user, "User Registered Successfully!", 200, res);
});

// ================= LOGIN =================

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(new ErrorHandler("Email, password and role required", 400));
  }

  const user = await User.findOne({ email, role }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or role", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid password", 401));
  }

  // ✅ GENERATE JWT TOKEN
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );

  // ✅ SET COOKIE (VERY IMPORTANT)
  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: false, // change to true in production
    sameSite: "lax",
  });

 res
  .status(200)
  .cookie("patientToken", token, {
    httpOnly: true,
    secure: false,          // VERY IMPORTANT for localhost
    sameSite: "lax",        // VERY IMPORTANT
  })
  .json({
    success: true,
    message: "Login Successfully!",
  });
});

// ================= ADD ADMIN =================
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Admin With This Email Already Exists!", 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Admin",
  });

  res.status(200).json({
    success: true,
    message: "New Admin Registered",
    admin,
  });
});

// ================= ADD DOCTOR =================
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || !req.files.docAvatar) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }

  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    doctorDepartment,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Doctor With This Email Already Exists!", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    docAvatar.tempFilePath
  );

  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});

// ================= GET DOCTORS =================
export const getAllDoctors = catchAsyncErrors(async (req, res) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({ success: true, doctors });
});

export const getSingleDoctor = catchAsyncErrors(async (req, res, next) => {
  const doctor = await User.findById(req.params.id);

  if (!doctor || doctor.role !== "Doctor") {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  res.status(200).json({ success: true, doctor });
});

// ================= UPDATE / DELETE =================
export const updateDoctor = catchAsyncErrors(async (req, res, next) => {
  const doctor = await User.findById(req.params.id);
  if (!doctor || doctor.role !== "Doctor") {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  Object.assign(doctor, req.body);
  await doctor.save();

  res.status(200).json({
    success: true,
    message: "Doctor updated successfully",
  });
});

export const deleteDoctor = catchAsyncErrors(async (req, res, next) => {
  const doctor = await User.findById(req.params.id);
  if (!doctor || doctor.role !== "Doctor") {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  if (doctor.docAvatar?.public_id) {
    await cloudinary.uploader.destroy(doctor.docAvatar.public_id);
  }

  await doctor.deleteOne();

  res.status(200).json({
    success: true,
    message: "Doctor deleted permanently",
  });
});

// ================= LOGOUT =================
export const logoutAdmin = catchAsyncErrors(async (req, res) => {
  res.cookie("adminToken", "", { expires: new Date(Date.now()) }).json({
    success: true,
    message: "Admin Logged Out Successfully",
  });
});

export const logoutPatient = catchAsyncErrors(async (req, res) => {
  res.cookie("patientToken", "", { expires: new Date(Date.now()) }).json({
    success: true,
    message: "Patient Logged Out Successfully",
  });
});

// ================= GET USER DETAILS =================
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
});
