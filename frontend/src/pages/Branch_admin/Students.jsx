import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/Students.css";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    class: "all",
    academicYear: "all"
  });
  const [stats, setStats] = useState({
    summary: { total: 0, active: 0, left: 0, transferred: 0 },
    classBreakdown: []
  });
  const [formData, setFormData] = useState({
    name: "",
    class: "",
    section: "",
    rollNo: "",
    motherName: "",
    fatherName: "",
    phoneNo: "",
    address: "",
    admissionNumber: "",
    academicYear: "",
    status: "active",
    fees: "",
    residency: "hosteller", // 'hosteller' or 'day-scholar'
    busFees: "",
    hostelFees: "",
    emisNo: "",
    image: "",
    aadharCardNumber: "",
    rationCardNumber: ""
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const branchId = user.branch_id;

  // Check if user is authenticated and has branch_id
  if (!user.id || !branchId) {
    return (
      <div className="students-management">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>You must be logged in as a branch admin to access this page.</p>
          <p>Please <a href="/login">login</a> with a branch admin account.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadStudents();
    loadStats();
  }, [filters]);

  const loadStudents = async () => {
    try {
      const params = {};
      if (filters.status !== "all") params.status = filters.status;
      if (filters.class !== "all") params.class = filters.class;
      if (filters.academicYear !== "all") params.academicYear = filters.academicYear;

      const response = await axios.get(
        `http://localhost:5000/api/branch/${branchId}/students`,
        {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStudents(response.data);
    } catch (error) {
      console.error("Error loading students:", error);
      alert("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/branch/${branchId}/students/stats/summary`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const generateAdmissionNumber = async () => {
    if (!formData.academicYear) {
      alert("Please select academic year first");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/branch/${branchId}/students/generate-admission-number`,
        { academicYear: formData.academicYear },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFormData({ ...formData, admissionNumber: response.data.admissionNumber });
    } catch (error) {
      console.error("Error generating admission number:", error);
      alert("Failed to generate admission number");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, image: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      class: "",
      section: "",
      rollNo: "",
      motherName: "",
      fatherName: "",
      phoneNo: "",
      address: "",
      admissionNumber: "",
      academicYear: "",
      status: "active",
      fees: "",
      residency: "hosteller",
      busFees: "",
      hostelFees: "",
      emisNo: "",
      image: "",
      aadharCardNumber: "",
      rationCardNumber: ""
    });
    setEditingStudent(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // prepare payload; normalize numbers
      const payload = { ...formData };
      if (payload.fees !== undefined && payload.fees !== "") payload.fees = Number(payload.fees);
      if (payload.busFees !== undefined && payload.busFees !== "") payload.busFees = Number(payload.busFees);
      if (payload.hostelFees !== undefined && payload.hostelFees !== "") payload.hostelFees = Number(payload.hostelFees);

      // compute parentName for backend compatibility (combine mother + father if both present)
      const mother = payload.motherName?.trim();
      const father = payload.fatherName?.trim();
      if (mother && father) payload.parentName = `${mother} / ${father}`;
      else if (mother) payload.parentName = mother;
      else if (father) payload.parentName = father;

      // include only the relevant fee field based on residency
      if (payload.residency === "day-scholar") {
        delete payload.hostelFees;
      } else if (payload.residency === "hosteller") {
        delete payload.busFees;
      } else {
        delete payload.busFees;
        delete payload.hostelFees;
      }

      // remove local-only fields we don't want to send if backend expects parentName
      delete payload.motherName;
      delete payload.fatherName;

      // Keep image, aadharCardNumber, rationCardNumber in payload

      console.log("Student payload:", payload);

      if (editingStudent) {
        await axios.put(
          `http://localhost:5000/api/branch/${branchId}/students/${editingStudent._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        alert("Student updated successfully");
      } else {
        await axios.post(
          `http://localhost:5000/api/branch/${branchId}/students`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        alert("Student added successfully");
      }
      resetForm();
      loadStudents();
      loadStats();
    } catch (error) {
      console.error("Error saving student:", error, error.response?.data);
      alert(JSON.stringify(error.response?.data || error.message));
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      class: student.class,
      section: student.section,
      rollNo: student.rollNo,
      motherName: student.motherName || student.parentName || "",
      fatherName: student.fatherName || "",
      phoneNo: student.phoneNo,
      address: student.address,
      admissionNumber: student.admissionNumber,
      academicYear: student.academicYear,
      status: student.status,
      fees: student.fees || "",
      residency: student.residency || "hosteller",
      busFees: student.busFees || "",
      hostelFees: student.hostelFees || "",
      emisNo: student.emisNo || "",
      image: student.image || "",
      aadharCardNumber: student.aadharCardNumber || "",
      rationCardNumber: student.rationCardNumber || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/branch/${branchId}/students/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Student deleted successfully");
      loadStudents();
      loadStats();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#27ae60";
      case "left": return "#e74c3c";
      case "transferred": return "#f39c12";
      default: return "#95a5a6";
    }
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="students-management">
      <div className="students-header">
        <h2>Student Management</h2>
        <button
          className="add-student-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add New Student"}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <span className="stat-value">{stats.summary.total}</span>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <span className="stat-value active">{stats.summary.active}</span>
        </div>
        <div className="stat-card">
          <h3>Left</h3>
          <span className="stat-value left">{stats.summary.left}</span>
        </div>
        <div className="stat-card">
          <h3>Transferred</h3>
          <span className="stat-value transferred">{stats.summary.transferred}</span>
        </div>
      </div>

      {/* Class Breakdown */}
      {stats.classBreakdown.length > 0 && (
        <div className="class-breakdown">
          <h3>Class Distribution</h3>
          <div className="class-grid">
            {stats.classBreakdown.map((item) => (
              <div key={item._id} className="class-item">
                <span className="class-name">Class {item._id}</span>
                <span className="class-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="student-form-container">
          <form className="student-form" onSubmit={handleSubmit}>
            <h3>{editingStudent ? "Edit Student" : "Add New Student"}</h3>

            <div className="image-upload-section">
              <label className="image-label">
                Student Photo
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </label>
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="Student preview" />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mother Name *</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Father Name *</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Class *</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Class</option>
                  <option value="1">Class 1</option>
                  <option value="2">Class 2</option>
                  <option value="3">Class 3</option>
                  <option value="4">Class 4</option>
                  <option value="5">Class 5</option>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>

              <div className="form-group">
                <label>Section *</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Roll No *</label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone No *</label>
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Academic Year *</label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Academic Year</option>
                  <option value="2024/25">2024/25</option>
                  <option value="2025/26">2025/26</option>
                  <option value="2026/27">2026/27</option>
                </select>
              </div>

              <div className="form-group">
                <label>Admission Number *</label>
                <div className="admission-input-group">
                  <input
                    type="text"
                    name="admissionNumber"
                    value={formData.admissionNumber}
                    onChange={handleInputChange}
                    required
                    disabled={editingStudent}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fees *</label>
                <input
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Residency *</label>
                <select name="residency" value={formData.residency} onChange={handleInputChange} required>
                  <option value="hosteller">Hosteller</option>
                  <option value="day-scholar">Day Scholar</option>
                </select>
              </div>
            </div>

            {formData.residency === "day-scholar" && (
              <div className="form-row">
                <div className="form-group">
                  <label>Bus Fees</label>
                  <input
                    type="number"
                    name="busFees"
                    value={formData.busFees}
                    onChange={handleInputChange}
                    placeholder="Enter bus fee if day scholar"
                  />
                </div>
              </div>
            )}

            {formData.residency === "hosteller" && (
              <div className="form-row">
                <div className="form-group">
                  <label>Hostel Fees</label>
                  <input
                    type="number"
                    name="hostelFees"
                    value={formData.hostelFees}
                    onChange={handleInputChange}
                    placeholder="Enter hostel fee if hosteller"
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>EMIS No (optional)</label>
                <input
                  type="text"
                  name="emisNo"
                  value={formData.emisNo}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Aadhar Card Number (optional)</label>
                <input
                  type="text"
                  name="aadharCardNumber"
                  value={formData.aadharCardNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 1234-5678-9012"
                />
              </div>

              <div className="form-group">
                <label>Ration Card Number (optional)</label>
                <input
                  type="text"
                  name="rationCardNumber"
                  value={formData.rationCardNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. RC-001234"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="left">Left</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingStudent ? "Update Student" : "Add Student"}
              </button>
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="students-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="left">Left</option>
            <option value="transferred">Transferred</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Class:</label>
          <select name="class" value={filters.class} onChange={handleFilterChange}>
            <option value="all">All Classes</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Class {i + 1}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Academic Year:</label>
          <select name="academicYear" value={filters.academicYear} onChange={handleFilterChange}>
            <option value="all">All Years</option>
            <option value="2024/25">2024/25</option>
            <option value="2025/26">2025/26</option>
            <option value="2026/27">2026/27</option>
          </select>
        </div>
      </div>

      <div className="students-list">
        <h3>Students ({students.length})</h3>

        {students.length === 0 ? (
          <p className="no-students">No students found.</p>
        ) : (
          <div className="students-table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Roll No</th>
                  <th>Parent</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} onClick={() => setViewingStudent(student)} style={{ cursor: "pointer" }}>
                    <td>{student.admissionNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.class}</td>
                    <td>{student.section}</td>
                    <td>{student.rollNo}</td>
                    <td>{student.motherName || student.parentName || ""}{student.fatherName ? (" / " + student.fatherName) : ""}</td>
                    <td>{student.phoneNo}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(student.status) }}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={(e) => { e.stopPropagation(); handleEdit(student); }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={(e) => { e.stopPropagation(); handleDelete(student._id); }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {viewingStudent && (
        <div className="modal-overlay" onClick={() => setViewingStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button className="modal-close" onClick={() => setViewingStudent(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {viewingStudent?.image && (
                <div className="modal-image">
                  <img src={viewingStudent.image} alt={viewingStudent.name} />
                </div>
              )}
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Admission Number</label>
                  <p>{viewingStudent?.admissionNumber}</p>
                </div>
                <div className="detail-item">
                  <label>Name</label>
                  <p>{viewingStudent?.name}</p>
                </div>
                <div className="detail-item">
                  <label>Roll No</label>
                  <p>{viewingStudent?.rollNo}</p>
                </div>
                <div className="detail-item">
                  <label>Class</label>
                  <p>{viewingStudent?.class}</p>
                </div>
                <div className="detail-item">
                  <label>Section</label>
                  <p>{viewingStudent?.section}</p>
                </div>
                <div className="detail-item">
                  <label>Mother Name</label>
                  <p>{viewingStudent?.motherName || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Father Name</label>
                  <p>{viewingStudent?.fatherName || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Phone No</label>
                  <p>{viewingStudent?.phoneNo}</p>
                </div>
                <div className="detail-item">
                  <label>Aadhar Card Number</label>
                  <p>{viewingStudent?.aadharCardNumber || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Ration Card Number</label>
                  <p>{viewingStudent?.rationCardNumber || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Address</label>
                  <p>{viewingStudent?.address || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p><span className="status-badge" style={{ backgroundColor: getStatusColor(viewingStudent?.status) }}>{viewingStudent?.status}</span></p>
                </div>
                <div className="detail-item">
                  <label>Academic Year</label>
                  <p>{viewingStudent?.academicYear || "N/A"}</p>
                </div>
              </div>
              {viewingStudent?.customFields && viewingStudent.customFields.length > 0 && (
                <div className="custom-fields-display">
                  <h4>Custom Fields (Added by Staff)</h4>
                  <div className="custom-fields-grid">
                    {viewingStudent.customFields.map((field, idx) => (
                      <div key={idx} className="detail-item">
                        <label>{field.key}</label>
                        <p>{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => { setViewingStudent(null); handleEdit(viewingStudent); }}>Edit Student</button>
              <button className="btn-ghost" onClick={() => setViewingStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}