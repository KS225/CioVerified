import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [turnstileError, setTurnstileError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
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
        console.error("Missing VITE_TURNSTILE_SITE_KEY in frontend env");
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
            setTurnstileError(
              "Security verification failed. Please refresh and try again."
            );
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
    if (!formData.username.trim()) {
      alert("Please enter username");
      return false;
    }

    if (!formData.email.trim()) {
      alert("Please enter email");
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
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        turnstileToken,
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
        state: {
          email: formData.email.trim().toLowerCase(),
        },
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
        <h2>Create Account</h2>
        <p className="subtitle">
          Enter your account details to receive an OTP.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />

          <label htmlFor="email">Official Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="name@organization.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={(e) => {
                handleChange(e);
                setPasswordStrength(checkPasswordStrength(e.target.value));
              }}
              autoComplete="new-password"
              minLength={8}
              maxLength={16}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {formData.password && (
            <div className={`strength ${passwordStrength?.toLowerCase()}`}>
              Password Strength: {passwordStrength}
            </div>
          )}

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          <label>Security Verification</label>
          <div className="turnstile-wrap">
            <div className="turnstile-box" ref={turnstileRef} />
          </div>

          {!turnstileLoaded && !turnstileError && (
            <p className="turnstile-text loading">
              Loading security verification...
            </p>
          )}

          {turnstileError && (
            <p className="turnstile-text error">{turnstileError}</p>
          )}

          <button type="submit" disabled={submitting || !turnstileLoaded}>
            {submitting ? "Sending OTP..." : "Continue"}
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