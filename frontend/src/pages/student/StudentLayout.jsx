import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../Company_admin/styles/CompanyLayout.css";

export default function StudentLayout() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "auto";
    }, [open]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("studentId"); // Assuming studentId is stored
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <>
            {open && <div className="backdrop" onClick={() => setOpen(false)} />}

            <div className="shell">
                <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
                    <div className="sidebar-brand">
                        <span className="brand-logo">S</span>
                        <div>
                            <div className="brand-name">Student Portal</div>
                            <div className="brand-role">Student Management</div>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <NavLink to="/student/dashboard" className="nav-link">
                            Dashboard
                        </NavLink>
                        <NavLink to="/student/profile/personal" className="nav-link">
                            Profile
                        </NavLink>
                        <NavLink to="/student/academics/attendance" className="nav-link">
                            Attendance
                        </NavLink>
                        <NavLink to="/student/academics/marks" className="nav-link">
                            Marks
                        </NavLink>
                        <NavLink to="/student/academics/timetable" className="nav-link">
                            Timetable
                        </NavLink>
                        <NavLink to="/student/academics/leave" className="nav-link">
                            Leave
                        </NavLink>
                        <NavLink to="/student/portfolio/sports" className="nav-link">
                            Portfolio
                        </NavLink>
                        <NavLink to="/student/notifications" className="nav-link">
                            Notifications
                        </NavLink>
                        <NavLink to="/student/announcements" className="nav-link">
                            Announcements
                        </NavLink>
                    </nav>

                    <button className="sidebar-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </aside>

                <main className="main">
                    <header className="main-header">
                        <button className="menu-btn" onClick={() => setOpen(true)}>
                            ☰
                        </button>
                        <div className="main-title">Student Portal</div>
                        <div className="main-user">Student</div>
                    </header>

                    <div className="main-body">
                        <Outlet />
                    </div>
                </main>
            </div>
        </>
    );
}
