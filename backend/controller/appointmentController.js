import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/emailUtil.js"; // email utility

// POST new appointment
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
    hasVisited,
    address,
  } = req.body;

  if (
    !firstName || !lastName || !email || !phone || !nic || !dob || !gender ||
    !appointment_date || !appointment_time || !department || !doctor_firstName ||
    !doctor_lastName || !address
  ) {
    return next(new ErrorHandler("Please fill the full form!", 400));
  }

  const isConflict = await User.find({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });

  if (isConflict.length === 0) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  if (isConflict.length > 1) {
    return next(new ErrorHandler("Doctor conflict! Contact support.", 400));
  }

  const doctorId = isConflict[0]._id;
  const patientId = req.user._id;

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
    hasVisited,
    address,
    doctorId,
    patientId,
  });

  await sendEmail({
    to: email,
    subject: "Appointment Received",
    text: `Dear ${firstName}, your appointment request has been received and is under REVIEW.`,
  });
  

  res.status(200).json({
    success: true,
    appointment,
    message: "Appointment sent!",
  });
});

// GET all appointments
export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find();
  res.status(200).json({
    success: true,
    appointments,
  });
});

// PUT update appointment status (with email)
export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }

  const updated = await Appointment.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (req.body.status === "Accepted") {
    await sendEmail({
      to: appointment.email,
      subject: "Appointment Accepted",
      text: `Dear ${appointment.firstName}, your appointment with ${appointment.doctor.firstName} ${appointment.doctor.lastName} from ${appointment.department} department has been scheduled on ${appointment.appointment_date} at ${appointment.appointment_time}. Please make sure to be on time. Thank You for using our service!.`,
    });
  } else if (req.body.status === "Rejected") {
    await sendEmail({
      to: appointment.email,
      subject: "Appointment Rejected",
      text: `Dear ${appointment.firstName}, your appointment on ${appointment.appointment_date} at ${appointment.appointment_time} has been 𝗥𝗘𝗝𝗘𝗖𝗧𝗘𝗗 due to doctor unavalability at this time. Please try again or contact admin.`,
    });
  }

  res.status(200).json({
    success: true,
    message: "Appointment status updated!",
  });
});

// DELETE appointment
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }

  await appointment.deleteOne();
  res.status(200).json({
    success: true,
    message: "Appointment deleted!",
  });
});
