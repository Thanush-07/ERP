import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./styles/Staff.css";

const API_BASE = "http://localhost:5000/api/staff";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filters, setFilters] = useState({ search: "", class: "all" });
  const [formData, setFormData] = useState({
    name: "",
    class: "",
    section: "",
    rollNo: "",
    motherName: "",
    fatherName: "",
    phoneNo: "",
    address: "",
    status: "active",
    customNote: "",
    customFields: [{ key: "", value: "" }]
  });

  const isStaff = user?.role === "staff";

  useEffect(() => {
    if (!isStaff || !user?.id) return;
    loadProfileAndStudents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfileAndStudents = async () => {
    try {
      setLoading(true);
      const [profileRes, studentsRes] = await Promise.all([
        axios.get(`${API_BASE}/${user.id}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/${user.id}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setProfile(profileRes.data);
      setStudents(studentsRes.data || []);
    } catch (err) {
      console.error("Failed to load staff dashboard", err);
      alert("Could not load staff dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return (students || []).filter((st) => {
      const matchesClass = filters.class === "all" || String(st.class).trim() === String(filters.class).trim();
      const matchesSearch = filters.search.trim() === "" ||
        st.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        st.rollNo?.toLowerCase().includes(filters.search.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [students, filters]);

  const viewStudent = (student) => {
    setEditingStudent(student);
  };

  const closeModal = () => {
    setEditingStudent(null);
  };

  const startEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      class: student.class || "",
      section: student.section || "",
      rollNo: student.rollNo || "",
      motherName: student.motherName || "",
      fatherName: student.fatherName || "",
      phoneNo: student.phoneNo || "",
      address: student.address || "",
      status: student.status || "active",
      customNote: student.customNote || "",
      image: student.image || "",
      aadharCardNumber: student.aadharCardNumber || "",
      rationCardNumber: student.rationCardNumber || "",
      customFields: student.customFields?.length
        ? student.customFields
        : [{ key: "", value: "" }]
    });
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({
      name: "",
      class: "",
      section: "",
      motherName: "",
      father: "",
      parentName: "",
      phoneNo: "",
      address: "",
      status: "active",
      customNote: "",
      image: "",
      aadharCardNumber: "",
      rationCardNumber: "",
      customFields: [{ key: "", value: "" }]
    });
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (idx, key, value) => {
    setFormData((prev) => {
      const updated = [...prev.customFields];
      updated[idx] = { ...updated[idx], [key]: value };
      return { ...prev, customFields: updated };
    });
  };

  const addCustomFieldRow = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { key: "", value: "" }]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, image: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        class: formData.class,
        section: formData.section,
        motherName: formData.motherName,
        fatherName: formData.fatherName,
        phoneNo: formData.phoneNo,
        address: formData.address,
        status: formData.status,
        customNote: formData.customNote,
        image: formData.image,
        aadharCardNumber: formData.aadharCardNumber,
        rationCardNumber: formData.rationCardNumber
      };

      const customFields = (formData.customFields || [])
        .filter((f) => f.key && f.value)
        .map((f) => ({ key: f.key, value: f.value }));
      if (customFields.length) payload.customFields = customFields;

      await axios.put(
        `${API_BASE}/${user.id}/students/${editingStudent._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadProfileAndStudents();
      resetForm();
      alert("Student updated successfully");
    } catch (err) {
      console.error("Failed to update student", err);
      alert(err.response?.data?.message || "Could not update student");
    } finally {
      setSaving(false);
    }
  };

  if (!isStaff) {
    return (
      <div className="staff-guard">
        <h3>Access restricted</h3>
        <p>You need a staff account to view this dashboard.</p>
        <Link to="/login" className="btn-secondary">Go to login</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="staff-loading">Loading staff dashboard...</div>;
  }

  const avatarLetter = (profile?.name || "?").slice(0, 1).toUpperCase();
  const classesAssigned = profile?.classes || [];

  return (
    <div className="staff-page">
      <div className="staff-grid">
        <div className="staff-card profile-card">
          <div className="avatar-circle">{avatarLetter}</div>
          <div>
            <h2>{profile?.name}</h2>
            <p>{profile?.email}</p>
            <p className="muted">{profile?.staffCategory || "Teaching Staff"}</p>
            <div className="chip-row">
              <span className="chip">Classes: {classesAssigned.length ? classesAssigned.join(", ") : "All"}</span>
              <span className="chip">Branch: {profile?.branch_id || "-"}</span>
            </div>
          </div>
        </div>

        <div className="staff-card quick-actions">
          <div>
            <p className="muted">Daily operations</p>
            <h3>Quick Actions</h3>
          </div>
          <div className="action-buttons">
            <Link to="/staff/attendance" className="btn-primary">Take attendance</Link>
            <Link to="/staff/reports" className="btn-ghost">View reports</Link>
          </div>
        </div>
      </div>

      <div className="staff-grid stats">
        <div className="staff-card stat-card">
          <p className="muted">Students</p>
          <h3>{students.length}</h3>
          <span className="badge success">Active roster</span>
        </div>
        <div className="staff-card stat-card">
          <p className="muted">Classes you handle</p>
          <h3>{classesAssigned.length || "All"}</h3>
          <span className="badge info">Class access</span>
        </div>
        <div className="staff-card stat-card">
          <p className="muted">Editable fields</p>
          <h3>No deletes</h3>
          <span className="badge warning">Updates only</span>
        </div>
      </div>

      <div className="staff-card">
        <div className="card-header">
          <div>
            <h3>Students you can access</h3>
            <p className="muted">Filtered by your assigned classes</p>
          </div>
          <div className="filters-row">
            <input
              type="text"
              placeholder="Search by name or roll no"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              value={filters.class}
              onChange={(e) => setFilters({ ...filters, class: e.target.value })}
            >
              <option value="all">All classes</option>
              {Array.from(new Set(students.map((s) => s.class))).map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Roll</th>
                <th>Mother Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st) => (
                <tr key={st._id} onClick={() => viewStudent(st)} className="clickable-row">
                  <td>{st.name}</td>
                  <td>{st.class}</td>
                  <td>{st.section}</td>
                  <td>{st.rollNo}</td>
                  <td>{st.motherName}</td>
                  <td>{st.phoneNo}</td>
                  <td><span className={`badge ${st.status === "active" ? "success" : "muted"}`}>{st.status}</span></td>
                  <td>
                    <button className="btn-link" onClick={(e) => { e.stopPropagation(); startEdit(st); }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && <div className="empty">No students match your filters.</div>}
        </div>
      </div>

      {editingStudent && (
        <div className="staff-card edit-panel">
          <div className="card-header">
            <h3>Edit student</h3>
            <button className="btn-ghost" onClick={resetForm}>Close</button>
          </div>
          <form className="edit-form" onSubmit={saveStudent}>
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

            <div className="form-grid">
              <label>
                Name
                <input name="name" value={formData.name} onChange={handleFieldChange} required />
              </label>
              <label>
                Class
                <input name="class" value={formData.class} onChange={handleFieldChange} required />
              </label>
              <label>
                Section
                <input name="section" value={formData.section} onChange={handleFieldChange} required />
              </label>
              <label>
                Roll No
                <input name="rollNo" value={formData.rollNo} onChange={handleFieldChange} required />
              </label>
              <label>
                Mother Name
                <input name="motherName" value={formData.motherName} onChange={handleFieldChange} />
              </label>
              <label>
                Father Name
                <input name="fatherName" value={formData.fatherName} onChange={handleFieldChange} />
              </label>
              <label>
                Phone
                <input name="phoneNo" value={formData.phoneNo} onChange={handleFieldChange} required />
              </label>
            </div>

            <label>
              Address
              <textarea name="address" value={formData.address} onChange={handleFieldChange} rows={2} />
            </label>

            <div className="form-grid">
              <label>
                Aadhar Card Number
                <input name="aadharCardNumber" value={formData.aadharCardNumber} onChange={handleFieldChange} placeholder="e.g. 1234-5678-9012" />
              </label>
              <label>
                Ration Card Number
                <input name="rationCardNumber" value={formData.rationCardNumber} onChange={handleFieldChange} placeholder="e.g. RC-001234" />
              </label>
            </div>

            <label>
              Custom note
              <input name="customNote" value={formData.customNote} onChange={handleFieldChange} placeholder="e.g. allergy info, pickup guardian" />
            </label>

            <div className="form-grid two">
              <label>
                Status
                <select name="status" value={formData.status} onChange={handleFieldChange}>
                  <option value="active">Active</option>
                  <option value="left">Left</option>
                  <option value="transferred">Transferred</option>
                </select>
              </label>
            </div>

            <div className="custom-fields">
              <div className="card-header">
                <h4>Custom inputs</h4>
                <button type="button" className="btn-link" onClick={addCustomFieldRow}>+ Add field</button>
              </div>
              {formData.customFields.map((field, idx) => (
                <div className="form-grid two" key={idx}>
                  <input
                    placeholder="Label (e.g. Blood Group)"
                    value={field.key}
                    onChange={(e) => handleCustomFieldChange(idx, "key", e.target.value)}
                  />
                  <input
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) => handleCustomFieldChange(idx, "value", e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Student Detail Modal */}
      {editingStudent && !formData.name && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content student-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Student Details</h2>
                <p className="modal-subtitle">Complete information</p>
              </div>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="student-details-top">
                {editingStudent?.image && (
                  <div className="modal-image-large">
                    <img src={editingStudent.image} alt={editingStudent.name} />
                  </div>
                )}
                <div className="student-basic-info">
                  <h3>{editingStudent?.name}</h3>
                  <div className="basic-details">
                    <div className="basic-item">
                      <span className="label">Roll No:</span>
                      <span className="value">{editingStudent?.rollNo}</span>
                    </div>
                    <div className="basic-item">
                      <span className="label">Class:</span>
                      <span className="value">{editingStudent?.class} - {editingStudent?.section}</span>
                    </div>
                    <div className="basic-item">
                      <span className="label">Status:</span>
                      <span className="value"><span className={`badge ${editingStudent?.status === "active" ? "success" : "muted"}`}>{editingStudent?.status}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="details-sections">
                <div className="detail-section">
                  <h4 className="section-title">👨‍👩‍👧 Family Information</h4>
                  <div className="section-grid">
                    <div className="detail-item">
                      <label>Mother Name</label>
                      <p>{editingStudent?.motherName || "N/A"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Father Name</label>
                      <p>{editingStudent?.fatherName || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="section-title">📞 Contact Information</h4>
                  <div className="section-grid">
                    <div className="detail-item">
                      <label>Phone No</label>
                      <p>{editingStudent?.phoneNo}</p>
                    </div>
                    <div className="detail-item">
                      <label>Address</label>
                      <p>{editingStudent?.address || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="section-title">📋 Identity Information</h4>
                  <div className="section-grid">
                    <div className="detail-item">
                      <label>Aadhar Card Number</label>
                      <p>{editingStudent?.aadharCardNumber || "N/A"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Ration Card Number</label>
                      <p>{editingStudent?.rationCardNumber || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {editingStudent?.customFields && editingStudent.customFields.length > 0 && (
                  <div className="detail-section">
                    <h4 className="section-title">📌 Additional Details</h4>
                    <div className="section-grid">
                      {editingStudent.customFields.map((field, idx) => (
                        <div key={idx} className="detail-item">
                          <label>{field.key}</label>
                          <p>{field.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => startEdit(editingStudent)}>✏️ Edit Student</button>
              <button className="btn-ghost" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}