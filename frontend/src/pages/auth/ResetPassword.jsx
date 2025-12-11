import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Login.css";
const API_URL = "http://localhost:5000/api/auth/reset-password";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      const res = await axios.post(`${API_URL}/${token}`, { password });
      setMsg(res.data.message || "Password reset successful");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired link");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-right" style={{ width: "100%" }}>
          <h2 className="auth-title">Set new password</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {msg && <p style={{ color: "#22c55e", fontSize: 13 }}>{msg}</p>}
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="auth-button">
              Reset password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
