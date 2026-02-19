import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./styles/Login.css";
import ematixLogo from "../../assets/ematix.png";

const API_URL = "http://localhost:5000/api/auth/login";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loginMode, setLoginMode] = useState("student"); // "student", "parent"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let payload;
      if (loginMode === "student") {
        if (!registerNumber || !phone) {
          setError("Register number and phone are required");
          setLoading(false);
          return;
        }
        payload = { registerNumber, phone };
      } else {
        if (!email || !password) {
          setError("Email and password are required");
          setLoading(false);
          return;
        }
        payload = { email, password };
      }

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
      } else if (user.role === "parent") {
        navigate("/parent/dashboard");
      } else if (user.role === "student") {
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err.response?.status, err.response?.data);
      setError(err.response?.data?.message || err.message || "Invalid login details");
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
          <h1 className="left-title">Ematix college  Management ERP</h1>
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
          <p className="form-sub">Login to your account</p>

          <form onSubmit={handleSubmit}>
            {loginMode === "student" ? (
              <>
                <div className="field">
                  <label>Register Number</label>
                  <input
                    type="text"
                    placeholder="REG2026001"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="parent@school.com"
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
              </>
            )}

            {error && <div className="error">{error}</div>}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="mode-toggle-container">
              <p className="toggle-label">Or continue as {loginMode === "student" ? "Parent" : "Student"}</p>
              <div className="toggle-buttons">
                <button
                  type="button"
                  className={loginMode === "student" ? "toggle-btn-active" : "toggle-btn-inactive"}
                  onClick={() => setLoginMode("student")}
                >
                  Student Login
                </button>
                <button
                  type="button"
                  className={loginMode === "parent" ? "toggle-btn-active" : "toggle-btn-inactive"}
                  onClick={() => setLoginMode("parent")}
                >
                  Parent Login
                </button>
              </div>
            </div>

            <div className="forgot-link">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
