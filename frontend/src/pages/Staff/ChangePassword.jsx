import { useState } from "react";
import axios from "axios";
import "./styles/Staff.css";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth/change-password";

export default function StaffChangePassword() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }
    try {
      setSaving(true);
      await axios.post(API_URL, {
        userId: user?.id,
        currentPassword,
        newPassword,
      });
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== "staff") {
    return (
      <div className="staff-guard">
        <h3>Access restricted</h3>
        <p>You need a staff account to change password.</p>
        <Link to="/login" className="btn-secondary">Go to login</Link>
      </div>
    );
  }

  return (
    <div className="staff-page">
      <div className="staff-card">
        <div className="card-header">
          <div>
            <h3>Change Password</h3>
            <p className="muted">Update your staff account password</p>
          </div>
        </div>

        {message && <div className="info-banner">{message}</div>}

        <form className="edit-form" onSubmit={handleSubmit}>
          <label>
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update password"}
            </button>
            <Link to="/staff/dashboard" className="btn-ghost">Back to dashboard</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
