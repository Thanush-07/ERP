import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./styles//InstitutionLayout.css";

export default function InstitutionLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 600, easing: "ease-out", once: true });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const closeSidebar = () => setOpen(false);

  return (
    <div className={`layout-shell ${open ? "sidebar-open" : ""}`}>
      {/* Mobile top bar */}
      <header className="topbar">
        <button
          type="button"
          className="menu-btn"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        <span className="topbar-title">Institution Admin</span>
      </header>

      {/* Dark overlay on mobile when sidebar open */}
      {open && <div className="backdrop" onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">Ematix School ERP</div>
          <div className="sidebar-subtitle">Institution Admin</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/institution/dashboard"
            className="nav-link"
            onClick={closeSidebar}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/institution/branches"
            className="nav-link"
            onClick={closeSidebar}
          >
            Branches
          </NavLink>
          <NavLink
            to="/institution/reports"
            className="nav-link"
            onClick={closeSidebar}
          >
            Reports
          </NavLink>
          <NavLink
            to="/institution/change-password"
            className="nav-link"
            onClick={closeSidebar}
          >
            Change Password
          </NavLink>
        </nav>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="main">
        <div className="main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
