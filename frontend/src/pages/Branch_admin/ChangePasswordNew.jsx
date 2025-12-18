import React from "react";
import "../Company_admin/styles/CompanyDashboard.css";

export default function ChangePassword() {
  return (
    <div className="dash-panel">
      <div className="dash-panel-head">
        <h2>Change Password</h2>
        <p>Update your account password</p>
      </div>
      <div className="dash-panel-body">
        <form className="change-pass-form" onSubmit={(e) => e.preventDefault()}>
          <div style={{ marginBottom: 12 }}>
            <label>Current Password</label>
            <input type="password" name="currentPassword" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>New Password</label>
            <input type="password" name="newPassword" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Confirm New Password</label>
            <input type="password" name="confirmPassword" />
          </div>
          <button className="report-type-btn" type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
}
