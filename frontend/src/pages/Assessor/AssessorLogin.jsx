import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "../../styles/login.css";

export default function AssessorLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { ...formData,
        isAssessor: true, // flag to indicate assessor login
       }
      );

      const { user, token } = res.data;

      // ✅ Store in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // ✅ Single redirect (your approach)
      navigate("/assessor/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Assessor Login</h2>
        <p className="subtitle">Auditor & Reviewer Access</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {/* Links */}
        <div className="links">
          <p onClick={() => navigate("/login")}>Company Login</p>
<p onClick={() => navigate("/internal-login")}>
  CIO Verified Member?
  </p>
        </div>
      </div>
    </div>
  ); 
}