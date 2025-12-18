import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./styles/Staff.css";

const API_BASE = "http://localhost:5000/api/staff";

export default function CollectFee() {
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const token = localStorage.getItem("token");
	const isStaff = user?.role === "staff";
	const [studentId, setStudentId] = useState("");
	const [amount, setAmount] = useState("");
	const [note, setNote] = useState("");
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage("");
		if (!studentId || !amount) {
			setMessage("Student and amount are required");
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
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setMessage("Fee collection recorded");
			setStudentId("");
			setAmount("");
			setNote("");
		} catch (err) {
			setMessage(err.response?.data?.message || "Failed to record fee");
		} finally {
			setSaving(false);
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
						<p className="muted">Record payments against students you handle</p>
					</div>
				</div>

				{message && <div className="info-banner">{message}</div>}

				<form className="edit-form" onSubmit={handleSubmit}>
					<div className="form-grid two">
						<label>
							Student ID
							<input
								type="text"
								value={studentId}
								onChange={(e) => setStudentId(e.target.value)}
								placeholder="Student ObjectId"
								required
							/>
						</label>
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
			</div>
		</div>
	);
}
