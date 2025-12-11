import { useState } from "react";
import axios from "axios";
import "./styles/ForgotPassword.css";

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
    <div className="fp-wrapper">
      <div className="fp-card">

        <div className="fp-header">
          <h2>Forgot Password</h2>
          <p>Enter your registered email to receive a password reset link.</p>
        </div>

        <form className="fp-form" onSubmit={handleSubmit}>
          <div className="fp-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="admin@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {msg && <p className="fp-success">{msg}</p>}
          {error && <p className="fp-error">{error}</p>}

          <button type="submit" className="fp-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="fp-footer">
            <a href="/login">Back to Login</a>
          </div>
        </form>

      </div>
    </div>
  );
}
