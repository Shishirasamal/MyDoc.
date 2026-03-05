import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AppointmentForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [department, setDepartment] = useState("Pediatrics");
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [doctorLastName, setDoctorLastName] = useState("");
  const [address, setAddress] = useState("");
  const [hasVisited, setHasVisited] = useState(false);
  const [consultationType, setConsultationType] = useState("Offline");

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
    "Anaesthesiology",
    "Cardio-Thoracic & Vascular Surgery",
    "Endocrinology",
    "Gastroenterology",
    "General Medicine",
    "General Surgery",
  ];

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await axios.get(
        "http://localhost:4000/api/v1/user/doctors",
        { withCredentials: true }
      );
      setDoctors(data.doctors);
    };
    fetchDoctors();
  }, []);

  const handleAppointment = async (e) => {
    e.preventDefault();

    /* ✅ Aadhaar Validation */
    if (!/^\d{12}$/.test(nic)) {
      toast.error("Aadhaar number must be exactly 12 digits.");
      return;
    }

    /* ✅ DOB Future Check */
    const today = new Date();
    const birthDate = new Date(dob);

    if (birthDate > today) {
      toast.error("Date of Birth cannot be a future date.");
      return;
    }

    try {
      const hasVisitedBool = Boolean(hasVisited);

      const { data } = await axios.post(
        "http://localhost:4000/api/v1/appointment/post",
        {
          firstName,
          lastName,
          email,
          phone,
          nic,
          dob,
          gender,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          department,
          doctor_firstName: doctorFirstName,
          doctor_lastName: doctorLastName,
          consultationType,
          hasVisited: hasVisitedBool,
          address,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(data.message);

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setNic("");
      setDob("");
      setGender("");
      setAppointmentDate("");
      setAppointmentTime("");
      setDepartment("Pediatrics");
      setDoctorFirstName("");
      setDoctorLastName("");
      setHasVisited(false);
      setAddress("");
      setConsultationType("Offline");

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container form-component appointment-form">
      <h2>Appointment</h2>
      <form onSubmit={handleAppointment}>

        <div>
          <input
            type="text"
            pattern="[A-Za-z\s]+"
            title="Only letters allowed"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <input
            type="text"
            pattern="[A-Za-z\s]+"
            title="Only letters allowed"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Mobile Number"
            value={phone}
            maxLength="10"
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, ""))
            }
            required
          />
        </div>

        <div>
          {/* ✅ Aadhaar Fixed */}
          <input
            type="text"
            placeholder="Aadhaar Number"
            value={nic}
            maxLength="12"
            onChange={(e) =>
              setNic(e.target.value.replace(/\D/g, ""))
            }
            required
          />

          {/* ✅ DOB Future Disabled */}
          <input
            type="date"
            value={dob}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>

        <div>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
          </select>

          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />

          <input
            type="time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            required
          />
        </div>

        <div>
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setDoctorFirstName("");
              setDoctorLastName("");
            }}
          >
            {departmentsArray.map((depart, index) => (
              <option value={depart} key={index}>
                {depart}
              </option>
            ))}
          </select>

          <select
            value={
              doctorFirstName && doctorLastName
                ? `${doctorFirstName} ${doctorLastName}`
                : ""
            }
            onChange={(e) => {
              const selectedDoctor = doctors.find(
                (doctor) =>
                  `${doctor.firstName} ${doctor.lastName}` === e.target.value
              );
              if (selectedDoctor) {
                setDoctorFirstName(selectedDoctor.firstName);
                setDoctorLastName(selectedDoctor.lastName);
              }
            }}
            disabled={!department}
          >
            <option value="">Select Doctor</option>

            {doctors
              .filter((doctor) => doctor.doctorDepartment === department)
              .map((doctor, index) => (
                <option
                  value={`${doctor.firstName} ${doctor.lastName}`}
                  key={index}
                >
                  {doctor.firstName} {doctor.lastName}
                </option>
              ))}
          </select>
        </div>

        <textarea
          rows="5"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          required
        />

        <div style={{ marginTop: "15px" }}>
          <p><b>Consultation Type:</b></p>

          <label>
            <input
              type="radio"
              value="Offline"
              checked={consultationType === "Offline"}
              onChange={(e) => setConsultationType(e.target.value)}
            />
            Offline Visit
          </label>

          <label style={{ marginLeft: "20px" }}>
            <input
              type="radio"
              value="Online"
              checked={consultationType === "Online"}
              onChange={(e) => setConsultationType(e.target.value)}
            />
            Online Video Call
          </label>
        </div>

        <div
          style={{
            gap: "10px",
            justifyContent: "flex-end",
            flexDirection: "row",
            marginTop: "15px",
          }}
        >
          <p style={{ marginBottom: 0 }}>Have you visited before?</p>

          <input
            type="checkbox"
            checked={hasVisited}
            onChange={(e) => setHasVisited(e.target.checked)}
            style={{ flex: "none", width: "25px" }}
          />
        </div>

        <button style={{ margin: "20px auto", cursor: "pointer" }}>
          GET APPOINTMENT
        </button>

      </form>
    </div>
  );
};

export default AppointmentForm;