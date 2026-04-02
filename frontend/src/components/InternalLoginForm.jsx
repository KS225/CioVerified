import { useState } from "react";
import "../styles/login.css"; // adjust path if needed
import { useNavigate } from "react-router-dom";

export default function InternalLoginForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Internal Team Login</h2>

        <form onSubmit={handleSubmit}>
          {/* Username / Email */}
          <input
            type="text"
            name="identifier"
            placeholder="Username or Email"
            value={form.identifier}
            onChange={handleChange}
            required
          />

          {/* Password */}
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* Button */}
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Forgot */}
        <div className="forgot">Forgot Password?</div>

        {/* Links */}
        <div className="links">
          <p onClick={() => navigate("/login")}>Company Login</p>
<p onClick={() => navigate("/assessor/login")}>
  Auditor / Reviewer Login
</p>
        </div>
      </div>
    </div>
  );
}