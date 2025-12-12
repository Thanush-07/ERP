import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./styles/Login.css";
import ematixLogo from "../../assets/ematix.png";

const API_URL = "http://localhost:5000/api/auth/login";

export default function Login() {
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
      const res = await axios.post(API_URL, { email, password });
      const { token, user } = res.data;
localStorage.setItem("token", res.data.token);
localStorage.setItem("user", JSON.stringify(res.data.user));
if (res.data.user.role === "company_admin") {
  navigate("/company");
} else if (res.data.user.role === "institution_admin") {
  navigate("/institution");
} else if (res.data.user.role === "branch_admin") {
  navigate("/branch");
}
      
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
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
          <h1 className="left-title">Ematix School Management ERP</h1>
          <p>
            A complete cloud-based enterprise school management system. 
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
