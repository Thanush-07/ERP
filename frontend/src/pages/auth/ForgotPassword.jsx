// src/pages/Auth/ForgotPassword.jsx
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./styles/Login.css"; // reuse the same CSS
import ematixLogo from "../../assets/ematix.png";

const API_URL = "http://localhost:5000/api/auth/forgot-password";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(API_URL, { email });
      setMsg(res.data.message || "Password reset link has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enterprise-container">
      {/* LEFT SIDE */}
      <div className="enterprise-left">
        <img src={ematixLogo} alt="Ematix Logo" className="left-logo" />
        <div className="left-text">
          <h1 className="left-title">Ematix School Management ERP</h1>
          <p>
            A complete cloud-based enterprise school management system.
            Manage students, staff, attendance, academics, fees & more.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="enterprise-right">
        <div className="form-box glass-card">
          <h2>Forgot Password</h2>
          <p className="form-sub">Enter your registered email</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="admin@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {msg && <div className="success">{msg}</div>}
            {error && <div className="error">{error}</div>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="forgot-link">
              <Link to="/login">Back to Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
