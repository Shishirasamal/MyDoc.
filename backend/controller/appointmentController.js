import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import Appointment from "../models/appointmentSchema.js";
import {User} from "../models/userSchema.js";
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
    consultationType,
  } = req.body;

  if (
    !firstName || !lastName || !email || !phone || !nic ||
    !dob || !gender || !appointment_date || !appointment_time ||
    !department || !doctor_firstName || !doctor_lastName ||
    !address || !consultationType
  ) {
    return next(new ErrorHandler("Please fill the full form!", 400));
  }

  const doctor = await User.findOne({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });

  if (!doctor) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  if (!req.user || !req.user._id) {
    return next(new ErrorHandler("Patient not authenticated", 401));
  }

  // ✅ GENERATE JITSI LINK
  let meetingLink = null;

  if (consultationType === "Online") {
    const roomName = `HMS-${doctor_firstName}-${firstName}-${appointment_date}-${appointment_time}`
      .replace(/\s+/g, "")
      .replace(/:/g, "-");

    meetingLink = `https://meet.jit.si/${roomName}#config.requireDisplayName=false&config.prejoinPageEnabled=false`;
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
    consultationType,
    meetingLink,
    doctorId: doctor._id,
    patientId: req.user._id,
  });

  // ✅ EMAIL TEXT
  let emailText = `Dear ${firstName},

Your appointment request has been received.

Doctor: Dr. ${doctor_firstName} ${doctor_lastName}
Department: ${department}
Date: ${appointment_date}
Time: ${appointment_time}
Consultation Type: ${consultationType}
`;

  if (consultationType === "Online") {
    emailText += `

Join Video Call:
${meetingLink}
`;
  }

  await sendEmail({
    to: email,
    subject: "Appointment Confirmation",
    text: emailText,
  });

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    appointment,
  });
});

// ✅ GET LOGGED IN PATIENT APPOINTMENTS
export const getPatientAppointments = catchAsyncErrors(
  async (req, res, next) => {
    console.log("REQ.USER:", req.user);

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Patient not authenticated",
      });
    }

    const appointments = await Appointment.find({}).sort({ createdAt: -1 });

    console.log("FOUND APPOINTMENTS:", appointments);

    res.status(200).json({
      success: true,
      appointments,
    });
  }
);

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
export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { status } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorHandler("Appointment not found", 404));
    }

    appointment.status = status;

    // ✅ IF ACCEPTED → generate meeting link
    if (status === "Accepted") {
      const roomName = `HMS-${appointment.doctor.firstName}-${appointment.firstName}-${appointment.appointment_date}-${appointment.appointment_time}`
        .replace(/\s+/g, "")
        .replace(/:/g, "-");

      appointment.meetingLink = `https://meet.jit.si/${roomName}`;
    }

    await appointment.save();

    // ✅ SEND EMAIL TO PATIENT
    let emailText = `Dear ${appointment.firstName},

Your appointment status has been updated.

Doctor: Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}
Department: ${appointment.department}
Date: ${appointment.appointment_date}
Time: ${appointment.appointment_time}
New Status: ${status}
`;

    if (status === "Accepted") {
      emailText += `

Join Video Call:
${appointment.meetingLink}
`;
    }

    if (status === "Rejected") {
      emailText += `

Unfortunately, your appointment has been rejected.
Please book another slot or contact hospital.`;
    }

    await sendEmail({
      to: appointment.email,
      subject: "Appointment Status Updated",
      text: emailText,
    });

    res.status(200).json({
      success: true,
      message: "Appointment status updated and email sent",
    });
  }
);

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
