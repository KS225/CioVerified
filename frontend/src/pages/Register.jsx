import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [turnstileError, setTurnstileError] = useState("");

  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaExpiresIn, setCaptchaExpiresIn] = useState(0);
  const formatCaptchaTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,16}$/;

  const fetchCaptcha = async () => {
  try {
    setCaptchaError("");
    setCaptchaInput("");

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/captcha`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load captcha");
    }

    setCaptchaSvg(data.captcha);
    setCaptchaExpiresIn(data.expiresIn || 120);
  } catch (error) {
    console.error("Captcha load error:", error);
    setCaptchaError("Could not load captcha. Please refresh.");
  }
};

  useEffect(() => {
    fetchCaptcha();

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

  useEffect(() => {
  if (captchaExpiresIn <= 0) return;

  const timer = setInterval(() => {
    setCaptchaExpiresIn((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        fetchCaptcha(); // auto refresh
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [captchaExpiresIn]);


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

    if (!captchaInput.trim()) {
      alert("Please enter the captcha characters");
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
        captchaInput,
      };

      await API.post("/auth/register", payload, {
        withCredentials: true,
      });

      alert("OTP sent to your registered email");

      navigate("/verify-otp", {
        state: {
          email: formData.email.trim().toLowerCase(),
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Server error. Please try again later."
      );
      resetTurnstile();
      fetchCaptcha();
      setCaptchaInput("");
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

          <label>Enter the characters shown below</label>
          <div className="captcha-box">
            {captchaSvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: captchaSvg }}
              />
            ) : (
              <p>Loading captcha...</p>
            )}
          </div>

          <div className="captcha-meta">
  <span className="captcha-note">Case-sensitive</span>
  <span className="captcha-timer">
    Expires in: {formatCaptchaTime(captchaExpiresIn)}
  </span>
</div>

          <div className="captcha-row">
            <input
              type="text"
              name="captchaInput"
              placeholder="Enter captcha"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              autoComplete="off"
              required
            />
            <button
              type="button"
              className="refresh-captcha-btn"
              onClick={() => {
                fetchCaptcha();
                setCaptchaInput("");
              }}
            >
              Refresh
            </button>
          </div>

          {captchaError && (
            <p className="turnstile-text error">{captchaError}</p>
          )}

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