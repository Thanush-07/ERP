// src/pages/Institution_admin/ChangePassword.jsx
import { useState } from "react";
import axios from "axios";
import "../Institution_admin/styles/ChangePassword.css";
import "../Institution_admin/styles/Dashboard.css";

const API_URL = "http://localhost:5000/api/auth/change-password";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!userId) {
      setError("User not found in session.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(API_URL, {
        userId,
        currentPassword,
        newPassword,
      });
      setMsg(res.data.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="dash-wrapper">
    <div className="dash-inner cp-inner">
      <div className="dash-header cp-header">
        <div>
          <h1>Change Password</h1>
          <p>Update your institution admin account password.</p>
        </div>
      </div>

      <div className="cp-card">
          <form className="inst-form" onSubmit={handleSubmit}>
          <div className="fp-field">
            <label>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="fp-field">
            <label>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="fp-field">
            <label>Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {msg && <p className="fp-success">{msg}</p>}
          {error && <p className="fp-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  </div>
);
}