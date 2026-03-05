import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 4,
  },
  lastName: {
    type: String,
    required: true,
    minLength: 4,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Provide a valid email"],
  },
  phone: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 10,
  },
  nic: {
    type: String,
    required: true,
    minLength: 12,
    maxLength: 12,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Others"],
    required: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ["Patient", "Doctor", "Admin"],
    required: true,
  },

  // LOGIN OTP
  otp: String,
  otpExpire: Date,

  // FORGOT PASSWORD OTP
  resetOtp: String,
  resetOtpExpire: Date,

  doctorDepartment: String,
  address: String,
  experience: Number,
  doctorIdNo: String,

  docAvatar: {
    public_id: String,
    url: String,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

export const User = mongoose.model("User", userSchema);
