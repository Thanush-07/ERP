import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./styles/Staff.css";

const API_BASE = "http://localhost:5000/api/staff";

export default function StaffReports() {
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const token = localStorage.getItem("token");
	const isStaff = user?.role === "staff";

	const [students, setStudents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({ class: "all", search: "", feesDue: false });

	useEffect(() => {
		if (!isStaff || !user?.id) return;
		loadData();
	}, [filters.feesDue]); // eslint-disable-line react-hooks/exhaustive-deps

	const loadData = async () => {
		try {
			setLoading(true);
			if (filters.feesDue) {
				const res = await axios.get(`${API_BASE}/${user.id}/reports/students`, {
					params: { feesDue: true },
					headers: { Authorization: `Bearer ${token}` }
				});
				const data = res.data?.results || [];
				setStudents(data.map((row) => ({ ...row.student, due: row.due })));
			} else {
				const res = await axios.get(`${API_BASE}/${user.id}/students`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				setStudents(res.data || []);
			}
		} catch (err) {
			console.error("Failed to load report data", err);
			alert("Could not load student reports");
		} finally {
			setLoading(false);
		}
	};

	const filteredStudents = useMemo(() => {
		return (students || []).filter((st) => {
			const matchesClass = filters.class === "all" || String(st.class) === filters.class;
			const matchesSearch = filters.search.trim() === "" || st.name?.toLowerCase().includes(filters.search.toLowerCase());
			return matchesClass && matchesSearch;
		});
	}, [students, filters]);

	if (!isStaff) {
		return (
			<div className="staff-guard">
				<h3>Access restricted</h3>
				<p>You need a staff account to view reports.</p>
				<Link to="/login" className="btn-secondary">Go to login</Link>
			</div>
		);
	}

	if (loading) {
		return <div className="staff-loading">Loading reports...</div>;
	}

	return (
		<div className="staff-page">
			<div className="staff-card">
				<div className="card-header">
					<div>
						<h3>Student reports</h3>
						<p className="muted">Filter by class, search by name, or show only students with fee dues.</p>
					</div>
					<div className="filters-row">
						<input
							type="text"
							placeholder="Search by name"
							value={filters.search}
							onChange={(e) => setFilters({ ...filters, search: e.target.value })}
						/>
						<select value={filters.class} onChange={(e) => setFilters({ ...filters, class: e.target.value })}>
							<option value="all">All classes</option>
							{Array.from(new Set(students.map((s) => s.class))).map((cls) => (
								<option key={cls} value={cls}>{cls}</option>
							))}
						</select>
						<label className="toggle">
							<input
								type="checkbox"
								checked={filters.feesDue}
								onChange={(e) => setFilters({ ...filters, feesDue: e.target.checked })}
							/>
							<span>Fees due only</span>
						</label>
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
								<th>Status</th>
								{filters.feesDue && <th>Fee due</th>}
							</tr>
						</thead>
						<tbody>
							{filteredStudents.map((st) => (
								<tr key={st._id}>
									<td>{st.name}</td>
									<td>{st.class}</td>
									<td>{st.section}</td>
									<td>{st.rollNo}</td>
									<td><span className={`badge ${st.status === "active" ? "success" : "muted"}`}>{st.status}</span></td>
									  {filters.feesDue && <td>{st.due ? `Rs ${st.due}` : "No due"}</td>}
								</tr>
							))}
						</tbody>
					</table>
					{filteredStudents.length === 0 && <div className="empty">No students matched the filters.</div>}
				</div>

				<div className="form-actions">
					<Link to="/staff/dashboard" className="btn-ghost">Back to dashboard</Link>
				</div>
			</div>
		</div>
	);
}
