import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TenantHeader() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Airbnb-like logo SVG
  const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
      <circle cx="16" cy="16" r="15" fill="none" stroke="#FF385C" strokeWidth="1.5" />
      <path
        d="M16 8 C16 8, 12 14, 12 17 C12 19.2, 13.8 21, 16 21 C18.2 21, 20 19.2, 20 17 C20 14, 16 8, 16 8 Z M16 18 C15.4 18, 15 17.6, 15 17 C15 16.4, 15.4 16, 16 16 C16.6 16, 17 16.4, 17 17 C17 17.6, 16.6 18, 16 18 Z"
        fill="#FF385C"
      />
    </svg>
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#fff",
        borderBottom: "1px solid #eee",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 80,
        }}
      >
        {/* Logo & Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <Logo />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#222",
              letterSpacing: "-0.5px",
            }}
          >
            EasRent
          </span>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            display: "flex",
            gap: 0,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {[
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                background: "none",
                border: "none",
                padding: "12px 20px",
                fontSize: 15,
                fontWeight: 500,
                color: "#222",
                cursor: "pointer",
                transition: "color 0.2s",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#FF385C")}
              onMouseLeave={(e) => (e.target.style.color = "#222")}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Section - User Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {token && (
            <button
              onClick={() => navigate("/wishlist")}
              style={{
                background: "none",
                border: "none",
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 600,
                color: "#222",
                cursor: "pointer",
                transition: "all 0.2s",
                borderRadius: 24,
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "none";
              }}
            >
              ♥ Wishlist
            </button>
          )}

          {!token ? (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#222",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  borderRadius: 24,
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "none";
                }}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  background: "#FF385C",
                  color: "#fff",
                  border: "none",
                  padding: "12px 24px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  borderRadius: 24,
                  transition: "all 0.2s",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#dc3545";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#FF385C";
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "none",
                  border: "1px solid #ddd",
                  padding: "8px 12px",
                  borderRadius: 24,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Menu Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                {/* Profile Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: user?.profilePicture ? `url(${user.profilePicture}) center/cover no-repeat` : "#FF385C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {!user?.profilePicture && (user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U")}
                </div>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 12,
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    minWidth: 220,
                    overflow: "hidden",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#717171",
                      }}
                    >
                      {user?.email}
                    </div>
                    <div
                      style={{
                        padding: "8px 16px",
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#222",
                      }}
                    >
                      {user?.name || "My Account"}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setUserMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "12px 16px",
                      fontSize: 14,
                      color: "#222",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "none";
                    }}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/applications");
                      setUserMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "12px 16px",
                      fontSize: 14,
                      color: "#222",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "none";
                    }}
                  >
                    Applications
                  </button>
                  <button
                    onClick={() => {
                      navigate("/payments");
                      setUserMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "12px 16px",
                      fontSize: 14,
                      color: "#222",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "none";
                    }}
                  >
                    Payments
                  </button>
                  <button
                    onClick={() => {
                      navigate("/contact");
                      setUserMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "12px 16px",
                      fontSize: 14,
                      color: "#222",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "none";
                    }}
                  >
                    Contact & Support
                  </button>
                  <div style={{ borderTop: "1px solid #f0f0f0" }}>
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        padding: "12px 16px",
                        fontSize: 14,
                        color: "#FF385C",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.2s",
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#fff5f7";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "none";
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
