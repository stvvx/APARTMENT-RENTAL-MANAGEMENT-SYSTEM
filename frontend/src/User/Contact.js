import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Typography, CircularProgress } from "@mui/material";
import TenantHeader from "../header/tenant_header";

const theme = createTheme({
  palette: {
    primary: { main: "#C8102E", contrastText: "#fff" },
    background: { default: "#F5F3EF" },
    text: { primary: "#1A1A1A", secondary: "#6B6B6B" },
  },
  typography: {
    fontFamily: "'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  shape: { borderRadius: 4 },
});

/* ─── Global Styles Injected Once ────────────────────────────────── */
const GlobalStyles = () => {
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

      .contact-page * { box-sizing: border-box; }

      .card-lift {
        transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
      }
      .card-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.12) !important;
      }

      .quick-btn {
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
      }
      .quick-btn::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(200,16,46,0.06);
        opacity: 0;
        transition: opacity 0.2s;
      }
      .quick-btn:hover::after { opacity: 1; }
      .quick-btn:hover { border-color: #C8102E !important; color: #C8102E !important; }

      .submit-btn {
        transition: all 0.25s ease;
        position: relative;
        overflow: hidden;
      }
      .submit-btn::before {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        transition: left 0.5s ease;
      }
      .submit-btn:not(:disabled):hover::before { left: 100%; }
      .submit-btn:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(200,16,46,0.35) !important;
      }
      .submit-btn:not(:disabled):active { transform: translateY(0); }

      .hours-row { transition: background 0.15s; border-radius: 6px; }
      .hours-row:hover { background: rgba(200,16,46,0.04); }

      .file-drop-zone { transition: all 0.2s ease; }
      .file-drop-zone:hover {
        border-color: #C8102E !important;
        background: rgba(200,16,46,0.025) !important;
      }

      .pulse-dot {
        animation: pulseDot 2.5s ease-in-out infinite;
      }
      @keyframes pulseDot {
        0%, 100% { box-shadow: 0 0 0 0 rgba(0,168,114,0.4); opacity: 1; }
        50% { box-shadow: 0 0 0 6px rgba(0,168,114,0); opacity: 0.7; }
      }

      .toast-enter {
        animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
      }
      @keyframes toastIn {
        from { opacity: 0; transform: translateY(-8px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      .stagger-in > * {
        opacity: 0;
        animation: fadeUp 0.5s ease forwards;
      }
      .stagger-in > *:nth-child(1) { animation-delay: 0.05s; }
      .stagger-in > *:nth-child(2) { animation-delay: 0.12s; }
      .stagger-in > *:nth-child(3) { animation-delay: 0.19s; }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

/* ─── Divider Rule ────────────────────────────────────────────────── */
const Rule = ({ sx }) => (
  <Box sx={{ height: "1px", background: "linear-gradient(to right, transparent, #D8D3CA, transparent)", ...sx }} />
);

/* ─── Toast ───────────────────────────────────────────────────────── */
const Toast = ({ type, children }) => {
  const cfg = {
    success: { bg: "#F0FAF7", border: "#C0E8DC", color: "#007A5E", icon: "✓", label: "Success" },
    error:   { bg: "#FEF4F5", border: "#F5C6CC", color: "#C8102E", icon: "!", label: "Error" },
  }[type] || {};
  return (
    <Box className="toast-enter" sx={{
      display: "flex", alignItems: "flex-start", gap: 2, p: "14px 18px", mb: 3,
      borderRadius: "8px", background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      <Box sx={{
        width: 22, height: 22, borderRadius: "50%", background: cfg.color,
        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, flexShrink: 0, mt: "1px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {cfg.icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: cfg.color, letterSpacing: "0.8px", textTransform: "uppercase", mb: 0.25, fontFamily: "'DM Sans', sans-serif" }}>
          {cfg.label}
        </Typography>
        <Typography sx={{ color: cfg.color, fontSize: 13.5, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
          {children}
        </Typography>
      </Box>
    </Box>
  );
};

/* ─── Section Header ──────────────────────────────────────────────── */
const SectionHeader = ({ eyebrow, title }) => (
  <Box sx={{ px: 3.5, pt: 3.5, pb: 2.5 }}>
    <Typography sx={{
      fontSize: 10, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase",
      color: "#C8102E", mb: 0.75, fontFamily: "'DM Sans', sans-serif",
    }}>
      {eyebrow}
    </Typography>
    <Typography sx={{
      fontSize: 18, fontWeight: 400, color: "#1A1A1A", lineHeight: 1.3,
      fontFamily: "'DM Serif Display', Georgia, serif",
    }}>
      {title}
    </Typography>
  </Box>
);

/* ─── Field Label ─────────────────────────────────────────────────── */
const FieldLabel = ({ children, required }) => (
  <Typography component="label" sx={{
    display: "block", fontSize: 10, fontWeight: 600, color: "#888",
    textTransform: "uppercase", letterSpacing: "1.4px", mb: 1,
    fontFamily: "'DM Sans', sans-serif",
  }}>
    {children}{required && <Box component="span" sx={{ color: "#C8102E", ml: 0.5 }}>*</Box>}
  </Typography>
);

/* ─── Styled Input ────────────────────────────────────────────────── */
const StyledInput = (props) => (
  <Box
    component="input"
    {...props}
    sx={{
      width: "100%", px: "14px", py: "11px", fontSize: 14,
      color: "#1A1A1A", background: "#FAFAF8",
      border: "1.5px solid #E4E0D8", borderRadius: "8px",
      fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
      outline: "none", letterSpacing: "0.1px",
      transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
      "&:focus": {
        borderColor: "#C8102E",
        background: "#fff",
        boxShadow: "0 0 0 3px rgba(200,16,46,0.08)",
      },
      "&::placeholder": { color: "#BBB5AD" },
    }}
  />
);

/* ─── Contact Row ─────────────────────────────────────────────────── */
const ContactRow = ({ icon, label, children }) => (
  <Box sx={{
    display: "flex", gap: 2.5, alignItems: "flex-start",
    py: 2.5, borderBottom: "1px solid #F0EDE8",
    "&:last-child": { borderBottom: "none", pb: 0 },
  }}>
    <Box sx={{
      width: 38, height: 38, borderRadius: "10px",
      background: "linear-gradient(135deg, #FEF4F5, #FDE8EC)",
      border: "1px solid #F5C6CC",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{
        fontSize: 9.5, fontWeight: 700, color: "#B8B0A6",
        textTransform: "uppercase", letterSpacing: "1.5px",
        mb: 0.5, fontFamily: "'DM Sans', sans-serif",
      }}>
        {label}
      </Typography>
      {children}
    </Box>
  </Box>
);

/* ─── Hours Row ───────────────────────────────────────────────────── */
const HoursRow = ({ day, hours, closed, today }) => (
  <Box className="hours-row" sx={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    py: "9px", px: 1, mx: -1,
  }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      {today && (
        <Box sx={{
          fontSize: 8.5, fontWeight: 700, color: "#C8102E", background: "#FEF4F5",
          border: "1px solid #F5C6CC", borderRadius: "4px",
          px: "5px", py: "1.5px", letterSpacing: "0.8px", textTransform: "uppercase",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Today
        </Box>
      )}
      <Typography sx={{
        fontSize: 13.5, color: today ? "#1A1A1A" : "#6B6B6B",
        fontWeight: today ? 600 : 400, fontFamily: "'DM Sans', sans-serif",
      }}>
        {day}
      </Typography>
    </Box>
    <Typography sx={{
      fontSize: 13.5, fontWeight: 600,
      color: closed ? "#C8102E" : today ? "#1A1A1A" : "#444",
      fontFamily: "'DM Sans', sans-serif",
      fontStyle: closed ? "italic" : "normal",
    }}>
      {hours}
    </Typography>
  </Box>
);

/* ─── Checklist Item ──────────────────────────────────────────────── */
const CheckItem = ({ children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, "&:last-child": { mb: 0 } }}>
    <Box sx={{
      width: 20, height: 20, borderRadius: "6px",
      background: "linear-gradient(135deg, #E8F8F3, #D4F0E8)",
      border: "1.5px solid #A8DCCC",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, color: "#007A5E", fontWeight: 800, flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      ✓
    </Box>
    <Typography sx={{ fontSize: 13, color: "#555", fontWeight: 400, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
      {children}
    </Typography>
  </Box>
);

/* ─── Card Shell ──────────────────────────────────────────────────── */
const Card = ({ children, className = "", nolift, sx = {} }) => (
  <Box
    className={nolift ? "" : "card-lift"}
    sx={{
      background: "#FFFFFF",
      borderRadius: "16px",
      border: "1px solid #EAE6DE",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Box>
);

/* ─── Main Component ──────────────────────────────────────────────── */
export default function Contact() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({ name: user?.name || "", email: user?.email || "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const todayIdx = new Date().getDay();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/tenant/apply-landlord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Application failed");

      setSuccess(
        "Application submitted! Our team will review it and contact you within 2–3 business days."
      );
      setFormData({ name: user?.name || "", email: user?.email || "" });
    } catch (err) {
      setError(err.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  /* ── Not logged in ── */
  if (!token) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <TenantHeader />
        <Box className="contact-page" sx={{
          background: "linear-gradient(160deg, #F5F3EF 0%, #EDE9E2 100%)",
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Box sx={{
            background: "#fff", borderRadius: "20px", border: "1px solid #EAE6DE",
            boxShadow: "0 24px 80px rgba(0,0,0,0.1)", p: "52px 48px",
            textAlign: "center", maxWidth: 380,
          }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: "20px", mx: "auto", mb: 3,
              background: "linear-gradient(135deg, #FEF4F5, #FDE0E5)",
              border: "1px solid #F5C6CC",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
            }}>
              🔒
            </Box>
            <Typography sx={{ fontWeight: 400, fontSize: 26, color: "#1A1A1A", mb: 1.5, fontFamily: "'DM Serif Display', serif" }}>
              Access Required
            </Typography>
            <Typography sx={{ color: "#888", mb: 4, fontSize: 14, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
              Please sign in to your account to access this page.
            </Typography>
            <Box
              component="button"
              onClick={() => navigate("/login")}
              className="submit-btn"
              sx={{
                px: 6, py: "13px", background: "#C8102E", color: "#fff", border: "none",
                borderRadius: "10px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.3px",
                boxShadow: "0 6px 20px rgba(200,16,46,0.25)",
              }}
            >
              Sign In
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  const hours = [
    { day: "Monday",    hours: "9:00 AM – 6:00 PM", dayIdx: 1 },
    { day: "Tuesday",   hours: "9:00 AM – 6:00 PM", dayIdx: 2 },
    { day: "Wednesday", hours: "9:00 AM – 6:00 PM", dayIdx: 3 },
    { day: "Thursday",  hours: "9:00 AM – 6:00 PM", dayIdx: 4 },
    { day: "Friday",    hours: "9:00 AM – 6:00 PM", dayIdx: 5 },
    { day: "Saturday",  hours: "10:00 AM – 4:00 PM", dayIdx: 6 },
    { day: "Sunday",    hours: "Closed", closed: true, dayIdx: 0 },
  ];

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Box className="contact-page" sx={{ background: "linear-gradient(175deg, #F5F3EF 0%, #EDEBE5 100%)", minHeight: "100vh" }}>
        <TenantHeader />

        <Box sx={{ maxWidth: 1300, mx: "auto", px: { xs: 2.5, md: 5 }, py: { xs: 4, md: 7 } }}>

          {/* ── Page Header ──────────────────────────────────────── */}
          <Box sx={{ mb: 6, pt: 1 }}>
            <Typography sx={{
              fontSize: 10, fontWeight: 600, letterSpacing: "2.5px", textTransform: "uppercase",
              color: "#C8102E", mb: 1.5, fontFamily: "'DM Sans', sans-serif",
            }}>
              EasRent Support
            </Typography>
            <Typography sx={{
              fontWeight: 400, fontSize: { xs: 36, md: 48 }, color: "#1A1A1A",
              letterSpacing: "-1px", mb: 1.5, lineHeight: 1.1,
              fontFamily: "'DM Serif Display', Georgia, serif",
            }}>
              How can we help?
            </Typography>
            <Typography sx={{ color: "#888", fontSize: 15, fontWeight: 300, fontFamily: "'DM Sans', sans-serif", maxWidth: 480 }}>
              Reach out to our team or apply to list your properties on EasRent.
            </Typography>
          </Box>

          {/* ── Grid ─────────────────────────────────────────────── */}
          <Box className="stagger-in" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1.35fr" }, gap: 3, alignItems: "start" }}>

            {/* ── COL 1: Contact Details ── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

              <Card>
                <SectionHeader eyebrow="Get in Touch" title="Admin Contact" />
                <Rule />
                <Box sx={{ px: 3.5, pt: 1, pb: 2.5 }}>
                  <ContactRow icon="✉️" label="Email">
                    <Box component="a" href="mailto:admin@easrent.com" sx={{
                      color: "#C8102E", fontSize: 13.5, fontWeight: 600,
                      textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
                      "&:hover": { textDecoration: "underline" },
                    }}>
                      admin@easrent.com
                    </Box>
                  </ContactRow>
                  <ContactRow icon="📞" label="Phone">
                    <Box component="a" href="tel:+15550123" sx={{
                      color: "#C8102E", fontSize: 13.5, fontWeight: 600,
                      textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
                      "&:hover": { textDecoration: "underline" },
                    }}>
                      +1 (555) 012–3456
                    </Box>
                  </ContactRow>
                  <ContactRow icon="📍" label="Address">
                    <Typography sx={{ fontSize: 13.5, color: "#444", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
                      123 Main Street, Suite 100<br />
                      Downtown City, ST 12345<br />
                      United States
                    </Typography>
                  </ContactRow>
                  <ContactRow icon="💬" label="Live Support">
                    <Typography sx={{ fontSize: 13.5, color: "#444", fontFamily: "'DM Sans', sans-serif" }}>
                      Available Mon–Fri during business hours
                    </Typography>
                  </ContactRow>
                </Box>
              </Card>

              {/* Quick Help */}
              <Card>
                <Box sx={{ px: 3.5, pt: 3.5, pb: 3.5 }}>
                  <Typography sx={{
                    fontSize: 10, fontWeight: 600, letterSpacing: "1.8px", textTransform: "uppercase",
                    color: "#C8102E", mb: 1, fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Resources
                  </Typography>
                  <Typography sx={{
                    fontSize: 17, fontWeight: 400, color: "#1A1A1A", mb: 3,
                    fontFamily: "'DM Serif Display', serif",
                  }}>
                    Quick Help
                  </Typography>
                  {[
                    { icon: "📋", label: "View FAQ", sub: "Common questions answered" },
                    { icon: "🔧", label: "Report an Issue", sub: "Something not working?" },
                    { icon: "🏘️", label: "Browse Listings", sub: "Find your next home" },
                  ].map(({ icon, label, sub }) => (
                    <Box
                      key={label}
                      component="button"
                      className="quick-btn"
                      sx={{
                        display: "flex", alignItems: "center", gap: 2, width: "100%",
                        p: "12px 14px", mb: 1.5, borderRadius: "10px",
                        border: "1.5px solid #EAE6DE", background: "#FAFAF8",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                        fontWeight: 500, color: "#333", cursor: "pointer", textAlign: "left",
                        "&:last-child": { mb: 0 },
                      }}
                    >
                      <Box sx={{
                        width: 34, height: 34, borderRadius: "8px",
                        background: "#F5F3EF", border: "1px solid #EAE6DE",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                      }}>
                        {icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "#1A1A1A", fontFamily: "inherit", lineHeight: 1.2 }}>
                          {label}
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: "#999", fontFamily: "inherit", mt: 0.25 }}>
                          {sub}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: "#CCC", fontSize: 16, fontWeight: 300 }}>›</Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Box>

            {/* ── COL 2: Hours ── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Card>
                <SectionHeader eyebrow="Office Schedule" title="Business Hours" />
                <Rule />
                <Box sx={{ px: 3.5, py: 2 }}>
                  {hours.map(({ day, hours: h, closed, dayIdx }) => (
                    <HoursRow key={day} day={day} hours={h} closed={closed} today={todayIdx === dayIdx} />
                  ))}
                </Box>
              </Card>

              {/* Status Banner */}
              <Box sx={{
                background: "linear-gradient(135deg, #E8F8F3, #D8F3EC)",
                border: "1px solid #A8DCCC", borderRadius: "16px",
                p: 3.5,
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <Box className="pulse-dot" sx={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: "#00A872", flexShrink: 0,
                  }} />
                  <Typography sx={{
                    fontWeight: 700, fontSize: 12, color: "#007A5E",
                    letterSpacing: "1px", textTransform: "uppercase",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Support Online
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 13.5, color: "#007A5E", lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
                  Our team typically responds within{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>2 hours</Box>
                  {" "}during business hours.
                </Typography>
              </Box>

              {/* Dark info card */}
              <Box sx={{
                background: "linear-gradient(135deg, #1A1A1A, #2D2D2D)",
                borderRadius: "16px", p: 3.5, position: "relative", overflow: "hidden",
              }}>
                <Box sx={{
                  position: "absolute", top: -20, right: -20,
                  width: 100, height: 100, borderRadius: "50%",
                  background: "rgba(200,16,46,0.15)", pointerEvents: "none",
                }} />
                <Box sx={{
                  position: "absolute", bottom: -30, left: -20,
                  width: 80, height: 80, borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)", pointerEvents: "none",
                }} />
                <Typography sx={{
                  fontSize: 9.5, fontWeight: 700, color: "#C8102E", letterSpacing: "2px",
                  textTransform: "uppercase", mb: 1.5, fontFamily: "'DM Sans', sans-serif",
                }}>
                  Response Guarantee
                </Typography>
                <Typography sx={{
                  fontSize: 16, color: "#FFFFFF", lineHeight: 1.6,
                  fontFamily: "'DM Serif Display', serif", fontWeight: 400,
                }}>
                  All applications are reviewed within{" "}
                  <Box component="span" sx={{ color: "#C8102E" }}>2–3 business days.</Box>
                </Typography>
              </Box>
            </Box>

            {/* ── COL 3: Application Form ── */}
            <Card nolift sx={{ position: "sticky", top: 24 }}>
              {/* Top accent + header */}
              <Box sx={{
                px: 4.5, pt: 4, pb: 3.5,
                background: "linear-gradient(to bottom, #FAFAF8, #fff)",
                borderBottom: "1px solid #EAE6DE",
                position: "relative",
              }}>
                <Box sx={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: "linear-gradient(to right, #C8102E, #E8304A, #C8102E)",
                }} />
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, pt: 0.5 }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: "12px",
                    background: "linear-gradient(135deg, #C8102E, #E8304A)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                    boxShadow: "0 8px 24px rgba(200,16,46,0.3)",
                  }}>
                    🏠
                  </Box>
                  <Box>
                    <Typography sx={{
                      fontWeight: 400, fontSize: 22, color: "#1A1A1A",
                      fontFamily: "'DM Serif Display', serif", lineHeight: 1.2, mb: 0.4,
                    }}>
                      Apply as Landlord
                    </Typography>
                    <Typography sx={{ color: "#999", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
                      List your properties on EasRent
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ px: 4.5, py: 4 }}>
                <Typography sx={{
                  fontSize: 14, color: "#888", mb: 3.5, lineHeight: 1.75,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                }}>
                  Submit the form below and our team will review your application within{" "}
                  <Box component="span" sx={{ fontWeight: 600, color: "#1A1A1A" }}>2–3 business days</Box>.
                </Typography>

                {error && <Toast type="error">{error}</Toast>}
                {success && <Toast type="success">{success}</Toast>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 3 }}>

                  <Box>
                    <FieldLabel required>Full Name</FieldLabel>
                    <StyledInput
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full legal name"
                    />
                  </Box>

                  <Box>
                    <FieldLabel required>Registered Email</FieldLabel>
                    <StyledInput
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                    />
                  </Box>

                  {/* Checklist */}
                  <Box
                    sx={{
                      p: "16px 18px",
                      borderRadius: "10px",
                      background: "#FAFAF8",
                      border: "1.5px solid #EAE6DE",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        color: "#B8B0A6",
                        textTransform: "uppercase",
                        letterSpacing: "1.4px",
                        mb: 2,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Before submitting, confirm:
                    </Typography>
                    <CheckItem>Name matches your registered account</CheckItem>
                    <CheckItem>Email matches your registered account</CheckItem>
                    <CheckItem>Contact details are correct</CheckItem>
                  </Box>

                  {/* Submit Button */}
                  <Box
                    component="button"
                    type="submit"
                    disabled={loading}
                    className="submit-btn"
                    sx={{
                      width: "100%", py: "15px", borderRadius: "10px", border: "none",
                      background: loading ? "#E0DDD8" : "linear-gradient(135deg, #C8102E, #E03050)",
                      color: loading ? "#AAA" : "#fff",
                      fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                      cursor: loading ? "not-allowed" : "pointer",
                      letterSpacing: "0.5px",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5,
                      boxShadow: loading ? "none" : "0 8px 28px rgba(200,16,46,0.28)",
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={15} sx={{ color: "#AAA" }} />
                        Submitting Application…
                      </>
                    ) : (
                      "Submit Application →"
                    )}
                  </Box>

                  <Typography sx={{
                    textAlign: "center", fontSize: 11.5, color: "#BBB",
                    fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6,
                  }}>
                    By submitting, you agree to our{" "}
                    <Box component="span" sx={{ color: "#C8102E", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
                      Terms of Service
                    </Box>
                    {" "}and{" "}
                    <Box component="span" sx={{ color: "#C8102E", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
                      Privacy Policy
                    </Box>.
                  </Typography>
                </Box>
              </Box>
            </Card>

          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}