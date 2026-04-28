import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TenantHeader from "../header/tenant_header";

const VERIFY_URL = "http://localhost:5000/api/auth/verify-email";
const RESEND_URL = "http://localhost:5000/api/auth/resend-otp";

// Reuse the same injected auth styles used by Login/Register
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

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = useMemo(() => location.state?.email || "", [location.state]);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);
      }

      setSuccess("Email verified successfully! Redirecting...");
      setTimeout(() => {
        const role = data.user?.role;
        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "landlord") navigate("/landlord/dashboard");
        else navigate("/profile");
      }, 900);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);
    try {
      const res = await fetch(RESEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Resend failed");
      setSuccess("A new OTP was sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
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
      maxWidth: 520,
      width: "100%",
    },
    card: {
      background: "#fff",
      borderRadius: 20,
      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      padding: "48px 40px",
      border: "1px solid rgba(255,56,92,0.05)",
      animation: "slideIn 0.5s ease",
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
    row: {
      display: "flex",
      gap: 12,
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
    },
    secondaryBtn: {
      width: "100%",
      padding: "14px 16px",
      fontSize: 15,
      fontWeight: 700,
      background: "#fff",
      color: "#FF385C",
      border: "1.5px solid rgba(255,56,92,0.35)",
      borderRadius: 10,
      cursor: "pointer",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
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
    }
  };

  return (
    <div style={styles.container}>
      <TenantHeader />
      <div style={styles.content}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <h1 style={styles.title}>Verify Email</h1>
            <p style={styles.subtitle}>
              Enter the OTP sent to your registered email to activate your account.
            </p>

            {error && (
              <div style={styles.error} className="auth-error">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div style={styles.success} className="auth-success">
                <span>✓</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>OTP</label>
                <input
                  style={styles.input}
                  className="auth-input"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  required
                />
              </div>

              <div style={styles.row}>
                <button
                  type="submit"
                  style={styles.button}
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>

                <button
                  type="button"
                  style={styles.secondaryBtn}
                  className="auth-button"
                  disabled={resending || !email}
                  onClick={handleResend}
                >
                  {resending ? "Sending..." : "Resend"}
                </button>
              </div>
            </form>

            <div style={styles.link}>
              Already verified?{" "}
              <button
                type="button"
                style={styles.linkBtn}
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
