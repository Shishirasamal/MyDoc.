import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ================= OTP TIMER ================= */
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  /* ================= STEP 1: SEND OTP ================= */
  const sendOtp = async () => {
    if (!email) return toast.error("Email is required");

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/send-otp",
        { email }
      );

      toast.success(res.data.message);
      setStep(2);
      setTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP 2: VERIFY OTP ================= */
  const verifyOtp = async () => {
    if (!otp) return toast.error("OTP is required");

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/verify-otp",
        { email, otp }
      );

      toast.success(res.data.message);
      setStep(3); // move to reset password
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP 3: RESET PASSWORD (FIXED) ================= */
  const resetPassword = async () => {
    if (!password || !confirmPassword) {
      return toast.error("All fields are required");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/reset-password",
        {
          email,
          password,
          confirmPassword, // ✅ THIS WAS MISSING
        }
      );

      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <section className="container form-component">
      <div className="auth-box fade">

        {step === 1 && (
          <>
            <h3>Forgot Password</h3>
            <input
              type="email"
              placeholder="Registered Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={sendOtp} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h3>Enter OTP</h3>
            <input
              maxLength="6"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOtp} disabled={loading}>
              Verify OTP
            </button>

            <p>
              {timer > 0 ? `Resend OTP in ${timer}s` : "Didn’t get OTP?"}
            </p>

            <button onClick={sendOtp} disabled={timer > 0 || loading}>
              Resend OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h3>Reset Password</h3>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={resetPassword} disabled={loading}>
              Reset Password
            </button>
          </>
        )}

      </div>
    </section>
  );
};

export default ForgotPassword;
