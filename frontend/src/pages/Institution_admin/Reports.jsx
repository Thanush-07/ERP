// src/pages/Institution_admin/Reports.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../Company_admin/styles/CompanyDashboard.css";

const API_BASE = "http://localhost:5000/api/institution";

export default function InstitutionReports() {
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const institutionId = user.institutionId || user.institution_id || null;

  const loadBranches = async () => {
    if (!institutionId) return;
    try {
      const res = await axios.get(
        `${API_BASE}/${institutionId}/branches`
      );
      setBranches(res.data);
    } catch (err) {
      console.error(
        "INSTITUTION REPORT BRANCHES ERROR",
        err.response?.data || err.message
      );
    }
  };

  const loadReport = async (branchId = "") => {
    if (!institutionId) return;
    setLoading(true);
    try {
      const params = {};
      if (branchId) params.branchId = branchId;
      const res = await axios.get(
        `${API_BASE}/${institutionId}/report`,
        { params }
      );
      setStats(res.data.branches || []);
    } catch (err) {
      console.error(
        "INSTITUTION REPORT ERROR",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId]);

  const handleBranchChange = (e) => {
    const value = e.target.value;
    setSelectedBranch(value);
    loadReport(value || "");
  };

  return (
    <div className="dash-wrapper">
      <div className="dash-header">
        <div>
          <h1>Institution Reports</h1>
          <p>Summary of branches under this institution.</p>
        </div>

        <div className="dash-filter">
          <label>Branch</label>
          <select value={selectedBranch} onChange={handleBranchChange}>
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.branch_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="dash-hint">Loading report…</p>}

      <div className="dash-card">
        <div className="dash-panel-body">
          <table className="dash-table">
            <thead>
              <tr>
                <th align="left">Branch</th>
                <th align="right">Students</th>
                <th align="right">Fee collected</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => (
                <tr key={row.branchId}>
                  <td>{row.branchName}</td>
                  <td align="right">{row.students}</td>
                  <td align="right">
                    ₹ {Number(row.feeCollected || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {stats.length === 0 && !loading && (
                <tr>
                  <td colSpan="3" className="dash-empty">
                    No data for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
