// src/pages/Institution_admin/Branches.jsx
import { useEffect, useState } from "react";
import axios from "axios";
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

      <div className="branch-card">
        <form className="branch-form" onSubmit={handleSubmit}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files[0] || null)}
          />
          {uploadingLogo && (
            <span className="branch-hint">Uploading logo…</span>
          )}

          <input
            name="name"
            placeholder="Branch name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="address"
            placeholder="Branch address"
            value={form.address}
            onChange={handleChange}
          />
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
          />
          <input
            name="managerName"
            placeholder="Branch admin name"
            value={form.managerName}
            onChange={handleChange}
          />
          <input
            name="managerEmail"
            type="email"
            placeholder="Branch admin email"
            value={form.managerEmail}
            onChange={handleChange}
          />
          <input
            name="contactPhone"
            placeholder="Branch contact no"
            value={form.contactPhone}
            onChange={handleChange}
          />

          <textarea
            name="classesText"
            placeholder="Classes (comma separated, e.g. LKG, UKG, 1st Std)"
            value={form.classesText}
            onChange={handleChange}
          />

          <textarea
            name="feesText"
            placeholder="Fee structure per class (e.g. LKG:20000, UKG:21000)"
            value={form.feesText}
            onChange={handleChange}
          />

          <div className="branch-actions">
            <button type="submit" className="btn-primary">
              {editing ? "Update Branch" : "Create Branch"}
            </button>
            {editing && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="branch-card">
        <div className="branch-table-wrap">
          <table className="branch-table">
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
                <tr key={br._id}>
                  <td>
                    <img
                      src={`${API_BASE}/branches/${br._id}/logo`}
                      alt={br.branch_name}
                      width={40}
                      height={40}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </td>
                  <td>{br.branch_name}</td>
                  <td>{br.address}</td>
                  <td>{br.location}</td>
                  <td>{br.managerName}</td>
                  <td>{br.managerEmail}</td>
                  <td>{br.contactPhone}</td>
                  <td>{(br.classes || []).join(", ")}</td>
                  <td>{br.feesText}</td>
                  <td>
                    <button
                      className="table-btn edit"
                      onClick={() => startEdit(br)}
                    >
                      Edit
                    </button>
                    <button
                      className="table-btn delete"
                      onClick={() => handleDelete(br._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
                <tr>
                  <td colSpan="10" className="branch-empty">
                    No branches yet.
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
