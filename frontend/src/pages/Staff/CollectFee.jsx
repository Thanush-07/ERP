import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./styles/Staff.css";

const API_BASE = "http://localhost:5000/api/staff";

export default function CollectFee() {
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const token = localStorage.getItem("token");
	const branchId = user?.branch_id;
	const isStaff = user?.role === "staff";
	const [students, setStudents] = useState([]);
	const [studentId, setStudentId] = useState("");
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [regSearch, setRegSearch] = useState("");
	const [nameSearch, setNameSearch] = useState("");
	const [classFilter, setClassFilter] = useState("");
	const [amount, setAmount] = useState("");
	const [note, setNote] = useState("");
	const [category, setCategory] = useState("");
	const [categories, setCategories] = useState([]);
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [recentPayments, setRecentPayments] = useState([]);
	const [loadingRecent, setLoadingRecent] = useState(false);

	useEffect(() => {
		if (isStaff) {
			loadStudents();
			loadRecent();
		}
	}, []);

	const loadStudents = async () => {
		try {
			setLoading(true);
			const res = await axios.get(`${API_BASE}/${user.id}/students`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setStudents(res.data || []);
		} catch (err) {
			setMessage("Failed to load students for your branch");
		} finally {
			setLoading(false);
		}
	};

	const filteredStudents = useMemo(() => {
		return students.filter((s) => {
			const matchName = nameSearch.trim()
				? (s.name || "").toLowerCase().includes(nameSearch.toLowerCase())
				: true;
			const matchClass = classFilter ? String(s.class) === String(classFilter) : true;
			return matchName && matchClass;
		});
	}, [students, nameSearch, classFilter]);

	const loadCategories = async (cls) => {
		if (!cls) return;
		try {
			const res = await axios.get(`${API_BASE}/${user.id}/fee-categories`, {
				params: { class: cls },
				headers: { Authorization: `Bearer ${token}` },
			});
			setCategories(res.data?.categories || []);
			if ((res.data?.categories || []).length === 0) {
				setMessage("No fee categories defined for this class");
			} else {
				setMessage("");
			}
		} catch (err) {
			setCategories([]);
			setMessage(err.response?.data?.message || "Could not load fee categories");
		}
	};

	const onStudentSelect = (id) => {
		setStudentId(id);
		const st = students.find((s) => s._id === id);
		setSelectedStudent(st || null);
		setCategory("");
		if (st?.class) {
			loadCategories(st.class);
		}
	};

	const handleRegSearch = () => {
		if (!regSearch.trim()) return;
		const st = students.find((s) => String(s.admissionNumber || "").trim().toLowerCase() === regSearch.trim().toLowerCase());
		if (st) {
			onStudentSelect(st._id);
			setMessage("");
		} else {
			setMessage("No student found for that register number");
			setSelectedStudent(null);
			setStudentId("");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage("");
		if (!studentId || !amount || !category) {
			setMessage("Student, amount, and category are required");
			return;
		}
		try {
			setSaving(true);
			await axios.post(
				`${API_BASE}/${user.id}/fees`,
				{
					studentId,
					amount: Number(amount),
					note,
					category,
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setMessage("Fee request sent to branch admin for approval");
			setStudentId("");
			setSelectedStudent(null);
			setAmount("");
			setNote("");
			setCategory("");
			loadRecent();
		} catch (err) {
			setMessage(err.response?.data?.message || "Failed to record fee");
		} finally {
			setSaving(false);
		}
	};

	const loadRecent = async () => {
		if (!branchId) return;
		try {
			setLoadingRecent(true);
			const res = await axios.get(`http://localhost:5000/api/branch/${branchId}/fees`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const list = Array.isArray(res.data) ? res.data.slice(0, 5) : [];
			setRecentPayments(list);
		} catch (err) {
			console.error("Load recent payments failed", err);
		} finally {
			setLoadingRecent(false);
		}
	};

	if (!isStaff) {
		return (
			<div className="staff-guard">
				<h3>Access restricted</h3>
				<p>You need a staff account to collect fees.</p>
				<Link to="/login" className="btn-secondary">Go to login</Link>
			</div>
		);
	}

	return (
		<div className="staff-page">
			<div className="staff-card">
				<div className="card-header">
					<div>
						<h3>Fee Collection</h3>
						<p className="muted">Send fee collection request to branch admin</p>
					</div>
				</div>

				{message && <div className="info-banner">{message}</div>}
				{loading && <div className="info-banner">Loading students...</div>}

				<form className="edit-form" onSubmit={handleSubmit}>
					<div className="panel-card" style={{ padding: "12px", marginBottom: "12px", background: "#f8fafc" }}>
						<div className="form-grid two" style={{ marginBottom: "8px" }}>
							<label>
								Register / Admission No
								<div style={{ display: "flex", gap: 8 }}>
									<input
										type="text"
										value={regSearch}
										onChange={(e) => setRegSearch(e.target.value)}
										placeholder="Enter register/admission number"
									/>
									<button type="button" className="btn-primary" style={{ minWidth: 80 }} onClick={handleRegSearch}>Find</button>
								</div>
							</label>
							<label>
								Search by Name & Class
								<div style={{ display: "flex", gap: 8 }}>
									<input
										placeholder="Student name"
										value={nameSearch}
										onChange={(e) => setNameSearch(e.target.value)}
									/>
									<select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
										<option value="">All classes</option>
										{[...Array(12)].map((_, i) => (
											<option key={i + 1} value={i + 1}>Class {i + 1}</option>
										))}
									</select>
								</div>
							</label>
						</div>

						<label>
							Select Student (filtered)
							<select value={studentId} onChange={(e) => onStudentSelect(e.target.value)} required>
								<option value="">Select student</option>
								{filteredStudents.map((st) => (
									<option key={st._id} value={st._id}>
										{st.name} ({st.class}-{st.section})
									</option>
								))}
							</select>
						</label>
						{selectedStudent && (
							<div className="student-preview" style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
								<div style={{ width: 70, height: 70, borderRadius: "50%", overflow: "hidden", background: "#e5e7eb" }}>
									{selectedStudent.image ? (
										<img src={selectedStudent.image} alt={selectedStudent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
									) : (
										<div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#6b7280" }}>
											{(selectedStudent.name || "").slice(0, 1).toUpperCase()}
										</div>
									)}
								</div>
								<div>
									<div style={{ fontWeight: 700 }}>{selectedStudent.name}</div>
									<div className="muted">Reg: {selectedStudent.admissionNumber || "-"}</div>
									<div className="muted">Class {selectedStudent.class} - {selectedStudent.section}</div>
								</div>
							</div>
						)}
					</div>

					<div className="form-grid two">
						<label>
							Amount
							<input
								type="number"
								min="0"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0"
								required
							/>
						</label>
						<label>
							Fee Category
							<select value={category} onChange={(e) => setCategory(e.target.value)} required>
								<option value="">Select category</option>
								{categories.map((c) => (
									<option key={c} value={c}>{c}</option>
								))}
							</select>
						</label>
					</div>

					<label>
						Note (optional)
						<input
							type="text"
							value={note}
							onChange={(e) => setNote(e.target.value)}
							placeholder="Reference or description"
						/>
					</label>

					<div className="form-actions">
						<button className="btn-primary" type="submit" disabled={saving}>
							{saving ? "Saving..." : "Record payment"}
						</button>
						<Link to="/staff/dashboard" className="btn-ghost">Back to dashboard</Link>
					</div>
				</form>

				<div className="recent-payments-card">
					<div className="recent-head">
						<div>
							<h4>Recent payments</h4>
							<p className="muted">Latest 5 entries (includes pending/approved)</p>
						</div>
						<button type="button" className="btn-ghost" onClick={loadRecent} disabled={loadingRecent}>
							{loadingRecent ? "Refreshing..." : "Refresh"}
						</button>
					</div>

					{recentPayments.length === 0 && (
						<div className="muted" style={{ padding: "8px 0" }}>No payments yet.</div>
					)}

					{recentPayments.length > 0 && (
						<div className="recent-list">
							{recentPayments.map((p) => (
								<div key={p._id} className="recent-item">
									<div>
										<div className="recent-title">{p.studentName || "Unknown"}</div>
										<div className="recent-sub">Class {p.class || "-"} • {p.category || "-"}</div>
										<div className="recent-note">{p.note || "No note"}</div>
									</div>
									<div className="recent-meta">
										<div className="recent-amount">₹ {Number(p.amount || 0).toLocaleString()}</div>
										<span className={`badge ${p.status === "approved" ? "success" : p.status === "pending" ? "warning" : "muted"}`}>
											{p.status || "approved"}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
