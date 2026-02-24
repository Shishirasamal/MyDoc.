import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import Appointment from "../models/appointmentSchema.js";
import User from "../models/userSchema.js";
import Message from "../models/messageSchema.js"; // ✅ ADD THIS
import { sendEmail } from "../utils/emailUtil.js";

/* ================= POST APPOINTMENT ================= */
export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    appointment_time,
    department,
    doctor_firstName,
    doctor_lastName,
    address,
  } = req.body;

  // 🔴 VALIDATION
  if (
    !firstName || !lastName || !email || !phone || !nic ||
    !dob || !gender || !appointment_date || !appointment_time ||
    !department || !doctor_firstName || !doctor_lastName || !address
  ) {
    return next(new ErrorHandler("Please fill the full form!", 400));
  }

  // 🔴 FIND DOCTOR
  const doctor = await User.findOne({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });

  if (!doctor) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  // 🔴 CHECK PATIENT LOGIN
  if (!req.user || !req.user._id) {
    return next(new ErrorHandler("Patient not authenticated", 401));
  }

  // ✅ CREATE APPOINTMENT
  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    appointment_time,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    address,
    doctorId: doctor._id,
    patientId: req.user._id,
  });

  // ✅ CREATE MESSAGE (🔥 THIS FIXES YOUR PROBLEM)
  // ✅ CREATE MESSAGE (FIXED)
await Message.create({
  firstName,
  lastName,
  email,
  phone,
  message: `New Appointment Booked

Patient: ${firstName} ${lastName}
Doctor: Dr. ${doctor_firstName} ${doctor_lastName}
Department: ${department}
Date: ${appointment_date}
Time: ${appointment_time}
Address: ${address}`,
});


  // 📧 EMAIL
  await sendEmail({
    to: email,
    subject: "Appointment Received",
    text: `Dear ${firstName}, your appointment request has been received successfully.`,
  });

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    appointment,
  });
});

/* ================= GET ALL APPOINTMENTS (ADMIN) ================= */
export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find()
    .populate("patientId", "firstName lastName email")
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    appointments,
  });
});

/* ================= UPDATE STATUS ================= */
export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }

  appointment.status = req.body.status;
  await appointment.save();

  res.status(200).json({
    success: true,
    message: "Appointment status updated",
  });
});

/* ================= DELETE APPOINTMENT ================= */
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }

  await appointment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Appointment deleted",
  });
});
