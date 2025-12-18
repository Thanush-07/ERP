import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./styles/Staff.css";

const API_BASE = "http://localhost:5000/api/staff";

export default function Attendance() {
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const token = localStorage.getItem("token");
	const isStaff = user?.role === "staff";

	const [students, setStudents] = useState([]);
	const [statuses, setStatuses] = useState({});
	const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");

	const isSunday = (dateStr) => new Date(dateStr).getDay() === 0;

	useEffect(() => {
		if (!isStaff || !user?.id) return;
		loadStudents();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!isStaff || !user?.id) return;
		if (isSunday(selectedDate)) {
			setMessage("Sundays are excluded from attendance.");
			return;
		}
		setMessage("");
		loadAttendanceForDate(selectedDate, students);
	}, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

	const loadStudents = async () => {
		try {
			setLoading(true);
			const res = await axios.get(`${API_BASE}/${user.id}/students`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			const loadedStudents = res.data || [];
			setStudents(loadedStudents);
			const initialStatuses = {};
			loadedStudents.forEach((st) => {
				initialStatuses[st._id] = "present";
			});
			setStatuses(initialStatuses);
			if (!isSunday(selectedDate)) {
				await loadAttendanceForDate(selectedDate, loadedStudents);
			}
		} catch (err) {
			console.error("Failed to load students", err);
			alert("Could not load students for attendance");
		} finally {
			setLoading(false);
		}
	};

	const loadAttendanceForDate = async (date, studentList = students) => {
		try {
			const res = await axios.get(`${API_BASE}/${user.id}/attendance`, {
				params: { start: date, end: date },
				headers: { Authorization: `Bearer ${token}` }
			});
			const map = {};
			(res.data || []).forEach((rec) => {
				map[rec.studentId] = rec.status;
			});
			// default any missing students to present
			studentList.forEach((st) => {
				if (!map[st._id]) map[st._id] = "present";
			});
			setStatuses(map);
		} catch (err) {
			console.error("Failed to load attendance", err);
			setMessage("No previous attendance found for this date. Mark new entries.");
		}
	};

	const handleDateChange = (e) => {
		const value = e.target.value;
		if (isSunday(value)) {
			alert("Attendance cannot be taken on Sundays.");
			return;
		}
		setSelectedDate(value);
	};

	const handleStatusChange = (studentId, status) => {
		setStatuses((prev) => ({ ...prev, [studentId]: status }));
	};

	const submitAttendance = async () => {
		if (isSunday(selectedDate)) {
			alert("Attendance cannot be taken on Sundays.");
			return;
		}

		const records = students.map((st) => ({
			studentId: st._id,
			status: statuses[st._id] || "present"
		}));

		try {
			setSaving(true);
			await axios.post(
				`${API_BASE}/${user.id}/attendance`,
				{ date: selectedDate, records },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setMessage("Attendance saved successfully.");
		} catch (err) {
			console.error("Failed to save attendance", err);
			alert(err.response?.data?.message || "Could not save attendance");
		} finally {
			setSaving(false);
		}
	};

	if (!isStaff) {
		return (
			<div className="staff-guard">
				<h3>Access restricted</h3>
				<p>You need a staff account to view attendance.</p>
				<Link to="/login" className="btn-secondary">Go to login</Link>
			</div>
		);
	}

	if (loading) {
		return <div className="staff-loading">Loading attendance...</div>;
	}

	return (
		<div className="staff-page">
			<div className="staff-card">
				<div className="card-header">
					<div>
						<h3>Daily attendance</h3>
						<p className="muted">Mark present/absent for each student. Sundays are skipped.</p>
					</div>
					<div className="date-row">
						<input type="date" value={selectedDate} onChange={handleDateChange} />
						<button className="btn-ghost" onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}>Today</button>
					</div>
				</div>
				{message && <div className="info-banner">{message}</div>}

				<div className="table-wrapper">
					<table className="staff-table">
						<thead>
							<tr>
								<th>Student</th>
								<th>Class</th>
								<th>Section</th>
								<th>Roll</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{students.map((st) => (
								<tr key={st._id}>
									<td>{st.name}</td>
									<td>{st.class}</td>
									<td>{st.section}</td>
									<td>{st.rollNo}</td>
									<td>
										<div className="attendance-toggle">
											<button
												type="button"
												className={`attendance-btn present ${statuses[st._id] === "present" ? "active" : ""}`}
												onClick={() => handleStatusChange(st._id, "present")}
												title="Mark as Present"
											>
												✓ Present
											</button>
											<button
												type="button"
												className={`attendance-btn absent ${statuses[st._id] === "absent" ? "active" : ""}`}
												onClick={() => handleStatusChange(st._id, "absent")}
												title="Mark as Absent"
											>
												✕ Absent
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{students.length === 0 && <div className="empty">No students available for attendance.</div>}
				</div>

				<div className="form-actions">
					<button className="btn-primary" onClick={submitAttendance} disabled={saving}>
						{saving ? "Saving..." : "Save attendance"}
					</button>
					<Link to="/staff/dashboard" className="btn-ghost">Back to dashboard</Link>
				</div>
			</div>
		</div>
	);
}
