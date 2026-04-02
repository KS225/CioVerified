import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react"; // ✅ FIX
import "../styles/sidebar.css";
import ProfileDrawer from "./ProfileDrawer";

export default function InternalSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openProfile, setOpenProfile] = useState(false);

  const menu = [
    { name: "Dashboard", path: "/internal/superadmin" },
    { name: "Create User", path: "/internal/superadmin/create-user" },
    { name: "Users", path: "/internal/superadmin/users" },
  ];

  return (
    <>
      <div className="sidebar">
        <h2>CIO Verified</h2>

        {/* Normal menu */}
        {menu.map((item) => (
          <div
            key={item.path}
            className={`sidebar-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            {item.name}
          </div>
        ))}

        {/* 🔥 PROFILE (DRAWER TRIGGER) */}
        <div
          className="sidebar-item"
          onClick={() => setOpenProfile(true)}
        >
          Profile
        </div>

        {/* Logout */}
        <div
          className="sidebar-item logout"
          onClick={() => {
            localStorage.clear();
            navigate("/internal-login");
          }}
        >
          Logout
        </div>
      </div>

      {/* 🔥 DRAWER COMPONENT */}
      <ProfileDrawer
        open={openProfile}
        onClose={() => setOpenProfile(false)}
      />
    </>
  );
}