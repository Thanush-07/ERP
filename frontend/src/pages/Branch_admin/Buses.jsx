import React from "react";
import "../Company_admin/styles/CompanyDashboard.css";

export default function Buses() {
  const buses = [
    { id: "B001", number: "KA-01-AB-1234", route: "North Campus - Main Gate", driver: "Ravi Kumar", seats: 40 },
    { id: "B002", number: "KA-02-CD-5678", route: "South Campus - Library", driver: "S. Mehta", seats: 36 },
  ];

  return (
    <div className="dash-panel">
      <div className="dash-panel-head">
        <h2>Buses</h2>
        <p>Overview of buses and routes</p>
      </div>
      <div className="dash-panel-body table-scroll">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Bus ID</th>
              <th>Number</th>
              <th>Route</th>
              <th>Driver</th>
              <th>Seats</th>
            </tr>
          </thead>
          <tbody>
            {buses.map(b => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.number}</td>
                <td>{b.route}</td>
                <td>{b.driver}</td>
                <td>{b.seats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}