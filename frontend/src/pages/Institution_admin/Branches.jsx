import { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import "./styles/Branches.css";

const API_BASE = "http://localhost:5000/api/institution";

export default function InstitutionBranches() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    address: "",
    location: "",
    managerName: "",
    managerEmail: "",
    contactPhone: "",
    classesText: "",
    feesText: "",
  });
  const [editing, setEditing] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [modalEditing, setModalEditing] = useState(false);

  // logged-in institution admin
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const institutionId = user?.institution_id || user?.institutionId || null;

  const loadBranches = async () => {
    if (!institutionId) return;
    try {
      const res = await axios.get(
        `${API_BASE}/${institutionId}/branches`
      );
      setBranches(res.data);
    } catch (err) {
      console.error(
        "LOAD BRANCHES ERROR",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      offset: 100
    });
    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      address: "",
      location: "",
      managerName: "",
      managerEmail: "",
      contactPhone: "",
      classesText: "",
      feesText: "",
    });
    setEditing(false);
    setLogoFile(null);
  };

  const uploadLogoForBranch = async (branchId) => {
    if (!logoFile) return;
    const fd = new FormData();
    fd.append("logo", logoFile);
    setUploadingLogo(true);
    try {
      await axios.post(
        `${API_BASE}/branches/${branchId}/logo`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } catch (err) {
      console.error(
        "BRANCH LOGO UPLOAD ERROR",
        err.response?.data || err.message
      );
      alert("Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!institutionId) {
      alert("Institution not set for this admin.");
      return;
    }

    try {
      const payload = {
        branch_name: form.name,
        address: form.address,
        location: form.location,
        managerName: form.managerName,
        managerEmail: form.managerEmail,
        contactPhone: form.contactPhone,
        classes: form.classesText
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        feesText: form.feesText,
      };

      let branchId = form.id;

      if (editing) {
        const res = await axios.put(
          `${API_BASE}/${institutionId}/branches/${form.id}`,
          payload
        );
        branchId = res.data._id;
      } else {
        const res = await axios.post(
          `${API_BASE}/${institutionId}/branches`,
          payload
        );
        branchId = res.data._id;
      }

      if (logoFile) {
        await uploadLogoForBranch(branchId);
      }

      resetForm();
      loadBranches();
    } catch (err) {
      console.error("BRANCH SAVE ERROR", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save branch");
    }
  };

  const openModal = (br) => {
    setSelectedBranch(br);
    setModalOpen(true);
    setModalEditing(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBranch(null);
    setModalEditing(false);
    setLogoFile(null);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setSelectedBranch((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const startEdit = (br) => {
    setForm({
      id: br._id,
      name: br.branch_name,
      address: br.address || "",
      location: br.location || "",
      managerName: br.managerName || "",
      managerEmail: br.managerEmail || "",
      contactPhone: br.contactPhone || "",
      classesText: (br.classes || []).join(", "),
      feesText: br.feesText || "",
    });
    setEditing(true);
    setLogoFile(null);
  };

  const handleModalUpdate = async (e) => {
    e.preventDefault();
    if (!selectedBranch) return;

    try {
      const payload = {
        branch_name: selectedBranch.branch_name,
        address: selectedBranch.address,
        location: selectedBranch.location,
        managerName: selectedBranch.managerName,
        managerEmail: selectedBranch.managerEmail,
        contactPhone: selectedBranch.contactPhone,
        classes: typeof selectedBranch.classesText === 'string'
          ? selectedBranch.classesText.split(",").map((c) => c.trim()).filter(Boolean)
          : selectedBranch.classes || [],
        feesText: selectedBranch.feesText,
      };

      await axios.put(
        `${API_BASE}/${institutionId}/branches/${selectedBranch._id}`,
        payload
      );

      if (logoFile) {
        await uploadLogoForBranch(selectedBranch._id);
      }

      closeModal();
      loadBranches();
    } catch (err) {
      console.error("BRANCH UPDATE ERROR", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update branch");
    }
  };

  const handleModalDelete = async () => {
    if (!selectedBranch) return;
    if (!window.confirm(`Delete "${selectedBranch.branch_name}"?`)) return;

    try {
      await axios.delete(
        `${API_BASE}/${institutionId}/branches/${selectedBranch._id}`
      );
      closeModal();
      loadBranches();
    } catch (err) {
      console.error(
        "BRANCH DELETE ERROR",
        err.response?.data || err.message
      );
      alert(err.response?.data?.message || "Failed to delete branch");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this branch?")) return;
    try {
      await axios.delete(
        `${API_BASE}/${institutionId}/branches/${id}`
      );
      loadBranches();
    } catch (err) {
      console.error(
        "BRANCH DELETE ERROR",
        err.response?.data || err.message
      );
      alert(err.response?.data?.message || "Failed to delete branch");
    }
  };

  if (!institutionId) {
    return (
      <div className="branch-page">
        <div className="branch-header">
          <h1>Branches</h1>
          <p>Institution not set for this admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="branch-page">
      <div className="branch-header">
        <h1>Branches</h1>
        <p>Manage branches for this institution.</p>
      </div>

      <div className="br-card" data-aos="fade-up">
        <h2 className="br-card-title">{editing ? "Edit Branch" : "Add New Branch"}</h2>
        <form className="br-form" onSubmit={handleSubmit}>
          <div className="br-file-input-wrapper">
            <label className="br-file-label">
              <span>Branch Logo</span>
              <input
                type="file"
                accept="image/*"
                className="br-file-input"
                onChange={(e) => setLogoFile(e.target.files[0] || null)}
              />
            </label>
            {logoFile && <span className="br-file-name">{logoFile.name}</span>}
            {uploadingLogo && <span className="br-hint">Uploading logo…</span>}
          </div>

          <input
            name="name"
            placeholder="Branch name"
            className="br-input"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="address"
            placeholder="Branch address"
            className="br-input"
            value={form.address}
            onChange={handleChange}
          />
          <input
            name="location"
            placeholder="Location"
            className="br-input"
            value={form.location}
            onChange={handleChange}
          />
          <input
            name="managerName"
            placeholder="Branch admin name"
            className="br-input"
            value={form.managerName}
            onChange={handleChange}
          />
          <input
            name="managerEmail"
            type="email"
            placeholder="Branch admin email"
            className="br-input"
            value={form.managerEmail}
            onChange={handleChange}
          />
          <input
            name="contactPhone"
            placeholder="Branch contact no"
            className="br-input"
            value={form.contactPhone}
            onChange={handleChange}
          />

          <textarea
            name="classesText"
            placeholder="Classes (comma separated, e.g. LKG, UKG, 1st Std)"
            className="br-textarea"
            value={form.classesText}
            onChange={handleChange}
          />

          <textarea
            name="feesText"
            placeholder="Fee structure per class (e.g. LKG:20000, UKG:21000)"
            className="br-textarea"
            value={form.feesText}
            onChange={handleChange}
          />

          <div className="br-form-actions">
            <button type="submit" className="br-btn br-btn-primary">
              {editing ? "Update Branch" : "Create Branch"}
            </button>
            {editing && (
              <button
                type="button"
                className="br-btn br-btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="br-card" data-aos="fade-up" data-aos-delay="200">
        <h2 className="br-card-title">Branches List</h2>
        <div className="br-table-wrap">
          <table className="br-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Branch name</th>
                <th>Address</th>
                <th>Location</th>
                <th>Branch admin name</th>
                <th>Admin email</th>
                <th>Contact no</th>
                <th>Classes</th>
                <th>Fees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((br) => (
                <tr key={br._id} onClick={() => openModal(br)} style={{ cursor: 'pointer' }}>
                  <td>
                    <img
                      src={`${API_BASE}/branches/${br._id}/logo`}
                      alt={br.branch_name}
                      className="br-logo-img"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </td>
                  <td><strong>{br.branch_name}</strong></td>
                  <td>{br.address}</td>
                  <td>{br.location}</td>
                  <td>{br.managerName}</td>
                  <td>{br.managerEmail}</td>
                  <td>{br.contactPhone}</td>
                  <td><span className="br-badge">{(br.classes || []).join(", ")}</span></td>
                  <td className="br-fee-cell">{br.feesText}</td>
                  <td>
                    <div className="br-table-actions">
                      <button
                        className="br-btn br-btn-sm br-btn-outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(br);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="br-btn br-btn-sm br-btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(br._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
                <tr>
                  <td colSpan="10" className="br-empty">
                    No branches yet. Create your first branch above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedBranch && (
        <div className="br-modal-overlay" onClick={closeModal}>
          <div className="br-modal" onClick={(e) => e.stopPropagation()} data-aos="zoom-in" data-aos-duration="300">
            <div className="br-modal-header">
              <h2>{modalEditing ? "Edit Branch" : "Branch Details"}</h2>
              <button className="br-modal-close" onClick={closeModal}>&times;</button>
            </div>

            <div className="br-modal-body">
              {!modalEditing ? (
                <div className="br-modal-details">
                  <div className="br-modal-logo">
                    <img
                      src={`${API_BASE}/branches/${selectedBranch._id}/logo`}
                      alt={selectedBranch.branch_name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/120?text=No+Logo";
                      }}
                    />
                  </div>
                  <div className="br-detail-item">
                    <strong>Branch Name:</strong>
                    <span>{selectedBranch.branch_name}</span>
                  </div>
                  <div className="br-detail-item">
                    <strong>Address:</strong>
                    <span>{selectedBranch.address || "N/A"}</span>
                  </div>
                  <div className="br-detail-item">
                    <strong>Location:</strong>
                    <span>{selectedBranch.location || "N/A"}</span>
                  </div>
                  <div className="br-detail-item">
                    <strong>Manager Name:</strong>
                    <span>{selectedBranch.managerName || "N/A"}</span>
                  </div>
                  <div className="br-detail-item">
                    <strong>Manager Email:</strong>
                    <span>{selectedBranch.managerEmail || "N/A"}</span>
                  </div>
                  <div className="br-detail-item">
                    <strong>Contact Phone:</strong>
                    <span>{selectedBranch.contactPhone || "N/A"}</span>
                  </div>
                  <div className="br-detail-item">
                    <strong>Classes:</strong>
                    <span>{(selectedBranch.classes || []).join(", ") || "N/A"}</span>
                  </div>
                  <div className="br-detail-item">
                    <strong>Fee Structure:</strong>
                    <span>{selectedBranch.feesText || "N/A"}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleModalUpdate} className="br-modal-form">
                  <div className="br-modal-logo-edit">
                    <img
                      src={logoFile ? URL.createObjectURL(logoFile) : `${API_BASE}/branches/${selectedBranch._id}/logo`}
                      alt={selectedBranch.branch_name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/100?text=No+Logo";
                      }}
                    />
                  </div>

                  <div className="br-file-input-wrapper">
                    <label className="br-file-label">
                      <span>Update Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="br-file-input"
                        onChange={(e) => setLogoFile(e.target.files[0] || null)}
                      />
                    </label>
                    {logoFile && <span className="br-file-name">{logoFile.name}</span>}
                  </div>

                  <input
                    name="branch_name"
                    placeholder="Branch name"
                    className="br-input"
                    value={selectedBranch.branch_name}
                    onChange={handleModalChange}
                    required
                  />
                  <input
                    name="address"
                    placeholder="Address"
                    className="br-input"
                    value={selectedBranch.address || ""}
                    onChange={handleModalChange}
                  />
                  <input
                    name="location"
                    placeholder="Location"
                    className="br-input"
                    value={selectedBranch.location || ""}
                    onChange={handleModalChange}
                  />
                  <input
                    name="managerName"
                    placeholder="Manager Name"
                    className="br-input"
                    value={selectedBranch.managerName || ""}
                    onChange={handleModalChange}
                  />
                  <input
                    name="managerEmail"
                    type="email"
                    placeholder="Manager Email"
                    className="br-input"
                    value={selectedBranch.managerEmail || ""}
                    onChange={handleModalChange}
                  />
                  <input
                    name="contactPhone"
                    placeholder="Contact Phone"
                    className="br-input"
                    value={selectedBranch.contactPhone || ""}
                    onChange={handleModalChange}
                  />
                  <textarea
                    name="classesText"
                    placeholder="Classes (comma separated)"
                    className="br-textarea"
                    value={selectedBranch.classesText || (selectedBranch.classes || []).join(", ")}
                    onChange={handleModalChange}
                  />
                  <textarea
                    name="feesText"
                    placeholder="Fee Structure"
                    className="br-textarea"
                    value={selectedBranch.feesText || ""}
                    onChange={handleModalChange}
                  />

                  <div className="br-modal-actions">
                    <button type="submit" className="br-btn br-btn-primary">
                      Update Branch
                    </button>
                    <button
                      type="button"
                      className="br-btn br-btn-secondary"
                      onClick={() => setModalEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {!modalEditing && (
              <div className="br-modal-footer">
                <button
                  className="br-btn br-btn-primary"
                  onClick={() => {
                    setModalEditing(true);
                    setSelectedBranch(prev => ({
                      ...prev,
                      classesText: (prev.classes || []).join(", ")
                    }));
                  }}
                >
                  Edit Branch
                </button>
                <button className="br-btn br-btn-danger" onClick={handleModalDelete}>
                  Delete Branch
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
