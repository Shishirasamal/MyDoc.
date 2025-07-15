import express from "express";
import {
  deleteAppointment,
  getAllAppointments,
  postAppointment,
  updateAppointmentStatus,
} from "../controller/appointmentController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);
router.put("/update/:id", updateAppointmentStatus);

// DELETE appointment by patient name (admin-only)
router.delete('/delete-by-name', async (req, res) => {
  const { firstName, lastName } = req.body;

  try {
    const result = await Appointment.findOneAndDelete({ firstName, lastName });

    if (!result) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully by name." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
