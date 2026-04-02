import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [turnstileError, setTurnstileError] = useState("");

  const [formData, setFormData] = useState({
    organizationName: "",
    contactPerson: "",
    designation: "",
    email: "",
    phone: "",
    source: "",
    referralName: "",
    otherSource: "",
    password: "",
    confirmPassword: "",
  });

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,16}$/;

  useEffect(() => {
    const renderTurnstile = () => {
      if (!window.turnstile || !turnstileRef.current) return;
      if (widgetIdRef.current !== null) return;

      const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

      if (!SITE_KEY) {
        console.error("Missing VITE_TURNSTILE_SITE_KEY in frontend .env");
        setTurnstileError("Security verification could not be loaded.");
        return;
      }

      try {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: SITE_KEY,
          theme: "light",
          appearance: "always",
          callback: (token) => {
            setTurnstileToken(token);
            setTurnstileError("");
          },
          "expired-callback": () => {
            setTurnstileToken("");
            setTurnstileError("Security verification expired. Please try again.");
          },
          "error-callback": () => {
            setTurnstileToken("");
            setTurnstileError("Security verification failed. Please refresh and try again.");
          },
        });

        setTurnstileLoaded(true);
      } catch (error) {
        console.error("Turnstile render error:", error);
        setTurnstileError("Security verification could not be initialized.");
      }
    };

    const existingScript = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]'
    );

    if (existingScript) {
      if (window.turnstile) {
        renderTurnstile();
      } else {
        existingScript.addEventListener("load", renderTurnstile);
      }

      return () => {
        existingScript.removeEventListener("load", renderTurnstile);
      };
    }

    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = renderTurnstile;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileError("");

    if (window.turnstile && widgetIdRef.current !== null) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "source" && value !== "referral"
        ? { referralName: "" }
        : {}),
      ...(name === "source" && value !== "other"
        ? { otherSource: "" }
        : {}),
    }));
  };

  const handleTextOnly = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleNumberOnly = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&#^()_\-+=]/.test(password)) strength++;

    if (strength <= 2) return "Weak";
    if (strength === 3 || strength === 4) return "Medium";
    if (strength === 5) return "Strong";
    return "";
  };

  const validateForm = () => {
    if (!formData.organizationName.trim()) {
      alert("Please enter organization name");
      return false;
    }

    if (!formData.contactPerson.trim()) {
      alert("Please enter contact person");
      return false;
    }

    if (!formData.email.trim()) {
      alert("Please enter official email");
      return false;
    }

    if (!formData.source) {
      alert("Please select a reference source");
      return false;
    }

    if (formData.source === "referral" && !formData.referralName.trim()) {
      alert("Please enter referral name");
      return false;
    }

    if (formData.source === "other" && !formData.otherSource.trim()) {
      alert("Please enter other source");
      return false;
    }

    if (formData.phone && formData.phone.length !== 10) {
      alert("Phone number must be 10 digits");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return false;
    }

    if (!passwordRegex.test(formData.password)) {
      alert(
        "Password must be 8-16 characters long and include:\n" +
          "- At least 1 uppercase letter\n" +
          "- At least 1 lowercase letter\n" +
          "- At least 1 number\n" +
          "- At least 1 special character"
      );
      return false;
    }

    if (
      formData.password.toLowerCase().includes(formData.email.toLowerCase())
    ) {
      alert("Password should not contain your email address.");
      return false;
    }

    if (!turnstileLoaded) {
      alert("Security verification is still loading. Please wait.");
      return false;
    }

    if (!turnstileToken) {
      alert("Please complete the security verification");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        organizationName: formData.organizationName.trim(),
        contactPerson: formData.contactPerson.trim(),
        designation: formData.designation.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        source: formData.source,
        referralName:
          formData.source === "referral" ? formData.referralName.trim() : "",
        otherSource:
          formData.source === "other" ? formData.otherSource.trim() : "",
        password: formData.password,
        turnstileToken,
      };

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        resetTurnstile();
        return;
      }

      alert("OTP sent to your registered email");

      navigate("/verify-otp", {
        state: { email: formData.email.trim().toLowerCase() },
      });
    } catch (error) {
      console.error("Registration error:", error);
      alert("Server error. Please try again later.");
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-inner">
        <h2>Organization Certification Application</h2>

        <form onSubmit={handleSubmit}>
          <label>Organization Name</label>
          <input
            name="organizationName"
            placeholder="Enter organization name"
            value={formData.organizationName}
            onChange={handleChange}
            required
          />

          <label>Contact Person</label>
          <input
            name="contactPerson"
            placeholder="Authorized representative"
            value={formData.contactPerson}
            onChange={handleTextOnly}
            required
          />

          <label>Designation</label>
          <input
            name="designation"
            placeholder="e.g. Director, Compliance Officer"
            value={formData.designation}
            onChange={handleTextOnly}
          />

          <label>Official Email</label>
          <input
            type="email"
            name="email"
            placeholder="name@organization.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Phone Number</label>
          <input
            name="phone"
            placeholder="Official contact number"
            value={formData.phone}
            onChange={handleNumberOnly}
            maxLength={10}
          />

          <label>Reference Source</label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            required
          >
            <option value="">Select source</option>
            <option value="google">Google</option>
            <option value="linkedin">LinkedIn</option>
            <option value="referral">Referral</option>
            <option value="advertisement">Advertisement</option>
            <option value="social_media">Social Media</option>
            <option value="other">Other</option>
          </select>

          {formData.source === "referral" && (
            <>
              <label>Referral Name</label>
              <input
                name="referralName"
                placeholder="Enter referral name"
                value={formData.referralName}
                onChange={handleTextOnly}
                required
              />
            </>
          )}

          {formData.source === "other" && (
            <>
              <label>Other Source</label>
              <input
                name="otherSource"
                placeholder="Please specify"
                value={formData.otherSource}
                onChange={handleChange}
                required
              />
            </>
          )}

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={(e) => {
                handleChange(e);
                setPasswordStrength(checkPasswordStrength(e.target.value));
              }}
              minLength={8}
              maxLength={16}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {formData.password && (
            <div className={`strength ${passwordStrength?.toLowerCase()}`}>
              Password Strength: {passwordStrength}
            </div>
          )}

          <label>Confirm Password</label>
          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ cursor: "pointer" }}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </span>
          </div>

          <label>Security Verification</label>
          <div
            style={{
              marginTop: "8px",
              marginBottom: "18px",
              minHeight: "70px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div ref={turnstileRef} />
          </div>

          {!turnstileLoaded && !turnstileError && (
            <p style={{ fontSize: "14px", color: "#666", marginTop: "-8px" }}>
              Loading security verification...
            </p>
          )}

          {turnstileError && (
            <p style={{ fontSize: "14px", color: "#d32f2f", marginTop: "-8px" }}>
              {turnstileError}
            </p>
          )}

          <button type="submit" disabled={submitting || !turnstileLoaded}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <div className="auth-helper">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;