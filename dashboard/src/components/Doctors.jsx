import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const { isAuthenticated } = useContext(Context);
  const navigate = useNavigate();

  // 🔹 Load doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/doctors",
          { withCredentials: true }
        );
        setDoctors(data.doctors);
      } catch (error) {
        toast.error("Failed to load doctors");
      }
    };

    fetchDoctors();
  }, []);

  // 🔹 Delete doctor
  const deleteDoctor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      await axios.delete(
        `http://localhost:4000/api/v1/user/delete/doctor/${id}`,
        { withCredentials: true }
      );

      setDoctors((prev) => prev.filter((d) => d._id !== id));
      toast.success("Doctor deleted successfully");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // 🔐 Auth check
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <section className="page">
      <h1>Doctors List</h1>

      {doctors.length === 0 && <p>No doctors found</p>}

      {doctors.map((d) => (
        <div
          key={d._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
          }}
        >
          {/* 👤 Doctor Image */}
          <img
            src={d.docAvatar?.url || "/doctor.png"}
            alt="doctor"
            width="80"
            height="80"
            style={{ borderRadius: "50%" }}
          />

          <h3>
            {d.firstName} {d.lastName}
          </h3>

          <p>{d.doctorDepartment}</p>

          {/* ✏️ Edit */}
          <button onClick={() => navigate(`/doctor/edit/${d._id}`)}>
            Edit
          </button>

          {/* 🗑️ Delete */}
          <button
            style={{ marginLeft: "10px", color: "red" }}
            onClick={() => deleteDoctor(d._id)}
          >
            Delete
          </button>
        </div>
      ))}
    </section>
  );
};

export default Doctors;
