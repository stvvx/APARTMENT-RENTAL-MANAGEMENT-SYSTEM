import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminHeader() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Admin logo SVG
  const Logo = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
      <circle cx="16" cy="16" r="15" fill="none" stroke="#FF385C" strokeWidth="1.5" />
      <path
        d="M10 18 H22 M10 14 H22 M10 22 H22 M10 18 L10 26 M22 18 L22 26 M12 12 L20 12 L20 16 L12 16 Z"
        fill="none"
        stroke="#FF385C"
        strokeWidth="1.5"
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
          onClick={() => navigate("/admin/dashboard")}
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
            EasRent Admin
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
            { label: "Dashboard", path: "/admin/dashboard" },
            { label: "Apartments", path: "/admin/apartments" },
            { label: "Users", path: "/admin/users" },
            { label: "Reservations", path: "/admin/reservations" },
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
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "none",
                  border: "1px solid #ddd",
                  padding: "8px 12px 8px 16px",
                  borderRadius: 24,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: "#222" }}>
                  ☰
                </span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#FF385C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {user?.name ? user.name[0].toUpperCase() : "A"}
                </div>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    marginTop: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 200,
                  }}
                >
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/admin/profile");
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px 20px",
                      border: "none",
                      background: "none",
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#222",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      borderRadius: "12px 12px 0 0",
                      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    }}
                    onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
                    onMouseLeave={(e) => (e.target.style.background = "none")}
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/admin/settings");
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px 20px",
                      border: "none",
                      background: "none",
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#222",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    }}
                    onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
                    onMouseLeave={(e) => (e.target.style.background = "none")}
                  >
                    Settings
                  </button>
                  <div style={{ height: 1, background: "#ebebeb", margin: "4px 0" }} />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px 20px",
                      border: "none",
                      background: "none",
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#FF385C",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      borderRadius: "0 0 12px 12px",
                      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    }}
                    onMouseEnter={(e) => (e.target.style.background = "#fff5f5")}
                    onMouseLeave={(e) => (e.target.style.background = "none")}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
