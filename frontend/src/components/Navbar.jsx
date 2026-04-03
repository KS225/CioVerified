import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "../styles/navbar.css";
import logo from "../assets/cio-logo.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    setIsLoggedIn(!!token);
    setUser(storedUser);
  }, [location]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    navigate("/login");
  };

  const handleProfileClick = () => {
    setProfileMenuOpen(false);
    navigate("/profile");
  };

  return (
    <header className="granuler-navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <a href="https://cioverified.com/" target="_blank" rel="noopener noreferrer">
            <img src={logo} alt="CIO Verified logo" className="logo-image" />
          </a>
        </div>

        <nav className="nav-links desktop-nav">
          <a href="https://cioverified.com" target="_blank" rel="noopener noreferrer">
            Home
          </a>
          <a href="https://cioverified.com/about" target="_blank" rel="noopener noreferrer">
            About Us
          </a>
          <a
            href="https://cioverified.com/certified-companies"
            target="_blank"
            rel="noopener noreferrer"
          >
            Certified Companies
          </a>
          <a href="https://cioverified.com/blogs" target="_blank" rel="noopener noreferrer">
            Blogs
          </a>
          <a href="https://cioverified.com/contact-us" target="_blank" rel="noopener noreferrer">
            Contact Us
          </a>
        </nav>

        <div className="nav-right">
          {isLoggedIn && (
            <div className="avatar-dropdown" ref={dropdownRef}>
              <button
                className="avatar"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                title="Open profile menu"
                type="button"
              >
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </button>

              {profileMenuOpen && (
                <div className="profile-dropdown-menu">
                  <div className="profile-dropdown-header">
                    <p className="profile-name">{user?.username || "User"}</p>
                    <p className="profile-email">{user?.email || ""}</p>
                  </div>

                  <button
                    className="profile-dropdown-item"
                    type="button"
                    onClick={handleProfileClick}
                  >
                    Profile
                  </button>

                  <button
                    className="profile-dropdown-item logout-item"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className={`mobile-menu-btn ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}>
        <a href="https://cioverified.com" target="_blank" rel="noopener noreferrer">
          Home
        </a>
        <a href="https://cioverified.com/about" target="_blank" rel="noopener noreferrer">
          About Us
        </a>
        <a
          href="https://cioverified.com/certified-companies"
          target="_blank"
          rel="noopener noreferrer"
        >
          Certified Companies
        </a>
        <a href="https://cioverified.com/blogs" target="_blank" rel="noopener noreferrer">
          Blogs
        </a>
        <a href="https://cioverified.com/contact-us" target="_blank" rel="noopener noreferrer">
          Contact Us
        </a>

        {isLoggedIn && (
          <>
            <button className="mobile-profile-btn" type="button" onClick={handleProfileClick}>
              Profile
            </button>
            <button className="mobile-logout-btn" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;