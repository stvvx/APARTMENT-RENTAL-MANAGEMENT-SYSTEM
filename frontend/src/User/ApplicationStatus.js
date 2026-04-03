import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import TenantHeader from "../header/tenant_header";

/* ─── Theme ─────────────────────────────────────────────────────── */
const theme = createTheme({
  palette: {
    primary: { main: "#FF385C", contrastText: "#fff" },
    background: { default: "#F7F7F7", paper: "#FFFFFF" },
    success: { main: "#00A699" },
    text: { primary: "#222222", secondary: "#717171" },
  },
  typography: { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  shape: { borderRadius: 8 },
});

/* ─── Design Tokens ─────────────────────────────────────────────── */
const T = {
  coral:         "#FF385C",
  coralDark:     "#E31C5F",
  coralMuted:    "#FF385C12",
  coralBg:       "#FFF1F3",
  coralBorder:   "#FFD6DB",
  teal:          "#00A699",
  tealBg:        "#F0FAFA",
  tealBorder:    "#B2E0DD",
  orange:        "#FC642D",
  orangeBg:      "#FFF5EB",
  charcoal:      "#222222",
  warm:          "#484848",
  silver:        "#717171",
  muted:         "#B0B0B0",
  border:        "#EBEBEB",
  borderHover:   "#DDDDDD",
  surface:       "#F7F7F7",
  white:         "#FFFFFF",
};

/* ─── Primitives ─────────────────────────────────────────────────── */

/** Card with left accent border */
const PanelCard = ({ children, accent = T.coral, hover = true, sx = {} }) => (
  <Box
    sx={{
      background: T.white,
      borderRadius: "8px",
      border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${accent}`,
      boxShadow: "0 1px 3px rgba(34,34,34,0.05), 0 4px 16px rgba(34,34,34,0.04)",
      overflow: "hidden",
      transition: "box-shadow 0.2s, transform 0.2s",
      ...(hover && {
        "&:hover": {
          boxShadow: "0 4px 20px rgba(34,34,34,0.10)",
          transform: "translateY(-1px)",
        },
      }),
      ...sx,
    }}
  >
    {children}
  </Box>
);

/** Status badge pill */
const StatusPill = ({ status }) => {
  const map = {
    pending:   { bg: T.orangeBg,  color: T.orange,   border: "#FDD9C4",    label: "Pending"   },
    approved:  { bg: T.tealBg,    color: T.teal,     border: T.tealBorder, label: "Approved"  },
    rejected:  { bg: T.coralBg,   color: T.coral,    border: T.coralBorder,label: "Rejected"  },
    cancelled: { bg: T.surface,   color: T.silver,   border: T.border,     label: "Cancelled" },
    paid:      { bg: T.tealBg,    color: T.teal,     border: T.tealBorder, label: "Paid"      },
    unpaid:    { bg: T.coralBg,   color: T.coral,    border: T.coralBorder,label: "Unpaid"    },
    partial:   { bg: T.orangeBg,  color: T.orange,   border: "#FDD9C4",    label: "Partial"   },
    late:      { bg: "#FFE8E8",   color: "#C13515",  border: "#FFBDBD",    label: "Late"      },
  };
  const s = map[status] || { bg: T.surface, color: T.silver, border: T.border, label: status };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: "10px",
        py: "3px",
        borderRadius: "20px",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </Box>
  );
};

/** Tab button */
const TabButton = ({ active, onClick, children }) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      px: 3,
      py: 1.5,
      border: "none",
      borderBottom: active ? `2px solid ${T.coral}` : "2px solid transparent",
      background: "none",
      fontFamily: "inherit",
      fontSize: 13.5,
      fontWeight: active ? 700 : 500,
      color: active ? T.charcoal : T.silver,
      cursor: "pointer",
      transition: "all 0.15s",
      letterSpacing: "0.1px",
      "&:hover": { color: T.charcoal },
    }}
  >
    {children}
  </Box>
);

/** Action button */
const ActionButton = ({ onClick, disabled, children, variant = "outline", danger = false }) => (
  <Box
    component="button"
    onClick={onClick}
    disabled={disabled}
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      px: 2.25,
      py: "7px",
      borderRadius: "6px",
      fontSize: 12.5,
      fontWeight: 600,
      fontFamily: "inherit",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
      whiteSpace: "nowrap",
      border: danger ? `1px solid ${T.coralBorder}` : `1px solid ${T.borderHover}`,
      background: danger ? T.coralBg : T.white,
      color: danger ? T.coral : T.charcoal,
      opacity: disabled ? 0.5 : 1,
      letterSpacing: "0.2px",
      "&:hover": disabled ? {} : {
        borderColor: danger ? T.coral : T.charcoal,
        background: danger ? "#FFE0E5" : T.surface,
        transform: "translateY(-1px)",
      },
    }}
  >
    {children}
  </Box>
);

/** Stat card */
const StatCard = ({ label, value, accent }) => (
  <Box
    sx={{
      background: T.white,
      borderRadius: "8px",
      border: `1px solid ${T.border}`,
      borderTop: `3px solid ${accent}`,
      boxShadow: "0 1px 3px rgba(34,34,34,0.05)",
      px: 2.5,
      py: 2,
      minWidth: 130,
    }}
  >
    <Typography sx={{ fontSize: 10, fontWeight: 700, color: T.silver, textTransform: "uppercase", letterSpacing: "0.9px", mb: 0.5 }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700, fontSize: 26, color: T.charcoal, lineHeight: 1 }}>
      {value}
    </Typography>
  </Box>
);

/** Info tile used inside cards */
const InfoTile = ({ label, children }) => (
  <Box sx={{ p: 2, borderRadius: "6px", background: T.surface, border: `1px solid ${T.border}` }}>
    <Typography sx={{ fontSize: 10, fontWeight: 700, color: T.silver, textTransform: "uppercase", letterSpacing: "0.9px", mb: 0.75 }}>
      {label}
    </Typography>
    {children}
  </Box>
);

/** Empty state */
const EmptyState = ({ icon, title, subtitle }) => (
  <Box
    sx={{
      textAlign: "center",
      py: 8,
      px: 4,
      background: T.white,
      borderRadius: "8px",
      border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${T.border}`,
      boxShadow: "0 1px 3px rgba(34,34,34,0.04)",
    }}
  >
    <Typography sx={{ fontSize: 44, mb: 2 }}>{icon}</Typography>
    <Typography sx={{ fontWeight: 700, color: T.charcoal, mb: 0.75, fontSize: 16 }}>{title}</Typography>
    <Typography sx={{ color: T.silver, fontSize: 13.5, maxWidth: 320, mx: "auto", lineHeight: 1.6 }}>
      {subtitle}
    </Typography>
  </Box>
);

/* ─── Application Card ───────────────────────────────────────────── */
const ApplicationCard = ({ app, onViewApartment, onCancel, cancellingId }) => {
  const isCancellable = app.status === "pending" || app.status === "approved";
  const accent = { pending: T.orange, approved: T.teal, rejected: T.coral, cancelled: T.border }[app.status] || T.border;

  return (
    <PanelCard accent={accent}>
      <Box
        sx={{
          p: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
          gap: 2,
          alignItems: "start",
        }}
      >
        {/* ── Left: info ── */}
        <Box>
          {/* Apartment identity row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "8px",
                background: T.coralMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🏠
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: T.charcoal, lineHeight: 1.25 }}>
                {app.apartment?.title || app.apartment?.unitType || "Apartment"}
              </Typography>
              <Typography sx={{ color: T.muted, fontSize: 12, mt: 0.2 }}>
                Applied{" "}
                {app.createdAt
                  ? new Date(app.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
                  : "—"}
              </Typography>
            </Box>
          </Box>

          {/* Status + message */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: app.message ? 2 : 0 }}>
            <StatusPill status={app.status} />
          </Box>

          {app.message && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: "6px",
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderLeft: `2px solid ${T.muted}`,
              }}
            >
              <Typography sx={{ fontSize: 13, color: T.silver, fontStyle: "italic", lineHeight: 1.55 }}>
                "{app.message}"
              </Typography>
            </Box>
          )}
        </Box>

        {/* ── Right: actions ── */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: { xs: "flex-start", sm: "flex-end" },
          }}
        >
          <ActionButton onClick={() => onViewApartment(app.apartment?._id)}>
            View listing →
          </ActionButton>
          {isCancellable && (
            <ActionButton
              danger
              onClick={() => onCancel(app._id)}
              disabled={cancellingId === app._id}
            >
              {cancellingId === app._id ? "Cancelling…" : "Cancel"}
            </ActionButton>
          )}
        </Box>
      </Box>
    </PanelCard>
  );
};

/* ─── Rental Card ────────────────────────────────────────────────── */
const RentalCard = ({ app, payments, onViewDetails }) => {
  const apartmentId = app.apartment?._id;
  const apartmentPayments = payments[apartmentId] || [];
  const latest = apartmentPayments.length > 0
    ? apartmentPayments[apartmentPayments.length - 1]
    : null;

  return (
    <PanelCard accent={T.teal}>
      <Box sx={{ p: 3 }}>

        {/* ── Header ── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "8px",
                background: T.tealBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              🏡
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: T.charcoal, lineHeight: 1.25 }}>
                {app.apartment?.title || app.apartment?.unitType || "Apartment"}
              </Typography>
              {app.apartment?.landlord?.name && (
                <Typography sx={{ color: T.silver, fontSize: 12, mt: 0.2 }}>
                  Landlord: {app.apartment.landlord.name}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Active rental badge */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.6,
              borderRadius: "4px",
              background: T.tealBg,
              border: `1px solid ${T.tealBorder}`,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: T.teal,
                "@keyframes blink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
                animation: "blink 2s ease infinite",
              }}
            />
            <Typography sx={{ color: T.teal, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Active Rental
            </Typography>
          </Box>
        </Box>

        {/* ── Info grid ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
            gap: 1.5,
            mb: latest ? 2.5 : 3,
          }}
        >
          <InfoTile label="Monthly Rent">
            {app.apartment?.price ? (
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: T.teal }}>
                  ₱{app.apartment.price.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 11, color: T.silver }}>/mo</Typography>
              </Box>
            ) : (
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: T.charcoal }}>—</Typography>
            )}
          </InfoTile>

          <InfoTile label="Lease Start">
            <Typography sx={{ fontWeight: 600, fontSize: 14, color: T.charcoal }}>
              {app.apartment?.availableFrom
                ? new Date(app.apartment.availableFrom).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
                : "—"}
            </Typography>
          </InfoTile>

          <InfoTile label="Payment Status">
            {latest
              ? <StatusPill status={latest.status} />
              : <Typography sx={{ color: T.muted, fontSize: 13 }}>No payments yet</Typography>
            }
          </InfoTile>
        </Box>

        {/* ── Latest payment detail strip ── */}
        {latest && (
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              mb: 3,
              p: 2.5,
              borderRadius: "6px",
              background: T.surface,
              border: `1px solid ${T.border}`,
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: T.silver, textTransform: "uppercase", letterSpacing: "0.9px", mb: 0.5 }}>Due Date</Typography>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: T.charcoal }}>
                {new Date(latest.dueDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
              </Typography>
            </Box>
            <Box sx={{ width: 1, background: T.border, alignSelf: "stretch" }} />
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: T.silver, textTransform: "uppercase", letterSpacing: "0.9px", mb: 0.5 }}>Amount Due</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: T.charcoal }}>
                ₱{(latest.amount || 0).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── CTA ── */}
        <Box sx={{ pt: 2.5, borderTop: `1px solid ${T.border}` }}>
          <ActionButton onClick={() => onViewDetails(app.apartment?._id)}>
            View details →
          </ActionButton>
        </Box>
      </Box>
    </PanelCard>
  );
};

/* ─── Main Component ─────────────────────────────────────────────── */
export default function ApplicationStatus({ openApartmentModal, onCancel }) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [tab, setTab] = useState(0);
  const token = localStorage.getItem("token");

  try {
    if (token) {
      const decoded = jwtDecode(token);
    }
  } catch {}

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    async function fetchAll() {
      setLoading(true);
      try {
        const [appRes, approvedRes, payRes] = await Promise.all([
          fetch("http://localhost:5000/api/applications/mine",     { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/applications/approved", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/payments/tenant",       { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [appData, approvedData, payData] = await Promise.all([
          appRes.json(), approvedRes.json(), payRes.json(),
        ]);
        setApplications(Array.isArray(appData) ? appData : appData.applications || []);
        setApprovedApplications(Array.isArray(approvedData) ? approvedData : approvedData.applications || []);
        if (Array.isArray(payData)) {
          const byApartment = {};
          payData.forEach((p) => {
            const id = p.apartment?._id || p.apartment;
            if (!byApartment[id]) byApartment[id] = [];
            byApartment[id].push(p);
          });
          setPayments(byApartment);
        }
      } catch {
        setApplications([]); setApprovedApplications([]); setPayments({});
      }
      setLoading(false);
    }
    fetchAll();
  }, [token, navigate]);

  const handleCancel = async (appId) => {
    if (!window.confirm("Are you sure you want to cancel this application?")) return;
    setCancellingId(appId);
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) {
        let msg = "Failed to cancel application.";
        try { const e = await res.json(); if (e?.message) msg = e.message; } catch {}
        alert(msg); setCancellingId(null); return;
      }
      const res2 = await fetch("http://localhost:5000/api/applications/mine", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res2.json();
      setApplications(Array.isArray(data) ? data : data.applications || []);
      if (onCancel) onCancel();
    } catch { alert("Error cancelling application."); }
    setCancellingId(null);
  };

  const handleViewApprovedApartment = async (apartmentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/apartments/tenant/${apartmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (typeof openApartmentModal === "function") { openApartmentModal(data); return; }
      navigate(`/apartment/${apartmentId}`);
    } catch { alert("Could not load apartment details."); }
  };

  const handleOpenApartment = (apartmentId) => {
    if (typeof openApartmentModal === "function") { openApartmentModal(apartmentId); return; }
    navigate(`/apartment/${apartmentId}`);
  };

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <ThemeProvider theme={theme}>
      <TenantHeader />

      <Box sx={{ background: T.surface, minHeight: "100vh", pt: { xs: 3, md: 5 }, pb: 8 }}>
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
                  fontWeight: 700,
                  fontSize: { xs: 26, md: 32 },
                  color: T.charcoal,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.15,
                  mb: 0.5,
                }}
              >
                My Rental Applications
              </Typography>
              <Typography sx={{ color: T.muted, fontSize: 13, letterSpacing: "0.2px" }}>
                Track your applications and manage your active rentals
              </Typography>
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, flexShrink: 0 }}>
              <Box sx={{ width: 32, height: 2, background: T.coral, borderRadius: 1 }} />
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: T.coral }} />
            </Box>
          </Box>

          {/* ── Stat cards ── */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
            <StatCard label="Total Applications" value={applications.length}        accent={T.coral}  />
            <StatCard label="Pending"             value={pendingCount}               accent={T.orange} />
            <StatCard label="Active Rentals"      value={approvedApplications.length} accent={T.teal}  />
          </Box>

          {/* ── Tabs ── */}
          <Box
            sx={{
              display: "flex",
              borderBottom: `1px solid ${T.border}`,
              mb: 3,
              background: T.white,
              borderRadius: "8px 8px 0 0",
              px: 1,
            }}
          >
            <TabButton active={tab === 0} onClick={() => setTab(0)}>
              All Applications{applications.length > 0 ? ` (${applications.length})` : ""}
            </TabButton>
            <TabButton active={tab === 1} onClick={() => setTab(1)}>
              My Rentals{approvedApplications.length > 0 ? ` (${approvedApplications.length})` : ""}
            </TabButton>
          </Box>

          {/* ── Tab 0: All Applications ── */}
          {tab === 0 && (
            loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "30vh", gap: 2 }}>
                <CircularProgress size={28} sx={{ color: T.coral }} />
                <Typography sx={{ color: T.muted, fontSize: 13 }}>Loading applications…</Typography>
              </Box>
            ) : applications.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No applications yet"
                subtitle="Browse available listings and submit your first rental application."
              />
            ) : (
              <Box sx={{ display: "grid", gap: 2 }}>
                {applications.map((app, idx) => (
                  <ApplicationCard
                    key={app._id || idx}
                    app={app}
                    onViewApartment={
                      ["approved", "rejected"].includes(app.status)
                        ? handleViewApprovedApartment
                        : handleOpenApartment
                    }
                    onCancel={handleCancel}
                    cancellingId={cancellingId}
                  />
                ))}
              </Box>
            )
          )}

          {/* ── Tab 1: My Rentals ── */}
          {tab === 1 && (
            approvedApplications.length === 0 ? (
              <EmptyState
                icon="🏡"
                title="No active rentals"
                subtitle="Your approved rental agreements will appear here once your application is accepted."
              />
            ) : (
              <Box sx={{ display: "grid", gap: 2 }}>
                {approvedApplications.map((app, idx) => (
                  <RentalCard
                    key={app._id || idx}
                    app={app}
                    payments={payments}
                    onViewDetails={handleViewApprovedApartment}
                  />
                ))}
              </Box>
            )
          )}

        </Box>
      </Box>
    </ThemeProvider>
  );
}