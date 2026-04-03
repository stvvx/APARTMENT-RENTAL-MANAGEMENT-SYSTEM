import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import cloudinaryConfig from "../cloudinaryConfig";
import TenantHeader from "../header/tenant_header";

/* ─── Premium Theme ─────────────────────────────────────────────────── */
const theme = createTheme({
  palette: {
    primary: { main: "#FF385C", contrastText: "#fff" },
    background: { default: "#F7F7F7", paper: "#FFFFFF" },
    success: { main: "#00A699" },
    text: { primary: "#222222", secondary: "#717171" },
  },
  typography: {
    fontFamily: "'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  shape: { borderRadius: 12 },
});

/* ─── Design Tokens ─────────────────────────────────────────────────── */
const T = {
  coral: "#FF385C",
  coralDark: "#E31C5F",
  coralDeep: "#C13584",
  coralMuted: "#FF385C14",
  teal: "#00A699",
  tealBg: "#F0FAFA",
  tealBorder: "#B2E0DD",
  charcoal: "#222222",
  warm: "#484848",
  ivory: "#FAFAF8",
  border: "#EBEBEB",
  borderHover: "#DDDDDD",
  textPrimary: "#222222",
  textSecondary: "#717171",
  textMuted: "#B0B0B0",
  success: "#00A699",
  successBg: "#F0FAFA",
  successBorder: "#B2E0DD",
  error: "#FF385C",
  errorBg: "#FFF1F3",
  errorBorder: "#FFD6DB",
};

/* ─── Reusable Primitives ───────────────────────────────────────────── */

/** Elevated card with left accent rule */
const PanelCard = ({ children, accentColor = T.coral, sx = {} }) => (
  <Box
    sx={{
      background: "#fff",
      borderRadius: "6px",
      border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${accentColor}`,
      boxShadow:
        "0 1px 3px rgba(34,34,34,0.06), 0 4px 16px rgba(34,34,34,0.04)",
      mb: 3,
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Box>
);

/** Section header inside a card */
const CardHeader = ({ icon, title, subtitle }) => (
  <Box
    sx={{
      px: { xs: 3, md: 4 },
      pt: { xs: 3, md: 4 },
      pb: 2.5,
      borderBottom: `1px solid ${T.border}`,
      mb: 0,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: "6px",
          background: `linear-gradient(135deg, ${T.coral}22, ${T.coral}0A)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
          flexShrink: 0,
          boxShadow: "none",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: T.textPrimary,
            letterSpacing: "0.2px",
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{ color: T.textMuted, fontSize: 12, mt: 0.25, fontFamily: "sans-serif" }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  </Box>
);

/** Uppercase label */
const FieldLabel = ({ children }) => (
  <Typography
    component="label"
    sx={{
      display: "block",
      fontSize: 10,
      fontWeight: 700,
      color: T.textSecondary,
      textTransform: "uppercase",
      letterSpacing: "1px",
      mb: 0.75,
      fontFamily: "sans-serif",
    }}
  >
    {children}
  </Typography>
);

/** Input */
const StyledInput = ({ readOnly, ...props }) => (
  <Box
    component="input"
    {...props}
    sx={{
      width: "100%",
      px: "14px",
      py: "10px",
      fontSize: 13.5,
      fontFamily: "sans-serif",
      color: readOnly ? T.textMuted : T.textPrimary,
      background: readOnly ? "#F9FAFB" : "#fff",
      border: `1px solid ${readOnly ? T.border : "#D1D5DB"}`,
      borderRadius: "5px",
      boxSizing: "border-box",
      cursor: readOnly ? "not-allowed" : "text",
      outline: "none",
      letterSpacing: "0.2px",
      transition: "border-color 0.15s, box-shadow 0.15s",
      "&:focus": !readOnly
        ? {
            borderColor: T.coral,
            boxShadow: `0 0 0 3px ${T.coralMuted}`,
          }
        : {},
    }}
    readOnly={readOnly}
  />
);

/** Feedback toast */
const Toast = ({ type, children }) => {
  const cfg =
    type === "success"
      ? { bg: T.successBg, border: T.successBorder, color: T.success, icon: "✓" }
      : { bg: T.errorBg, border: T.errorBorder, color: T.error, icon: "!" };
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 3,
        py: 2,
        mb: 3,
        borderRadius: "5px",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: cfg.color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
          fontFamily: "sans-serif",
        }}
      >
        {cfg.icon}
      </Box>
      <Typography
        sx={{ color: T.textPrimary, fontWeight: 500, fontSize: 13.5, fontFamily: "sans-serif" }}
      >
        {children}
      </Typography>
    </Box>
  );
};

/** Lease detail row */
const LeaseField = ({ label, value, wide }) => (
  <Box
    sx={{
      gridColumn: wide ? "1 / -1" : undefined,
      pb: 0,
    }}
  >
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 700,
        color: T.textMuted,
        textTransform: "uppercase",
        letterSpacing: "1px",
        mb: 0.75,
        fontFamily: "sans-serif",
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: 600,
        color: T.textPrimary,
        fontFamily: "sans-serif",
        letterSpacing: "0.1px",
      }}
    >
      {value || "—"}
    </Typography>
  </Box>
);

/* ─── Main Component ────────────────────────────────────────────────── */
export default function ProfileTab() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", email: "", profilePicture: "" });
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const [profileRes, leaseRes] = await Promise.all([
          fetch("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/tenant/lease", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const profileData = await profileRes.json();
        const leaseData = await leaseRes.json();
        setProfile({
          name: profileData.name || "",
          email: profileData.email || "",
          profilePicture: profileData.profilePicture || "",
        });
        setLease(leaseData);
      } catch {
        setError("Failed to load profile or lease information.");
      }
      setLoading(false);
    })();
  }, [token, isLoggedIn, navigate]);

  const handleChange = (e) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/tenant/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profile.name, profilePicture: profile.profilePicture }),
      });
      if (!res.ok) throw new Error();
      const updatedUser = await res.json();
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...localUser, ...updatedUser }));
      setSuccess("Your profile has been updated successfully.");
    } catch {
      setError("Failed to update profile. Please try again.");
    }
    setSaving(false);
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    const cloudName =
      cloudinaryConfig.CLOUDINARY_CLOUD_NAME ||
      process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const presetName =
      cloudinaryConfig.CLOUDINARY_PRESET_NAME ||
      process.env.REACT_APP_CLOUDINARY_PRESET_NAME;
    if (!cloudName || !presetName) {
      setError("Upload is not configured. Please contact support.");
      return;
    }
    setUploadingPhoto(true);
    setSuccess("");
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", presetName);
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: data }
      );
      if (!uploadRes.ok) throw new Error();
      const uploadData = await uploadRes.json();
      const uploadedUrl = uploadData.secure_url || "";
      if (!uploadedUrl) throw new Error();
      const updatedProfile = { ...profile, profilePicture: uploadedUrl };
      setProfile(updatedProfile);
      const saveRes = await fetch("http://localhost:5000/api/tenant/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: updatedProfile.name, profilePicture: uploadedUrl }),
      });
      if (!saveRes.ok) throw new Error();
      const savedUser = await saveRes.json();
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...localUser, ...savedUser }));
      setSuccess("Profile photo updated successfully.");
    } catch {
      setError("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: 2,
          }}
        >
          <CircularProgress size={28} sx={{ color: T.coral }} />
          <Typography sx={{ color: T.textMuted, fontSize: 13, fontFamily: "sans-serif" }}>
            Loading your profile…
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  /* ── Not logged in ── */
  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <TenantHeader />
        <Box sx={{ p: 4, maxWidth: 700, mx: "auto" }}>
          <Typography sx={{ color: T.textMuted, fontFamily: "sans-serif" }}>
            Redirecting to login…
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <ThemeProvider theme={theme}>
      <TenantHeader />

      {/* Page shell */}
      <Box
        sx={{
          minHeight: "100vh",
          background: "#F7F7F7",
          pt: { xs: 3, md: 5 },
          pb: 8,
        }}
      >
        <Box sx={{ maxWidth: 820, mx: "auto", px: { xs: 2, md: 4 } }}>

          {/* ── Page title bar ── */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              mb: 4,
              pb: 3,
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: { xs: 26, md: 32 },
                  fontWeight: 700,
                  color: T.charcoal,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.15,
                  mb: 0.5,
                }}
              >
                Account Profile
              </Typography>
              <Typography
                sx={{
                  color: T.textMuted,
                  fontSize: 13,
                  fontFamily: "sans-serif",
                  letterSpacing: "0.2px",
                }}
              >
                Manage your personal details and review your lease agreement
              </Typography>
            </Box>

            {/* Gold decorative rule */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <Box sx={{ width: 32, height: 2, background: T.coral, borderRadius: 1 }} />
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: T.coral }} />
            </Box>
          </Box>

          {/* ── Feedback toasts ── */}
          {error && <Toast type="error">{error}</Toast>}
          {success && <Toast type="success">{success}</Toast>}

          {/* ══════════════════════════════════════
              CARD 1 — Profile Information
          ══════════════════════════════════════ */}
          <PanelCard>
            <CardHeader
              icon="👤"
              title="Profile Information"
              subtitle="Your name and display photo"
            />

            {/* Body */}
            <Box sx={{ px: { xs: 3, md: 4 }, pt: 3.5, pb: 4 }}>

              {/* Two-column layout: avatar | fields */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "148px 1fr" },
                  gap: { xs: 4, sm: 5 },
                  alignItems: "start",
                }}
              >
                {/* ── Avatar column ── */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  {/* Avatar with navy ring */}
                  <Box
                    sx={{
                      position: "relative",
                      p: "3px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${T.coral}, ${T.coralDark})`,
                      boxShadow: "0 4px 20px rgba(255,56,92,0.3)",
                    }}
                  >
                    <Avatar
                      src={profile.profilePicture || ""}
                      alt={profile.name || "User"}
                      sx={{
                        width: 108,
                        height: 108,
                        fontSize: 36,
                        fontWeight: 700,
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        background: `linear-gradient(135deg, ${T.coral}, ${T.coralDark})`,
                        color: "#fff",
                        border: "3px solid #fff",
                      }}
                    >
                      {!profile.profilePicture && initials}
                    </Avatar>

                    {uploadingPhoto && (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 3,
                          borderRadius: "50%",
                          background: "rgba(34,34,34,0.6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CircularProgress size={22} sx={{ color: T.coral }} />
                      </Box>
                    )}
                  </Box>

                  {/* Upload button */}
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={uploadingPhoto}
                    sx={{
                      borderColor: T.charcoal,
                      color: T.charcoal,
                      borderRadius: "5px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: 12,
                      px: 2.5,
                      py: 0.75,
                      letterSpacing: "0.3px",
                      fontFamily: "sans-serif",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        borderColor: T.coral,
                        color: T.coral,
                        background: T.coralMuted,
                      },
                      "&:disabled": { opacity: 0.5 },
                      transition: "all 0.15s",
                    }}
                  >
                    {uploadingPhoto ? "Uploading…" : "Change Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleProfilePictureUpload}
                    />
                  </Button>

                  <Typography
                    sx={{
                      color: T.textMuted,
                      fontSize: 11,
                      textAlign: "center",
                      fontFamily: "sans-serif",
                      lineHeight: 1.5,
                    }}
                  >
                    JPG, PNG or GIF
                    <br />
                    Max 5 MB
                  </Typography>
                </Box>

                {/* ── Fields column ── */}
                <Box sx={{ display: "grid", gap: 3 }}>
                  <Box>
                    <FieldLabel>Full Name</FieldLabel>
                    <StyledInput
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </Box>

                  <Box>
                    <FieldLabel>Email Address</FieldLabel>
                    <StyledInput
                      type="email"
                      name="email"
                      value={profile.email}
                      readOnly
                      placeholder="your@email.com"
                    />
                    <Typography
                      sx={{
                        color: T.textMuted,
                        fontSize: 11.5,
                        mt: 0.75,
                        fontFamily: "sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      🔒 Email address cannot be changed. Contact support for assistance.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Divider + Save row */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 4,
                  pt: 3,
                  borderTop: `1px solid ${T.border}`,
                }}
              >
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    background: saving
                      ? "#F7F7F7"
                      : T.coral,
                    color: saving ? T.textMuted : "#fff",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 13.5,
                    fontFamily: "sans-serif",
                    letterSpacing: "0.3px",
                    px: 4,
                    py: 1.2,
                    boxShadow: saving
                      ? "none"
                      : "0 2px 10px rgba(255,56,92,0.3)",
                    "&:hover": {
                      background: saving
                        ? "#F7F7F7"
                        : T.coralDark,
                      boxShadow: saving ? "none" : "0 4px 14px rgba(255,56,92,0.35)",
                      transform: saving ? "none" : "translateY(-1px)",
                    },
                    "&:disabled": { opacity: 0.7 },
                    transition: "all 0.15s ease",
                  }}
                >
                  {saving ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <CircularProgress size={14} sx={{ color: T.textMuted }} />
                      Saving…
                    </Box>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </Box>
            </Box>
          </PanelCard>

          {/* ══════════════════════════════════════
              CARD 2 — Lease Information
          ══════════════════════════════════════ */}
          <PanelCard accentColor={T.teal}>
            <CardHeader
              icon="📋"
              title="Lease Agreement"
              subtitle="Details of your current rental contract"
            />

            <Box sx={{ px: { xs: 3, md: 4 }, pt: 3.5, pb: 4 }}>
              {lease && lease.apartment ? (
                <>
                  {/* Status pill */}
                  <Box sx={{ mb: 3.5 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        py: 0.6,
                        borderRadius: "4px",
                        background: T.successBg,
                        border: `1px solid ${T.successBorder}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: T.success,
                          "@keyframes blink": {
                            "0%,100%": { opacity: 1 },
                            "50%": { opacity: 0.35 },
                          },
                          animation: "blink 2s ease infinite",
                        }}
                      />
                      <Typography
                        sx={{
                          color: T.success,
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          fontFamily: "sans-serif",
                        }}
                      >
                        Active Lease
                      </Typography>
                    </Box>
                  </Box>

                  {/* Lease fields grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: { xs: 3, sm: 4 },
                      mb: lease.terms ? 4 : 0,
                    }}
                  >
                    <LeaseField
                      label="Unit"
                      value={lease.apartment.title || lease.apartment.unitType}
                    />
                    <LeaseField label="Building" value={lease.apartment.buildingName} />
                    <LeaseField
                      label="Lease Start"
                      value={
                        lease.leaseStart
                          ? new Date(lease.leaseStart).toLocaleDateString("en-PH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : null
                      }
                    />
                    <LeaseField
                      label="Lease End"
                      value={
                        lease.leaseEnd
                          ? new Date(lease.leaseEnd).toLocaleDateString("en-PH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : null
                      }
                    />
                  </Box>

                  {/* Terms block */}
                  {lease.terms && (
                    <>
                      <Box sx={{ height: 1, background: T.border, mb: 3 }} />
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: T.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            mb: 1.5,
                            fontFamily: "sans-serif",
                          }}
                        >
                          Terms &amp; Conditions
                        </Typography>
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: "5px",
                            background: "#F9FAFB",
                            border: `1px solid ${T.border}`,
                            borderLeft: `3px solid ${T.coral}`,
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#374151",
                              fontSize: 13.5,
                              lineHeight: 1.75,
                              fontFamily: "sans-serif",
                            }}
                          >
                            {lease.terms}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                </>
              ) : (
                /* Empty state */
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    py: 7,
                    px: 3,
                  }}
                >
                  {/* Icon block */}
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "12px",
                      background: `linear-gradient(135deg, ${T.coral}, ${T.coralDark})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 30,
                      mb: 3,
                      boxShadow: "0 8px 24px rgba(255,56,92,0.25)",
                    }}
                  >
                    🏠
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      fontWeight: 700,
                      fontSize: 17,
                      color: T.textPrimary,
                      mb: 1,
                    }}
                  >
                    No Active Lease Found
                  </Typography>
                  <Typography
                    sx={{
                      color: T.textMuted,
                      fontSize: 13,
                      maxWidth: 360,
                      lineHeight: 1.65,
                      fontFamily: "sans-serif",
                    }}
                  >
                    Your lease agreement details will appear here once your
                    apartment application has been reviewed and approved.
                  </Typography>
                </Box>
              )}
            </Box>
          </PanelCard>

        </Box>
      </Box>
    </ThemeProvider>
  );
}