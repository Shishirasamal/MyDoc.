import express from "express";
import {
  postAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getPatientAppointments
} from "../controller/appointmentController.js";

import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", getAllAppointments);
router.get(
  "/patient",
  isPatientAuthenticated,
  getPatientAppointments
);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default router;
