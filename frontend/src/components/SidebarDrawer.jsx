import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileDrawer from "./ProfileDrawer";
import {
  FiHome,
  FiUsers,
  FiUser,
  FiPlus,
  FiLogOut
} from "react-icons/fi";

import "../styles/drawer.css";

export default function SidebarDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="overlay" onClick={onClose}></div>

      {/* Drawer */}
      <div className="drawer open">
        {/* 🔥 HEADER */}
        <div className="drawer-header">
          <div className="drawer-avatar">
            {user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <strong>{user?.username}</strong>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              {user?.role}
            </div>
          </div>
        </div>

        {!showProfile ? (
          <>
            {/* MENU */}
            <div className="drawer-section">
              <div className="drawer-title">Menu</div>

              <div className="drawer-item" onClick={() => navigate("/internal/superadmin")}>
                <FiHome /> Dashboard
              </div>

              <div className="drawer-item" onClick={() => navigate("/internal/superadmin/create-user")}>
                <FiPlus /> Create User
              </div>

              <div className="drawer-item" onClick={() => navigate("/internal/superadmin/users")}>
                <FiUsers /> Users
              </div>
            </div>

            <div className="divider"></div>

            {/* PROFILE */}
            <div className="drawer-section">
              <div className="drawer-item" onClick={() => setShowProfile(true)}>
                <FiUser /> Profile Settings
              </div>
            </div>

            <div className="divider"></div>

            {/* LOGOUT */}
            <div
              className="drawer-item logout"
              onClick={() => {
                localStorage.clear();
                navigate("/internal-login");
              }}
            >
              <FiLogOut /> Logout
            </div>
          </>
        ) : (
          <ProfileDrawer onClose={() => setShowProfile(false)} />
        )}
      </div>
    </>
  );
}