import { useEffect, useState } from "react";
import "../../styles/assessorprofile.css";
import { useSearchParams } from "react-router-dom";
import API from "../../services/api";

function AssessorProfile() {
  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [valid, setValid] = useState(false);

  const initialForm = {
    full_name: "",
    phone: "",
    type: "",
    email: "",
    experience_years: "",
    specialization: "",
    certificate: null,
    resume: null,
    company_name: "",
    gstin: "",
    company_profile: null,
    address: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // TOKEN VALIDATION
  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await API.get(`/assessor/validate-token?token=${token}`);
        if (res.data.valid) {
          setValid(true);
          setFormData((prev) => ({
            ...prev,
            email: res.data.email,
          }));
        }
      } catch {
        alert("Invalid or expired link");
      }
    };

    if (token) validateToken();
  }, [token]);

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // TYPE SWITCH
  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...initialForm,
      type,
      full_name: prev.full_name,
      phone: prev.phone,
      email: prev.email,
    }));
    setErrors({});
  };

  // VALIDATION
  const validate = () => {
    let newErrors = {};

    if (!formData.full_name.trim())
      newErrors.full_name = "Full name is required";

    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Enter valid 10-digit phone";

    if (!formData.type)
      newErrors.type = "Select type";

    if (!formData.email.trim())
      newErrors.email = "Email is required";

    if (!formData.address.trim())
      newErrors.address = "Address is required";

    if (formData.type === "individual") {
      if (!formData.experience_years)
        newErrors.experience_years = "Experience is required";

      if (!formData.specialization)
        newErrors.specialization = "Specialization is required";

      if (!formData.resume)
        newErrors.resume = "Resume is required";

      if (!formData.certificate)
        newErrors.certificate = "Certificate is required";
    }

    if (formData.type === "company") {
      if (!formData.company_name)
        newErrors.company_name = "Company name is required";

      if (!formData.gstin)
        newErrors.gstin = "GSTIN is required";

      if (!formData.company_profile)
        newErrors.company_profile = "Company profile is required";

      if (!formData.certificate)
        newErrors.certificate = "Certificate is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      form.append("token", token);

      await API.post("/assessor/submit-profile", form, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

      alert("Profile Submitted Successfully ✅");
    } catch {
      alert("Submission failed ❌");
    }
  };

  if (!valid) return <h2>Invalid or expired invitation link ❌</h2>;

  return (
    <div className="profile-container">
      <h1>Create Assessor Profile</h1>

      <form onSubmit={handleSubmit} className="profile-form">
        <input
          name="full_name"
          placeholder="Full Name *"
          value={formData.full_name}
          onChange={handleChange}
          className={errors.full_name && "input-error"}
        />
        {errors.full_name && <p className="error">{errors.full_name}</p>}

        <input
          name="phone"
          placeholder="Phone Number *"
          value={formData.phone}
          onChange={handleChange}
          className={errors.phone && "input-error"}
        />
        {errors.phone && <p className="error">{errors.phone}</p>}

        <label className="label">Select Type *</label>

        <div className="radio-group">
          <label>
            <input
              type="radio"
              checked={formData.type === "individual"}
              onChange={() => handleTypeChange("individual")}
            />
            Individual
          </label>

          <label>
            <input
              type="radio"
              checked={formData.type === "company"}
              onChange={() => handleTypeChange("company")}
            />
            Company
          </label>
        </div>
        {errors.type && <p className="error">{errors.type}</p>}

        {formData.type && (
          <>
            <input
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              className={errors.email && "input-error"}
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <textarea
              name="address"
              placeholder="Full Address *"
              value={formData.address}
              onChange={handleChange}
              className={errors.address && "input-error"}
            />
            {errors.address && <p className="error">{errors.address}</p>}
          </>
        )}

        {/* INDIVIDUAL */}
        {formData.type === "individual" && (
          <>
            <input
              type="number"
              name="experience_years"
              placeholder="Experience (Years) *"
              value={formData.experience_years}
              onChange={handleChange}
              className={errors.experience_years && "input-error"}
            />
            {errors.experience_years && (
              <p className="error">{errors.experience_years}</p>
            )}

            <input
              name="specialization"
              placeholder="Specialization *"
              value={formData.specialization}
              onChange={handleChange}
              className={errors.specialization && "input-error"}
            />
            {errors.specialization && (
              <p className="error">{errors.specialization}</p>
            )}

            <label className="label">Upload Certificate *</label>
            <input
              type="file"
              name="certificate"
              onChange={handleChange}
              className={errors.certificate && "input-error"}
            />
            {errors.certificate && (
              <p className="error">{errors.certificate}</p>
            )}

            <label className="label">Upload Resume *</label>
            <input
              type="file"
              name="resume"
              onChange={handleChange}
              className={errors.resume && "input-error"}
            />
            {errors.resume && <p className="error">{errors.resume}</p>}
          </>
        )}

        {/* COMPANY */}
        {formData.type === "company" && (
          <>
            <h3>Company Details</h3>

            <input
              name="company_name"
              placeholder="Company Name *"
              value={formData.company_name}
              onChange={handleChange}
              className={errors.company_name && "input-error"}
            />
            {errors.company_name && (
              <p className="error">{errors.company_name}</p>
            )}

            <input
              name="gstin"
              placeholder="GSTIN *"
              value={formData.gstin}
              onChange={handleChange}
              className={errors.gstin && "input-error"}
            />
            {errors.gstin && <p className="error">{errors.gstin}</p>}

            <label className="label">Upload Certificate *</label>
            <input
              type="file"
              name="certificate"
              onChange={handleChange}
              className={errors.certificate && "input-error"}
            />
            {errors.certificate && (
              <p className="error">{errors.certificate}</p>
            )}

            <label className="label">Upload Company Profile *</label>
            <input
              type="file"
              name="company_profile"
              onChange={handleChange}
              className={errors.company_profile && "input-error"}
            />
            {errors.company_profile && (
              <p className="error">{errors.company_profile}</p>
            )}
          </>
        )}

        {formData.type && <button type="submit">Submit</button>}
      </form>
    </div>
  );
}

export default AssessorProfile;