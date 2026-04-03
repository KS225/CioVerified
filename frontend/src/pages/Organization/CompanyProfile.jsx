import { useEffect, useState } from "react";
import API from "../../services/api";
import "../../styles/companyprofile.css";

function CompanyProfile() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const res = await API.get("/profile");
        const data = res.data;

        setCompany(data);
        setPreviewImage(data.profilePicture || "");
      } catch (err) {
        console.error("Profile fetch error:", err);
        alert(err.response?.data?.message || "Server error while fetching profile");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/120?text=Profile";
    if (imagePath.startsWith("blob:")) return imagePath;
    if (imagePath.startsWith("http")) return imagePath;

    const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "";
    return `${apiBase}${imagePath}`;
  };

  const handleUpdatePhoto = async () => {
    try {
      if (!selectedImage) {
        alert("Please select a profile picture");
        return;
      }

      const submitData = new FormData();
      submitData.append("profilePicture", selectedImage);

      const res = await API.put("/profile/company", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;

      const updatedProfilePicture =
        data.user?.profilePicture || data.profilePicture || "";

      const updatedCompany = {
        ...company,
        profilePicture: updatedProfilePicture,
      };

      setCompany(updatedCompany);
      setPreviewImage(updatedProfilePicture);
      setSelectedImage(null);
      setEditMode(false);

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          ...(data.user || {}),
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
      }

      alert("Profile photo updated successfully");
    } catch (err) {
      console.error("Profile photo update error:", err);
      alert(err.response?.data?.message || "Server error while updating profile photo");
    }
  };

  const handleChangePassword = async () => {
    const { newPassword, confirmPassword } = passwordData;

    if (!newPassword || !confirmPassword) {
      alert("Please fill both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      await API.put("/profile/change-password", {
        newPassword,
        confirmPassword,
      });

      alert("Password changed successfully");
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      });
      setShowPassword({
        newPassword: false,
        confirmPassword: false,
      });
      setPasswordMode(false);
    } catch (err) {
      console.error("Password change error:", err);
      alert(err.response?.data?.message || "Server error while changing password");
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
            src={resolveImageUrl(previewImage)}
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

        <div className="profile-row">
          <span>Company Name</span>
          <p>{company.companyName}</p>
        </div>

        <div className="profile-row">
          <span>Contact Person</span>
          <p>{company.contactPerson || company.username || "N/A"}</p>
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
          <p>{company.phone ? `+91 ${company.phone}` : "N/A"}</p>
        </div>

        {!editMode ? (
          <div className="btn-group">
            <button className="profile-btn" onClick={() => setEditMode(true)}>
              Edit Profile Photo
            </button>

            <button
              className="profile-btn"
              onClick={() => setPasswordMode(!passwordMode)}
            >
              {passwordMode ? "Close Password Section" : "Change Password"}
            </button>
          </div>
        ) : (
          <div className="btn-group">
            <button className="profile-btn" onClick={handleUpdatePhoto}>
              Save Photo
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setEditMode(false);
                setSelectedImage(null);
                setPreviewImage(company.profilePicture || "");
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {passwordMode && (
          <div className="password-section">
            <h3>Change Password</h3>

            <div className="password-input-group">
              <input
                type={showPassword.newPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => togglePasswordVisibility("newPassword")}
              >
                {showPassword.newPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="password-input-group">
              <input
                type={showPassword.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => togglePasswordVisibility("confirmPassword")}
              >
                {showPassword.confirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="btn-group">
              <button className="profile-btn" onClick={handleChangePassword}>
                Update Password
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setPasswordMode(false);
                  setPasswordData({
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setShowPassword({
                    newPassword: false,
                    confirmPassword: false,
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