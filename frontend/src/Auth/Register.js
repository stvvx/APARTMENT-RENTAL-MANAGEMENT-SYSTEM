import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TenantHeader from "../header/tenant_header";

const API_URL = "http://localhost:5000/api/auth/register";

// Global styles
const injectStyles = () => {
  if (document.getElementById("auth-styles")) return;
  const style = document.createElement("style");
  style.id = "auth-styles";
  style.textContent = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .auth-error { animation: slideIn 0.3s ease; }
    .auth-success { animation: slideIn 0.3s ease; }
    .auth-input:focus {
      box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
    }
    .auth-button { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .auth-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255, 56, 92, 0.3); }
    .auth-button:active:not(:disabled) { transform: translateY(0); }
  `;
  document.head.appendChild(style);
};
injectStyles();

const getPasswordStrength = (pwd) => {
  if (!pwd) return { level: 0, text: "", color: "#ddd" };
  if (pwd.length < 6) return { level: 1, text: "Weak", color: "#e74c3c" };
  if (pwd.length < 8 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { level: 2, text: "Fair", color: "#f39c12" };
  if (/[!@#$%^&*]/.test(pwd)) return { level: 3, text: "Strong", color: "#27ae60" };
  return { level: 2, text: "Fair", color: "#f39c12" };
};

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "tenant" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      
      // Store token and user data
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      setSuccess("Registration successful! Redirecting to profile...");
      setName("");
      setEmail("");
      setPassword("");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
      display: "flex",
      flexDirection: "column",
    },
    content: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    },
    wrapper: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      maxWidth: 960,
      width: "100%",
      gap: 40,
      alignItems: "center",
    },
    illustration: {
      display: "flex",
      flexDirection: "column",
      gap: 24,
      justifyContent: "center",
    },
    illIcon: {
      fontSize: 80,
      textAlign: "center",
      lineHeight: 1,
    },
    illTitle: {
      fontSize: 28,
      fontWeight: 800,
      color: "#222",
      textAlign: "center",
      lineHeight: 1.3,
    },
    illSubtitle: {
      fontSize: 15,
      color: "#717171",
      textAlign: "center",
      lineHeight: 1.6,
    },
    card: {
      background: "#fff",
      borderRadius: 20,
      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      padding: "48px 40px",
      border: "1px solid rgba(255,56,92,0.05)",
      animation: "slideIn 0.5s ease",
      maxHeight: "85vh",
      overflowY: "auto",
    },
    title: {
      fontSize: 28,
      fontWeight: 700,
      color: "#222",
      marginBottom: 8,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      letterSpacing: "-0.5px",
    },
    subtitle: {
      fontSize: 14,
      color: "#717171",
      marginBottom: 24,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      lineHeight: 1.5,
    },
    formGroup: {
      marginBottom: 18,
    },
    label: {
      fontSize: 13,
      fontWeight: 600,
      color: "#222",
      marginBottom: 8,
      display: "block",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    input: {
      width: "100%",
      padding: "13px 16px",
      fontSize: 14,
      border: "1.5px solid #e5e5e5",
      borderRadius: 10,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      boxSizing: "border-box",
      transition: "all 0.3s ease",
      outline: "none",
      background: "#fafafa",
    },
    passwordStrengthContainer: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },
    strengthBar: {
      flex: 1,
      height: 4,
      background: "#e5e5e5",
      borderRadius: 2,
      overflow: "hidden",
    },
    strengthFill: {
      height: "100%",
      transition: "all 0.3s ease",
    },
    strengthText: {
      fontSize: 12,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    button: {
      width: "100%",
      padding: "14px 16px",
      fontSize: 15,
      fontWeight: 700,
      background: "linear-gradient(135deg, #FF385C 0%, #e0174f 100%)",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      cursor: "pointer",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 15px rgba(255,56,92,0.2)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginTop: 8,
    },
    error: {
      background: "#fff5f5",
      color: "#c92a2a",
      fontSize: 13,
      marginBottom: 18,
      padding: "14px 16px",
      borderRadius: 10,
      border: "1px solid #ffc7c7",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    success: {
      background: "#f0fdf4",
      color: "#22863a",
      fontSize: 13,
      marginBottom: 18,
      padding: "14px 16px",
      borderRadius: 10,
      border: "1px solid #c6e9c9",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    divider: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "20px 0",
      color: "#ddd",
      fontSize: 13,
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      background: "#e5e5e5",
    },
    link: {
      marginTop: 16,
      textAlign: "center",
      fontSize: 13,
      color: "#717171",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    linkBtn: {
      background: "none",
      border: "none",
      color: "#FF385C",
      fontWeight: 700,
      cursor: "pointer",
      fontSize: 13,
      textDecoration: "none",
      transition: "opacity 0.2s",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    passwordInputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    passwordInput: {
      flex: 1,
      paddingRight: 45,
    },
    togglePasswordButton: {
      position: "absolute",
      right: 14,
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 18,
      color: "#717171",
      padding: 4,
      transition: "color 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <div style={styles.container}>
      <TenantHeader />
      <div style={styles.content}>
        <div style={styles.wrapper}>
          {/* Left: Illustration */}
          <div style={styles.illustration}>
            <div style={styles.illIcon}>🌟</div>
            <div style={styles.illTitle}>Start Your Journey</div>
            <div style={styles.illSubtitle}>Join thousands of users finding their perfect home on EasRent. It takes less than a minute!</div>
          </div>

          {/* Right: Form */}
          <div style={styles.card}>
            <h1 style={styles.title}>Create account</h1>
            <p style={styles.subtitle}>Join our community</p>

            <form onSubmit={handleSubmit}>
              {error && <div className="auth-error" style={styles.error}><span>⚠️</span> {error}</div>}
              {success && <div className="auth-success" style={styles.success}><span>✓</span> {success}</div>}

              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  className="auth-input"
                  style={styles.input}
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF385C";
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e5e5";
                    e.target.style.background = "#fafafa";
                  }}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  className="auth-input"
                  style={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF385C";
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e5e5";
                    e.target.style.background = "#fafafa";
                  }}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordInputWrapper}>
                  <input
                    className="auth-input"
                    style={{ ...styles.input, ...styles.passwordInput }}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#FF385C";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e5e5";
                      e.target.style.background = "#fafafa";
                    }}
                    required
                  />
                  <button
                    type="button"
                    style={styles.togglePasswordButton}
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseEnter={(e) => (e.target.style.color = "#FF385C")}
                    onMouseLeave={(e) => (e.target.style.color = "#717171")}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {password && (
                  <div style={styles.passwordStrengthContainer}>
                    <div style={styles.strengthBar}>
                      <div
                        style={{
                          ...styles.strengthFill,
                          width: `${(passwordStrength.level / 3) * 100}%`,
                          background: passwordStrength.color,
                        }}
                      />
                    </div>
                    <span style={{ ...styles.strengthText, color: passwordStrength.color }}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="auth-button"
                style={styles.button}
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span>Have an account?</span>
              <div style={styles.dividerLine} />
            </div>

            <div style={styles.link}>
              Already a member:{" "}
              <button style={styles.linkBtn} onClick={() => navigate("/login")}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
