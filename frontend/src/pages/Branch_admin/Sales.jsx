import React from "react";
import "../Company_admin/styles/CompanyDashboard.css";

export default function Sales() {
  const summary = {
    today: 4200,
    week: 31200,
    month: 128000,
  };

  return (
    <div>
      <div className="dash-panel">
        <div className="dash-panel-head">
          <h2>Sales</h2>
          <p>Overview of recent sales</p>
        </div>
        <div className="dash-panel-body">
          <div className="dash-cards">
            <div className="dash-card">
              <span className="dash-card-label">Today</span>
              <div className="dash-card-value">₹ {summary.today}</div>
            </div>
            <div className="dash-card">
              <span className="dash-card-label">This Week</span>
              <div className="dash-card-value">₹ {summary.week}</div>
            </div>
            <div className="dash-card">
              <span className="dash-card-label">This Month</span>
              <div className="dash-card-value">₹ {summary.month}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}