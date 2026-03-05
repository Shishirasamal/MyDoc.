import React, { useContext, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";
 
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/login",
        { email, password, confirmPassword, role: "Admin" },
        { withCredentials: true }
      );

      toast.success(res.data.message);
      setIsAuthenticated(true);
      navigateTo("/");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  if (isAuthenticated) return <Navigate to="/" />;

  return (
    <section
      className="container form-component"
      style={{
        backgroundImage:
          "url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkUvhi-mYdaquhn2WlKlHKiP6VEQQ0izxhKg&s)",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <img src="/logo.png" alt="logo" className="logo" style={{ height: "270px" }} />

      <h1 className="form-title">Welcome To MyDoc..</h1>
      <p><b>Only Admins & Doctors Are Allowed To Access These Resources!</b></p>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ✅ FORGOT PASSWORD LINK */}
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <Link to="/forgot-password" style={{ fontSize: "14px", color: "#fff" }}>
            Forgot Password?
          </Link>
        </div>

        <button type="submit">Login</button>
      </form>
    </section>
  );
};

export default Login;
