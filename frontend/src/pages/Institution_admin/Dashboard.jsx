import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Dashboard.css";

const API_URL_BASE = "http://localhost:5000/api/institution";

export default function InstitutionDashboard() {
  const [totals, setTotals] = useState(null);
  const [branches, setBranches] = useState([]);
  const [recent, setRecent] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");

  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const institutionId = user?.institution_id || user?.institutionId || null;
  const adminName = user?.name || user?.email || "Admin";

  const loadData = async (branchId = "") => {
    if (!institutionId) return;
    setLoading(true);
    try {
      const params = branchId ? { branchId } : {};
      const res = await axios.get(
        `${API_URL_BASE}/${institutionId}/dashboard`,
        { params }
      );

      setInstitution(res.data.institution || null);
      setTotals(
        res.data.totals || {
          branches: 0,
          students: 0,
          feeCollected: 0,
          feePending: 0,
          feeCollectionCount: 0,
          feePendingCount: 0
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
        feePending: 0,
        feeCollectionCount: 0,
        feePendingCount: 0
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

  const handleBranchFilterChange = (e) => {
    const branchId = e.target.value;
    setSelectedBranch(branchId);
    loadData(branchId);
  };

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
      <div className="dash-header inst-header" data-aos="fade-down">
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
              Overview of branches, students and fee collected in this institution.
              {selectedBranch && (
                <span style={{ color: "#6b7280", marginLeft: 8 }}>
                  (Filtered: {branches.find(b => b._id === selectedBranch)?.branch_name || "Selected Branch"})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="dash-filter" style={{ minWidth: 220 }}>
          <label>Branch</label>
          <select value={selectedBranch} onChange={handleBranchFilterChange}>
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.branch_name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <span className="dash-hint">Refreshing data…</span>
        )}
      </div>

      {/* Welcome message below header */}
      <div className="welcome-banner" data-aos="fade-up">
        Welcome, {adminName}
      </div>

      <div className="dash-cards" data-aos="fade-up">
        <div className="dash-card" data-aos="fade-up" data-aos-delay="100">
          <span className="dash-card-label">Branches</span>
          <span className="dash-card-value">{totals.branches}</span>
        </div>

        <div className="dash-card" data-aos="fade-up" data-aos-delay="200">
          <span className="dash-card-label">Students</span>
          <span className="dash-card-value">{totals.students}</span>
        </div>

        <div className="dash-card" data-aos="fade-up" data-aos-delay="300">
          <span className="dash-card-label">Fee Collected</span>
          <span className="dash-card-value">
            ₹ {(totals.feeCollected || 0).toLocaleString()}
          </span>
          <span className="dash-card-note">
            {totals.feeCollectionCount || 0} payments collected
          </span>
        </div>

        <div className="dash-card" data-aos="fade-up" data-aos-delay="400">
          <span className="dash-card-label">Pending Fees</span>
          <span className="dash-card-value">
            ₹ {(totals.feePending || 0).toLocaleString()}
          </span>
          <span className="dash-card-note">
            {totals.feePendingCount || 0} payments pending
          </span>
        </div>
      </div>

      <div className="dash-bottom">
        <section className="dash-panel" data-aos="fade-up">
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

        <section className="dash-panel" data-aos="fade-up" data-aos-delay="100">
          <div className="dash-panel-head">
            <h2>Recent Activity</h2>
            <p>Latest changes within this institution</p>
          </div>

          <div className="dash-panel-body">
            {/* Filter moved to header; recent activity respects selectedBranch */}

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
