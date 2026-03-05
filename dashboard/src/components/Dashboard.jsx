import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AiFillDelete } from "react-icons/ai";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/appointment/patient",
          { withCredentials: true }
        );
        setAppointments(data.appointments || []);
        setTotalAppointments(data.appointments?.length || 0);
      } catch (error) {
        setAppointments([]);
      }
    };

    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/doctors",
          { withCredentials: true }
        );
        setTotalDoctors(data.doctors?.length || 0);
      } catch (error) {
        setTotalDoctors(0);
      }
    };

    fetchAppointments();
    fetchDoctors();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );

      // Update status + meetingLink if backend sends it
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId
            ? { ...a, status, meetingLink: data.meetingLink || a.meetingLink }
            : a
        )
      );

      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/v1/appointment/delete/${appointmentId}`,
        { withCredentials: true }
      );

      setAppointments((prev) =>
        prev.filter((a) => a._id !== appointmentId)
      );

      toast.success("Appointment deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete appointment.");
    }
  };

  const { isAuthenticated, admin } = useContext(Context);
  if (!isAuthenticated) return <Navigate to={"/login"} />;

  return (
    <section className="dashboard page">
      <div className="banner">
        <div className="firstBox">
          <img src="/doc.png" alt="docImg" />
          <div className="content">
            <div>
              <p>Hello ,</p>
              <h5>{admin && `${admin.firstName} ${admin.lastName}`}</h5>
            </div>
          </div>
        </div>

        <div className="secondBox">
          <p>Total Appointments</p>
          <h3>{totalAppointments}</h3>
        </div>

        <div className="thirdBox">
          <p>Registered Doctors</p>
          <h3>{totalDoctors}</h3>
        </div>
      </div>

      <div className="banner">
        <h5>Appointments</h5>

        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Type</th>
              <th>Join</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    {appointment.firstName} {appointment.lastName}
                  </td>
                  <td>{appointment.appointment_date}</td>
                  <td>{appointment.appointment_time}</td>
                  <td>
                    {appointment.doctor?.firstName}{" "}
                    {appointment.doctor?.lastName}
                  </td>
                  <td>{appointment.department}</td>

                  {/* Consultation Type */}
                  <td>{appointment.consultationType}</td>

                  {/* JOIN BUTTON LOGIC */}
                  <td>
                    {appointment.consultationType === "Online" &&
                    appointment.status === "Accepted" &&
                    appointment.meetingLink ? (
                      <a
                        href={appointment.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: "green",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontWeight: "bold",
                        }}
                      >
                        Join
                      </a>
                    ) : (
                      <span style={{ color: "gray" }}>
                        Not Available
                      </span>
                    )}
                  </td>

                  {/* STATUS DROPDOWN */}
                  <td>
                    <select
                      value={appointment.status}
                      onChange={(e) =>
                        handleUpdateStatus(
                          appointment._id,
                          e.target.value
                        )
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  {/* DELETE BUTTON */}
                  <td>
                    <button
                      onClick={() =>
                        handleDeleteAppointment(appointment._id)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <AiFillDelete size={20} color="red" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No Appointments Found!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;