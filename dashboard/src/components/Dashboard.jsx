// import React, { useContext, useEffect, useState } from "react";
// import { Context } from "../main";
// import { Navigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { GoCheckCircleFill } from "react-icons/go";
// import { AiFillCloseCircle } from "react-icons/ai";

// const Dashboard = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [totalAppointments, setTotalAppointments] = useState(0);
//   const [totalDoctors, setTotalDoctors] = useState(0);

//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         const { data } = await axios.get(
//           "http://localhost:4000/api/v1/appointment/getall",
//           { withCredentials: true }
//         );
//         setAppointments(data.appointments || []);
//         setTotalAppointments(data.appointments.length || 0);
//       } catch (error) {
//         setAppointments([]);
//       }
//     };

//     const fetchDoctors = async () => {
//       try {
//         const { data } = await axios.get(
//           "http://localhost:4000/api/v1/user/doctors",
//           { withCredentials: true }
//         );
//         setTotalDoctors(data.doctors.length || 0);
//       } catch (error) {
//         setTotalDoctors(0);
//         console.error(
//           "Error fetching doctors:",
//           error.response?.data || error.message
//         );
//       }
//     };
//     fetchAppointments();
//     fetchDoctors();
//     console.log(totalDoctors);
//   }, []);

//   const handleUpdateStatus = async (appointmentId, status) => {
//     try {
//       const { data } = await axios.put(
//         `http://localhost:4000/api/v1/appointment/update/${appointmentId}`,
//         { status },
//         { withCredentials: true }
//       );
//       setAppointments((prevAppointments) =>
//         prevAppointments.map((appointment) =>
//           appointment._id === appointmentId
//             ? { ...appointment, status }
//             : appointment
//         )
//       );
//       toast.success(data.message);
//     } catch (error) {
//       toast.error(error.response.data.message);
//     }
//   };

//   const { isAuthenticated, admin } = useContext(Context);
//   if (!isAuthenticated) {
//     return <Navigate to={"/login"} />;
//   }

//   return (
//     <>
//       <section className="dashboard page">
//         <div className="banner">
//           <div className="firstBox">
//             <img src="/doc.png" alt="docImg" />
//             <div className="content">
//               <div>
//                 <p>Hello ,</p>
//                 <h5>{admin && `${admin.firstName} ${admin.lastName}`} </h5>
//               </div>
//               <p>
//                 Welcome to the dashboard. Manage appointments, track doctor
//                 registrations, and oversee daily operations with ease. This
//                 platform streamlines healthcare coordination and ensures smooth
//                 workflow.
//               </p>
//             </div>
//           </div>
//           <div className="secondBox">
//             <p>Total Appointments</p>
//             <h3>{totalAppointments}</h3>
//           </div>
//           <div className="thirdBox">
//             <p>Registered Doctors</p>
//             <h3>{totalDoctors}</h3>
//           </div>
//         </div>
//         <div className="banner">
//           <h5>Appointments</h5>
//           <table>
//             <thead>
//               <tr>
//                 <th>Patient</th>
//                 <th>Date</th>
//                 <th>Time</th>
//                 <th>Doctor</th>
//                 <th>Department</th>
//                 <th>Status</th>
//                 <th>Visited</th>
//               </tr>
//             </thead>
//             <tbody>
//               {appointments && appointments.length > 0
//                 ? appointments.map((appointment) => (
//                     <tr key={appointment._id}>
//                       <td>{`${appointment.firstName} ${appointment.lastName}`}</td>
//                       <td>{appointment.appointment_date.substring(0, 16)}</td>
//                       <td>{appointment.appointment_time}</td>
//                       <td>{`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</td>
//                       <td>{appointment.department}</td>
//                       <td>
//                         <select
//                           className={
//                             appointment.status === "Pending"
//                               ? "value-pending"
//                               : appointment.status === "Accepted"
//                               ? "value-accepted"
//                               : "value-rejected"
//                           }
//                           value={appointment.status}
//                           onChange={(e) =>
//                             handleUpdateStatus(appointment._id, e.target.value)
//                           }
//                         >
//                           <option value="Pending" className="value-pending">
//                             Pending
//                           </option>
//                           <option value="Accepted" className="value-accepted">
//                             Accepted
//                           </option>
//                           <option value="Rejected" className="value-rejected">
//                             Rejected
//                           </option>
//                         </select>
//                       </td>
//                       <td>
//                         {appointment.hasVisited === true ? (
//                           <GoCheckCircleFill className="green" />
//                         ) : (
//                           <AiFillCloseCircle className="red" />
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 : "No Appointments Found!"}
//             </tbody>
//           </table>

//           {}
//         </div>
//       </section>
//     </>
//   );
// };

// export default Dashboard;




import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle, AiFillDelete } from "react-icons/ai"; // Import delete icon

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/appointment/getall",
          { withCredentials: true }
        );
        setAppointments(data.appointments || []);
        setTotalAppointments(data.appointments.length || 0);
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
        setTotalDoctors(data.doctors.length || 0);
      } catch (error) {
        setTotalDoctors(0);
        console.error(
          "Error fetching doctors:",
          error.response?.data || error.message
        );
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
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status } : a))
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
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
      toast.error(error.response?.data?.message || "Failed to delete appointment.");
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
              <h5>{admin && `${admin.firstName} ${admin.lastName}`} </h5>
            </div>
            <p>
              Welcome to the dashboard. Manage appointments, track doctor
              registrations, and oversee daily operations with ease. This
              platform streamlines healthcare coordination and ensures smooth
              workflow.
            </p>
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
              <th>Status</th>
              <th>Visited</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{`${appointment.firstName} ${appointment.lastName}`}</td>
                  <td>{appointment.appointment_date.substring(0, 16)}</td>
                  <td>{appointment.appointment_time}</td>
                  <td>{`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</td>
                  <td>{appointment.department}</td>
                  <td>
                    <select
                      className={
                        appointment.status === "Pending"
                          ? "value-pending"
                          : appointment.status === "Accepted"
                          ? "value-accepted"
                          : "value-rejected"
                      }
                      value={appointment.status}
                      onChange={(e) =>
                        handleUpdateStatus(appointment._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    {appointment.hasVisited ? (
                      <GoCheckCircleFill className="green" />
                    ) : (
                      <AiFillCloseCircle className="red" />
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      className="delete-btn"
                    >
                      <AiFillDelete size={20} color="red" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No Appointments Found!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;