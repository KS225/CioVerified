import { useEffect, useState } from "react";
import "../../styles/companyprofile.css";

function CompanyProfile() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    registrationNumber: "",
    industry: "",
    contactPerson: "",
    designation: "",
    email: "",
    phone: "",
    profilePicture: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Failed to fetch profile");
          return;
        }

        setCompany(data);
        setFormData({
          companyName: data.companyName || "",
          registrationNumber: data.registrationNumber || "",
          industry: data.industry || "",
          contactPerson: data.contactPerson || "",
          designation: data.designation || "",
          email: data.email || "",
          phone: data.phone || "",
          profilePicture: data.profilePicture || ""
        });
        setPreviewImage(data.profilePicture || "");
      } catch (err) {
        console.error(err);
        alert("Server error while fetching profile");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    try {
      const submitData = new FormData();

      submitData.append("companyName", formData.companyName);
      submitData.append("registrationNumber", formData.registrationNumber);
      submitData.append("industry", formData.industry);
      submitData.append("contactPerson", formData.contactPerson);
      submitData.append("designation", formData.designation);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);

      if (selectedImage) {
        submitData.append("profilePicture", selectedImage);
      }

      const res = await fetch("http://localhost:5000/api/profile/company", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: submitData
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Update failed");
        return;
      }

      alert("Updated successfully");

      const updatedCompany = {
        ...formData,
        profilePicture: data.profilePicture || previewImage
      };

      setCompany(updatedCompany);
      setFormData(updatedCompany);
      setEditMode(false);
      setSelectedImage(null);
    } catch (err) {
      console.error(err);
      alert("Server error while updating profile");
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/profile/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Password change failed");
        return;
      }

      alert("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordMode(false);
    } catch (err) {
      console.error(err);
      alert("Server error while changing password");
    }
  };

  if (loading) return <div className="profile-container">Loading...</div>;
  if (!company) return <div className="profile-container">No data found</div>;

  return (
    <div className="profile-container">
      <h2>Company Profile</h2>

      <div className="profile-card">
        <div className="profile-image-section">
          <img
  src={
    previewImage
      ? previewImage.startsWith("blob:")
        ? previewImage
        : `http://localhost:5000${previewImage}`
      : "https://via.placeholder.com/120?text=Profile"
  }
  alt="Profile"
  className="profile-image"
/>

          {editMode && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          )}
        </div>

        {!editMode ? (
          <>
            <div className="profile-row">
              <span>Company Name</span>
              <p>{company.companyName}</p>
            </div>

            <div className="profile-row">
              <span>CIN</span>
              <p>{company.registrationNumber}</p>
            </div>

            <div className="profile-row">
              <span>Industry</span>
              <p>{company.industry || "N/A"}</p>
            </div>

            <div className="profile-row">
              <span>Contact Person</span>
              <p>{company.contactPerson}</p>
            </div>

            <div className="profile-row">
              <span>Designation</span>
              <p>{company.designation || "N/A"}</p>
            </div>

            <div className="profile-row">
              <span>Email</span>
              <p>{company.email}</p>
            </div>

            <div className="profile-row">
              <span>Phone</span>
              <p>{company.phone || "N/A"}</p>
            </div>

            <div className="btn-group">
              <button className="profile-btn" onClick={() => setEditMode(true)}>
                Edit Details
              </button>

              <button className="profile-btn" onClick={() => setPasswordMode(!passwordMode)}>
                {passwordMode ? "Close Password Section" : "Change Password"}
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Company Name"
            />
            <input
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="CIN"
            />
            <input
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="Industry"
            />
            <input
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Contact Person"
            />
            <input
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Designation"
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
            />

            <div className="btn-group">
              <button className="profile-btn" onClick={handleUpdate}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setEditMode(false);
                  setFormData(company);
                  setPreviewImage(company.profilePicture || "");
                  setSelectedImage(null);
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {passwordMode && (
          <div className="password-section">
            <h3>Change Password</h3>

            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />

            <div className="btn-group">
              <button className="profile-btn" onClick={handleChangePassword}>
                Update Password
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setPasswordMode(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyProfile;