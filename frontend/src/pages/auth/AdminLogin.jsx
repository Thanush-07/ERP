import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./styles/Login.css";
import ematixLogo from "../../assets/ematix.png";

const API_URL = "http://localhost:5000/api/auth/login";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Email and password are required");
        setLoading(false);
        return;
      }

      const payload = { email, password };
      const res = await axios.post(API_URL, payload);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (user.branch_id) {
        localStorage.setItem("branchId", user.branch_id);
      }
      if (user.institution_id) {
        localStorage.setItem("institutionId", user.institution_id);
      }
      if (user.role === "company_admin") {
        navigate("/company-admin/dashboard");
      } else if (user.role === "institution_admin") {
        navigate("/institution/dashboard");
      } else if (user.role === "branch_admin") {
        navigate("/branch/dashboard");
      } else if (user.role === "staff") {
        navigate("/staff/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enterprise-container">
      {/* LEFT SIDE */}
      <div className="enterprise-left">
        <img src={ematixLogo} alt="Ematix Logo" className="left-logo" />

        <div className="left-text">
          <h1 className="left-title">Ematix college Management ERP</h1>
          <p>
            A complete cloud-based enterprise college management system.
            Manage students, staff, attendance, academics, fees & more.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="enterprise-right">
        <div className="form-box glass-card">
          <h2>Welcome Back</h2>
          <p className="form-sub">Login to your admin account</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="admin@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="forgot-link">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}