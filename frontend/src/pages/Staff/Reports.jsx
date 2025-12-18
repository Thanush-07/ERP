import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./styles/Staff.css";

const API_BASE = "http://localhost:5000/api/staff";

export default function Reports() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const isStaff = user?.role === "staff";

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and calculation inputs
  const [criteria, setCriteria] = useState({
    daysRange: 30,
    minAttendancePercent: 0,
    feesCategory: "all",
    marksCategory: "all"
  });

  // Fee and marks input
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeData, setFeeData] = useState({
    studentId: "",
    amount: "",
    category: "tuition", // tuition, transport, hostel, books, uniform
    note: ""
  });

  const [marksData, setMarksData] = useState({
    studentId: "",
    subject: "Overall", // Overall, Math, English, Science, etc.
    marks: "",
    totalMarks: 100
  });

  const attendancePercentageFilters = [50, 60, 70, 80, 90];

  useEffect(() => {
    if (!isStaff || !user?.id) return;
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, attendanceRes] = await Promise.all([
        axios.get(`${API_BASE}/${user.id}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/${user.id}/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStudents(studentsRes.data || []);
      setAttendance(attendanceRes.data || []);
    } catch (err) {
      console.error("Failed to load report data", err);
      alert("Could not load attendance and student data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance percentage for each student
  const studentAttendanceStats = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - criteria.daysRange * 24 * 60 * 60 * 1000);

    return students.map((st) => {
      const studentAttendance = attendance.filter(
        (rec) =>
          rec.studentId === st._id &&
          new Date(rec.date) >= cutoffDate &&
          new Date(rec.date) <= now
      );

      const presentCount = studentAttendance.filter((rec) => rec.status === "present").length;
      const totalDays = studentAttendance.length || 1;
      const percentage = Math.round((presentCount / totalDays) * 100);

      return {
        ...st,
        presentCount,
        totalDays,
        attendancePercentage: percentage
      };
    });
  }, [students, attendance, criteria.daysRange]);

  // Filter students based on attendance percentage
  const filteredStudents = useMemo(() => {
    return studentAttendanceStats.filter(
      (st) => st.attendancePercentage >= criteria.minAttendancePercent
    );
  }, [studentAttendanceStats, criteria.minAttendancePercent]);

  const handleCriteriaChange = (field, value) => {
    setCriteria((prev) => ({ ...prev, [field]: value }));
  };

  const handlePercentageFilter = (percent) => {
    setCriteria((prev) => ({ ...prev, minAttendancePercent: percent }));
  };

  const handleFeeInputChange = (field, value) => {
    setFeeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMarksInputChange = (field, value) => {
    setMarksData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isStaff) {
    return (
      <div className="staff-guard">
        <h3>Access restricted</h3>
        <p>You need a staff account to view reports.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="staff-loading">Loading report data...</div>;
  }

  return (
    <div className="staff-page">
      <div className="staff-card">
        <div className="card-header">
          <div>
            <h2>Reports & Analytics</h2>
            <p className="muted">Attendance analysis, fees tracking, and marks entry</p>
          </div>
        </div>
      </div>

      {/* Attendance Criteria Section */}
      <div className="staff-card">
        <div className="card-header">
          <h3>Attendance Analysis</h3>
        </div>

        <div className="report-filters">
          <div className="filter-group">
            <label>
              Days to analyze
              <input
                type="number"
                min="1"
                max="365"
                value={criteria.daysRange}
                onChange={(e) => handleCriteriaChange("daysRange", parseInt(e.target.value))}
              />
            </label>
          </div>

          <div className="filter-group">
            <label>
              Minimum attendance percentage
              <input
                type="number"
                min="0"
                max="100"
                value={criteria.minAttendancePercent}
                onChange={(e) => handleCriteriaChange("minAttendancePercent", parseInt(e.target.value))}
              />
            </label>
          </div>

          <div className="filter-group">
            <label>
              Fees Category (Optional)
              <select
                value={criteria.feesCategory}
                onChange={(e) => handleCriteriaChange("feesCategory", e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="tuition">Tuition Fees</option>
                <option value="transport">Transport Fees</option>
                <option value="hostel">Hostel Fees</option>
                <option value="books">Books & Materials</option>
                <option value="uniform">Uniform</option>
              </select>
            </label>
          </div>
        </div>

        <div className="percentage-filters">
          <p className="filter-label">Quick filter by attendance percentage:</p>
          <div className="filter-buttons">
            {attendancePercentageFilters.map((percent) => (
              <button
                key={percent}
                className={`filter-btn ${criteria.minAttendancePercent === percent ? "active" : ""}`}
                onClick={() => handlePercentageFilter(percent)}
              >
                {percent}%+
              </button>
            ))}
            <button
              className={`filter-btn ${criteria.minAttendancePercent === 0 ? "active" : ""}`}
              onClick={() => handlePercentageFilter(0)}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Fee Entry Section */}
      <div className="staff-card">
        <div className="card-header">
          <h3>Record Fee Payment</h3>
        </div>

        <div className="fee-entry-form">
          <div className="form-group">
            <label>
              Select Student
              <select
                value={feeData.studentId}
                onChange={(e) => handleFeeInputChange("studentId", e.target.value)}
              >
                <option value="">Choose a student</option>
                {students.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} - Class {st.class}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Fee Category
                <select
                  value={feeData.category}
                  onChange={(e) => handleFeeInputChange("category", e.target.value)}
                >
                  <option value="tuition">Tuition Fees</option>
                  <option value="transport">Transport Fees</option>
                  <option value="hostel">Hostel Fees</option>
                  <option value="books">Books & Materials</option>
                  <option value="uniform">Uniform</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>

            <div className="form-group">
              <label>
                Amount (₹)
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={feeData.amount}
                  onChange={(e) => handleFeeInputChange("amount", e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>
              Notes (optional)
              <input
                type="text"
                placeholder="e.g. Partial payment, received cash"
                value={feeData.note}
                onChange={(e) => handleFeeInputChange("note", e.target.value)}
              />
            </label>
          </div>

          <button className="btn-primary">Record Fee Payment</button>
        </div>
      </div>

      {/* Marks Entry Section */}
      <div className="staff-card">
        <div className="card-header">
          <h3>Record Student Marks</h3>
        </div>

        <div className="marks-entry-form">
          <div className="form-group">
            <label>
              Select Student
              <select
                value={marksData.studentId}
                onChange={(e) => handleMarksInputChange("studentId", e.target.value)}
              >
                <option value="">Choose a student</option>
                {students.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} - Class {st.class}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Subject/Category
                <input
                  type="text"
                  placeholder="e.g. Overall, Math, English"
                  value={marksData.subject}
                  onChange={(e) => handleMarksInputChange("subject", e.target.value)}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Marks Obtained
                <input
                  type="number"
                  placeholder="e.g. 85"
                  value={marksData.marks}
                  onChange={(e) => handleMarksInputChange("marks", e.target.value)}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Total Marks
                <input
                  type="number"
                  value={marksData.totalMarks}
                  onChange={(e) => handleMarksInputChange("totalMarks", e.target.value)}
                />
              </label>
            </div>
          </div>

          <button className="btn-primary">Save Marks</button>
        </div>
      </div>

      {/* Student List with Attendance Stats */}
      <div className="staff-card">
        <div className="card-header">
          <h3>Student Attendance Summary</h3>
          <p className="muted">
            Showing {filteredStudents.length} of {studentAttendanceStats.length} students
            {criteria.minAttendancePercent > 0 && ` with ${criteria.minAttendancePercent}%+ attendance`}
          </p>
        </div>

        <div className="table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Total Days</th>
                <th>Present</th>
                <th>Attendance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => (
                  <tr key={st._id}>
                    <td>{st.name}</td>
                    <td>{st.class}</td>
                    <td>{st.section}</td>
                    <td>{st.totalDays}</td>
                    <td>{st.presentCount}</td>
                    <td>
                      <div className="percentage-display">
                        <span className={`percentage-badge ${getAttendanceColor(st.attendancePercentage)}`}>
                          {st.attendancePercentage}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {st.attendancePercentage >= 75 && (
                        <span className="badge success">Good</span>
                      )}
                      {st.attendancePercentage >= 60 && st.attendancePercentage < 75 && (
                        <span className="badge info">Average</span>
                      )}
                      {st.attendancePercentage < 60 && (
                        <span className="badge warning">Poor</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                    <p className="muted">No students match the current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {criteria.minAttendancePercent > 0 && (
          <div className="filter-summary">
            <p>
              📊 <strong>{filteredStudents.length}</strong> students have <strong>{criteria.minAttendancePercent}%</strong> or
              higher attendance in the last <strong>{criteria.daysRange}</strong> days.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getAttendanceColor(percentage) {
  if (percentage >= 85) return "excellent";
  if (percentage >= 75) return "good";
  if (percentage >= 60) return "average";
  return "poor";
}
