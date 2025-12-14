// src/pages/Institution_admin/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../Company_admin/styles/CompanyDashboard.css";

const API_URL_BASE = "http://localhost:5000/api/institution";

export default function InstitutionDashboard() {
  const [totals, setTotals] = useState(null);
  const [branches, setBranches] = useState([]);
  const [recent, setRecent] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);

  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const institutionId = user?.institution_id || user?.institutionId || null;

  const loadData = async () => {
    if (!institutionId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL_BASE}/${institutionId}/dashboard`
      );

      setInstitution(res.data.institution || null);
      setTotals(
        res.data.totals || {
          branches: 0,
          students: 0,
          feeCollected: 0,
        }
      );
      setBranches(res.data.branches || []);
      setRecent(res.data.recentActivities || []);
    } catch (err) {
      console.error("INST DASH ERROR", err.response?.data || err.message);
      setInstitution(null);
      setTotals({
        branches: 0,
        students: 0,
        feeCollected: 0,
      });
      setBranches([]);
      setRecent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId]);

  if (!institutionId) {
    return (
      <div className="dash-wrapper">
        <div className="dash-card">
          Institution not set for this admin.
        </div>
      </div>
    );
  }

  if (!totals) {
    return (
      <div className="dash-wrapper">
        <div className="dash-card">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dash-wrapper">
      <div className="dash-header inst-header">
        <div className="inst-header-main">
          {institution && (
            <img
              className="inst-logo"
              src={`${API_URL_BASE}/${institutionId}/logo`}
              alt={institution.name}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
          <div>
            <h1>{institution?.name || "Institution Dashboard"}</h1>
            <p>
              Overview of branches, students and fee collected in this
              institution.
            </p>
          </div>
        </div>

        {loading && (
          <span className="dash-hint">Refreshing data…</span>
        )}
      </div>

      <div className="dash-cards">
        <div className="dash-card">
          <span className="dash-card-label">Branches</span>
          <span className="dash-card-value">{totals.branches}</span>
        </div>

        <div className="dash-card">
          <span className="dash-card-label">Students</span>
          <span className="dash-card-value">{totals.students}</span>
        </div>

        <div className="dash-card">
          <span className="dash-card-label">Fee Collected</span>
          <span className="dash-card-value">
            ₹ {totals.feeCollected.toLocaleString()}
          </span>
          <span className="dash-card-note">
            Institution-wide fee collection
          </span>
        </div>
      </div>

      <div className="dash-bottom">
        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2>Branches</h2>
            <p>All branches under this institution</p>
          </div>

          <div className="dash-panel-body">
            <div className="table-scroll">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Location</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b) => (
                    <tr key={b._id}>
                      <td>{b.branch_name}</td>
                      <td>{b.location}</td>
                      <td>{b.contactPhone}</td>
                    </tr>
                  ))}
                  {branches.length === 0 && (
                    <tr>
                      <td colSpan="3" className="dash-empty">
                        No branches found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2>Recent Activity</h2>
            <p>Latest changes within this institution</p>
          </div>

          <div className="dash-panel-body">
            {recent.length === 0 && (
              <p className="dash-empty">No recent activity</p>
            )}

            <ul className="dash-activity">
              {recent.map((item) => (
                <li key={item.id}>
                  <div className="dash-activity-title">
                    {item.description}
                  </div>
                  <div className="dash-activity-meta">
                    {item.when} • {item.by}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
