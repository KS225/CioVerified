import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/auth.css";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const passedEmail = location.state?.email || "";

  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const [formData, setFormData] = useState({
    email: passedEmail,
    otp: "",
    organizationName: "",
    contactPerson: "",
    designation: "",
    phone: "",
    source: "",
    referralName: "",
    otherSource: "",
  });

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

  const validateForm = () => {
    if (!formData.email.trim()) {
      alert("Email is required");
      return false;
    }

    if (!formData.otp.trim()) {
      alert("OTP is required");
      return false;
    }

    if (!formData.organizationName.trim()) {
      alert("Organization name is required");
      return false;
    }

    if (!formData.contactPerson.trim()) {
      alert("Contact person is required");
      return false;
    }

    if (!formData.source) {
      alert("Please select a reference source");
      return false;
    }

    if (formData.phone && formData.phone.length !== 10) {
      alert("Phone number must be 10 digits");
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

    return true;
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim(),
        organizationName: formData.organizationName.trim(),
        contactPerson: formData.contactPerson.trim(),
        designation: formData.designation.trim(),
        phone: formData.phone.trim(),
        source: formData.source,
        referralName:
          formData.source === "referral" ? formData.referralName.trim() : "",
        otherSource:
          formData.source === "other" ? formData.otherSource.trim() : "",
      };

      await API.post("/auth/verify-registration-otp", payload);

      alert("Registration completed successfully");
      navigate("/login");
    } catch (error) {
      console.error("OTP verify error:", error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Server error. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email.trim()) {
      alert("Email is required to resend OTP");
      return;
    }

    try {
      setResending(true);

      await API.post("/auth/resend-registration-otp", {
        email: formData.email.trim().toLowerCase(),
      });

      alert("OTP resent successfully");
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Server error while resending OTP"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-inner">
        <h2>Verify OTP</h2>
        <p className="subtitle">
          Enter the OTP sent to your email and complete your organization
          details.
        </p>

        <form onSubmit={handleVerify}>
          <label htmlFor="verifyEmail">Official Email</label>
          <input
            id="verifyEmail"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="otp">OTP</label>
          <input
            id="otp"
            name="otp"
            placeholder="Enter 6-digit OTP"
            value={formData.otp}
            onChange={handleNumberOnly}
            maxLength={6}
            required
          />

          <label htmlFor="organizationName">Organization Name</label>
          <input
            id="organizationName"
            name="organizationName"
            placeholder="Enter organization name"
            value={formData.organizationName}
            onChange={handleChange}
            autoComplete="organization"
            required
          />

          <label htmlFor="contactPerson">Contact Person</label>
          <input
            id="contactPerson"
            name="contactPerson"
            placeholder="Authorized representative"
            value={formData.contactPerson}
            onChange={handleTextOnly}
            autoComplete="name"
            required
          />

          <label htmlFor="designation">Designation</label>
          <input
            id="designation"
            name="designation"
            placeholder="e.g. Director, Compliance Officer"
            value={formData.designation}
            onChange={handleTextOnly}
          />

          <label htmlFor="phone">Phone Number</label>
          <div className="phone-input-group">
            <span className="country-code">+91</span>
            <input
              id="phone"
              name="phone"
              placeholder="Enter 10-digit number"
              value={formData.phone}
              onChange={handleNumberOnly}
              autoComplete="tel"
              maxLength={10}
            />
          </div>

          <label htmlFor="source">Reference Source</label>
          <select
            id="source"
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
              <label htmlFor="referralName">Referral Name</label>
              <input
                id="referralName"
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
              <label htmlFor="otherSource">Other Source</label>
              <input
                id="otherSource"
                name="otherSource"
                placeholder="Please specify"
                value={formData.otherSource}
                onChange={handleChange}
                required
              />
            </>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? "Verifying..." : "Verify & Complete Registration"}
          </button>
        </form>

        <div className="auth-helper">
          Didn’t receive the OTP?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending}
            style={{
              background: "none",
              border: "none",
              color: "#2f6fed",
              cursor: "pointer",
              padding: 0,
              fontWeight: 500,
            }}
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;