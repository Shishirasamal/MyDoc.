import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    doctorDepartment: "",
    doctorIdNo: "",
    experience: "",
    address: "",
  });

  // ✅ FETCH SINGLE DOCTOR
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:4000/api/v1/user/doctor/${id}`,
          { withCredentials: true }   // 🔥 REQUIRED
        );

        const doctor = data.doctor;

        setFormData({
          firstName: doctor.firstName || "",
          lastName: doctor.lastName || "",
          phone: doctor.phone || "",
          doctorDepartment: doctor.doctorDepartment || "",
          doctorIdNo: doctor.doctorIdNo || "",
          experience: doctor.experience || "",
          address: doctor.address || "",
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load doctor");
      }
    };

    fetchDoctor();
  }, [id]);

  // INPUT CHANGE
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // UPDATE DOCTOR
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:4000/api/v1/user/update/doctor/${id}`,
        formData,
        { withCredentials: true }   // 🔥 REQUIRED
      );

      toast.success("Doctor updated successfully");
      navigate("/doctors");
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  return (
    <section className="page">
      <h1>Edit Doctor</h1>

      <form onSubmit={handleSubmit} className="add-doctor-form">
        <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
        <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
        <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />

        <select name="doctorDepartment" value={formData.doctorDepartment} onChange={handleChange}>
          <option value="">Select Department</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology">Neurology</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Cardio-Thoracic & Vascular">Cardio-Thoracic & Vascular</option>
        </select>

        <input name="doctorIdNo" placeholder="Doctor ID Number" value={formData.doctorIdNo} onChange={handleChange} />
        <input name="experience" type="number" placeholder="Experience (Years)" value={formData.experience} onChange={handleChange} />
        <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} />

        <button type="submit">Update Doctor</button>
      </form>
    </section>
  );
};

export default EditDoctor;
