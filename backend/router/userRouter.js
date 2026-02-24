import express from "express";

import {
  addNewAdmin,
  addNewDoctor,
  getAllDoctors,
  getUserDetails,
  login,
  logoutAdmin,
  logoutPatient,
  patientRegister,
  deleteDoctor,
  updateDoctor,
  getSingleDoctor,
} from "../controller/userController.js";

import {
  sendOtp,
  verifyOtp,
  resetPassword,
} from "../controller/messageController.js";

import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

/* 🔐 PASSWORD / OTP */
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

/* AUTH */
router.post("/patient/register", patientRegister);
router.post("/login", login);

/* ADMIN */
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);

/* DOCTOR CRUD */
router.get("/doctors", getAllDoctors);
router.get("/doctor/:id", isAdminAuthenticated, getSingleDoctor);
router.put("/update/doctor/:id", isAdminAuthenticated, updateDoctor);
router.delete("/delete/doctor/:id", isAdminAuthenticated, deleteDoctor);

/* USER */
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);

export default router;
