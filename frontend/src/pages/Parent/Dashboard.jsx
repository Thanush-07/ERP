import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Parent.css";

const API_BASE = "http://localhost:5000/api/parent";

export default function ParentDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [fees, setFees] = useState(null);
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesError, setFeesError] = useState("");

  useEffect(() => {
    if (user?.role !== "parent") {
      navigate("/login");
      return;
    }
    loadStudentData();
  }, []);

  useEffect(() => {
    if (activeTab === "fees" && !fees && !feesLoading) {
      loadFees();
    }
  }, [activeTab, fees, feesLoading]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/${user.id}/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudent(res.data);
    } catch (err) {
      console.error("Failed to load student data", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFees = async () => {
    try {
      setFeesError("");
      setFeesLoading(true);
      const res = await axios.get(`${API_BASE}/${user.id}/fees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFees(res.data);
    } catch (err) {
      console.error("Failed to load fees", err);
      setFeesError("Failed to load fee information. Please try again.");
    } finally {
      setFeesLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="parent-page">
        <div className="parent-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="parent-page">
        <div className="parent-container">
          <div className="parent-guard">
            <h3>Student Information Not Found</h3>
            <p>We couldn't find student information linked to your account.</p>
            <button className="btn-primary" onClick={handleLogout}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-page">
      <div className="parent-container">
        {/* Header */}
        <div className="parent-header">
          <div className="parent-header-info">
            <h1>Welcome, {user.name}!</h1>
            <p>View your child's progress, marks, and fee status</p>
          </div>
          <div className="parent-header-actions">
            <button className="btn-ghost" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="student-info-card">
          <div className="student-info-header">
            {student.image && (
              <div className="student-image-container">
                <img src={student.image} alt={student.name} className="student-image" />
              </div>
            )}
            <div className="student-info-grid">
              <div className="info-item">
                <label>Student Name</label>
                <p>{student.name}</p>
              </div>
              <div className="info-item">
                <label>Class & Section</label>
                <p>{student.class} - {student.section}</p>
              </div>
              <div className="info-item">
                <label>Roll Number</label>
                <p>{student.rollNo}</p>
              </div>
              <div className="info-item">
                <label>Admission Number</label>
                <p>{student.admissionNumber}</p>
              </div>
              <div className="info-item">
                <label>Academic Year</label>
                <p>{student.academicYear}</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p>
                  <span className={`badge ${student.status === "active" ? "success" : "muted"}`}>
                    {student.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="parent-tabs">
          <button
            className={`parent-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview
          </button>
          <button
            className={`parent-tab ${activeTab === "marks" ? "active" : ""}`}
            onClick={() => setActiveTab("marks")}
          >
            📝 Marks & Results
          </button>
          <button
            className={`parent-tab ${activeTab === "fees" ? "active" : ""}`}
            onClick={() => setActiveTab("fees")}
          >
            💳 Fee Status
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="student-overview">
            <div className="student-info-card">
              <h3>Personal Information</h3>
              <div className="student-info-grid">
                <div className="info-item">
                  <label>Date of Birth</label>
                  <p>{student.dateOfBirth || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Address</label>
                  <p>{student.address}</p>
                </div>
                <div className="info-item">
                  <label>Phone Number</label>
                  <p>{student.phoneNo}</p>
                </div>
                <div className="info-item">
                  <label>Aadhar Card</label>
                  <p>{student.aadharCardNumber || "Not provided"}</p>
                </div>
              </div>
              
              {student.customNote && (
                <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f5f5f5", borderRadius: "6px" }}>
                  <strong>Special Notes:</strong>
                  <p style={{ margin: "0.5rem 0 0 0" }}>{student.customNote}</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: "2rem" }}>
              <Link to="/parent/reports" className="btn-primary" style={{ display: "inline-block" }}>
                View Detailed Reports
              </Link>
            </div>
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === "marks" && (
          <div className="marks-section">
            <h3>Academic Performance</h3>
            <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
              <p>Detailed marks and exam results are available in the Reports section.</p>
              <Link to="/parent/reports?tab=marks" className="btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
                View Full Reports
              </Link>
            </div>
          </div>
        )}

        {/* Fees Tab */}
        {activeTab === "fees" && (
          <div className="fees-section">
            <h3>Fee Information</h3>

            {feesLoading && (
              <div className="empty-state">
                <p>Loading fee information...</p>
              </div>
            )}

            {feesError && !feesLoading && (
              <div className="empty-state">
                <p>{feesError}</p>
                <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={loadFees}>
                  Retry
                </button>
              </div>
            )}

            {!feesLoading && fees && (
              <>
                {/* Summary */}
                <div className="fees-summary">
                  <div className="fee-card">
                    <h4>Total Fee</h4>
                    <p className="fee-value">₹{Number(fees.feeStructureTotal || 0).toLocaleString("en-IN")}</p>
                    <small>For {fees.student?.class}{fees.student?.section ? ` - ${fees.student.section}` : ""}</small>
                  </div>
                  <div className="fee-card success">
                    <h4>Paid</h4>
                    <p className="fee-value">₹{Number(fees.paidTotal || 0).toLocaleString("en-IN")}</p>
                    <small>Approved payments</small>
                  </div>
                  <div className="fee-card pending">
                    <h4>Remaining</h4>
                    <p className="fee-value">₹{Number(fees.pendingAmount || 0).toLocaleString("en-IN")}</p>
                    <small>Pending to be paid</small>
                  </div>
                </div>

                {/* Per-Category Breakdown */}
                <div className="fee-structure">
                  <div className="fee-structure-header">
                    <h4>Category-wise Status</h4>
                    <p className="fee-structure-subtitle">Detailed fee payment breakdown by category</p>
                  </div>
                  <div className="category-cards-grid">
                    {Object.entries(fees.feeStructure || {}).length === 0 && (
                      <div className="empty-state" style={{ padding: "1.25rem", background: "#f9f9f9", borderRadius: 8, gridColumn: "1 / -1" }}>
                        <p>Fee structure not configured for this class.</p>
                      </div>
                    )}

                    {Object.entries(fees.feeStructure || {}).map(([category, total]) => {
                      const approvedPayments = (fees.payments || []).filter(p => (p.status === "approved" || !p.status) && p.category === category);
                      const paid = approvedPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
                      const remaining = Math.max(0, Number(total || 0) - paid);
                      const percentagePaid = Number(total) > 0 ? Math.round((paid / Number(total)) * 100) : 0;
                      const status = remaining === 0 ? "paid" : remaining < Number(total) * 0.3 ? "partial" : "pending";
                      
                      return (
                        <div key={category} className={`category-card category-card-${status}`}>
                          <div className="category-header">
                            <h5 className="category-name">{category}</h5>
                            <span className={`status-badge status-${status}`}>
                              {status === "paid" ? "✓ Paid" : status === "partial" ? "⏳ Partial" : "⏸ Pending"}
                            </span>
                          </div>
                          
                          <div className="category-amounts">
                            <div className="amount-row">
                              <span className="amount-label">Total Fee</span>
                              <span className="amount-value">₹{Number(total || 0).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="amount-row">
                              <span className="amount-label">Paid</span>
                              <span className="amount-value paid">₹{paid.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="amount-row">
                              <span className="amount-label">Remaining</span>
                              <span className="amount-value remaining">₹{remaining.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                          
                          <div className="progress-container">
                            <div className="progress-label">
                              <span>Payment Progress</span>
                              <span className="progress-percent">{percentagePaid}%</span>
                            </div>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ 
                                  width: `${percentagePaid}%`,
                                  background: status === "paid" ? "linear-gradient(90deg, #11998e, #38ef7d)" : status === "partial" ? "linear-gradient(90deg, #667eea, #764ba2)" : "linear-gradient(90deg, #f093fb, #f5576c)"
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment History */}
                <div className="payment-history">
                  <h4>Payment History</h4>
                  {(fees.payments || []).filter(p => (p.status === "approved" || !p.status)).length === 0 ? (
                    <div className="empty-state" style={{ padding: "1.25rem", background: "#f9f9f9", borderRadius: 8 }}>
                      <p>No approved payments found.</p>
                    </div>
                  ) : (
                    <div className="payment-list">
                      {(fees.payments || []).filter(p => (p.status === "approved" || !p.status)).map((p) => (
                        <div key={p._id} className="payment-item">
                          <div>
                            <div style={{ fontWeight: 600, color: "#333" }}>{p.category || "General"}</div>
                            <div className="payment-date">{new Date(p.date || p.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="payment-amount">₹{Number(p.amount || 0).toLocaleString("en-IN")}</div>
                            {p.mode && <div className="payment-mode" style={{ marginTop: 4 }}>{p.mode}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                  <Link to="/parent/reports?tab=fees" className="btn-primary" style={{ display: "inline-block" }}>
                    View Detailed Fee Reports
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}