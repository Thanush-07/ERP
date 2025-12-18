import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../Company_admin/styles/CompanyLayout.css";

export default function StaffLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
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
              <div className="brand-name">Staff</div>
              <div className="brand-role">Class & Fees</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/staff/dashboard" className="nav-link" onClick={() => setOpen(false)}>
              Dashboard
            </NavLink>
            <NavLink to="/staff/attendance" className="nav-link" onClick={() => setOpen(false)}>
              Attendance
            </NavLink>
            <NavLink to="/staff/reports" className="nav-link" onClick={() => setOpen(false)}>
              Reports
            </NavLink>
            <NavLink to="/staff/collect-fee" className="nav-link" onClick={() => setOpen(false)}>
              Fee Collection
            </NavLink>
            <NavLink to="/staff/change-password" className="nav-link" onClick={() => setOpen(false)}>
              Change Password
            </NavLink>
          </nav>

          <button className="sidebar-logout" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <main className="main">
          <header className="main-header">
            <button className="menu-btn" onClick={() => setOpen(true)}>
              Menu
            </button>
            <div className="main-title">Staff Portal</div>
            <div className="main-user">{user?.name || "Staff"}</div>
          </header>

          <div className="main-body">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
