import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  MenuItem, Button, Select, InputLabel, FormControl, OutlinedInput,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import TenantHeader from "../header/tenant_header";

/* ─── Theme ─────────────────────────────────────────────────────── */
const theme = createTheme({
  palette: {
    primary: { main: "#FF385C", contrastText: "#fff" },
    background: { default: "#F7F7F7", paper: "#FFFFFF" },
    success: { main: "#00A699" },
    text: { primary: "#222222", secondary: "#717171" },
  },
  typography: {
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  shape: { borderRadius: 8 },
});

/* ─── Design Tokens ─────────────────────────────────────────────── */
const T = {
  coral: "#FF385C",
  coralDark: "#E31C5F",
  coralMuted: "#FF385C12",
  teal: "#00A699",
  tealBg: "#F0FAFA",
  tealBorder: "#B2E0DD",
  orange: "#FC642D",
  charcoal: "#222222",
  warm: "#484848",
  silver: "#717171",
  muted: "#B0B0B0",
  border: "#EBEBEB",
  surface: "#F7F7F7",
  white: "#FFFFFF",
  successBg: "#F0FAFA",
  successBorder: "#B2E0DD",
  errorBg: "#FFF1F3",
  errorBorder: "#FFD6DB",
};

/* ─── Helpers ────────────────────────────────────────────────────── */
const buildFallbackDueDate = () => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
};

const mergePaymentsWithApprovedApps = (payments, approvedApps) => {
  const currentPayments = Array.isArray(payments)
    ? payments.filter((p) => p.status !== "paid")
    : [];
  const approved = Array.isArray(approvedApps) ? approvedApps : [];
  const paymentApartmentIds = new Set(
    currentPayments.map((p) => p.apartment?._id || p.apartment).filter(Boolean).map(String)
  );
  const fallbackPayments = approved
    .filter((app) => {
      const id = app.apartment?._id;
      return id && !paymentApartmentIds.has(String(id));
    })
    .map((app) => ({
      _id: `fallback-${app._id}`,
      apartment: app.apartment,
      amount: app.apartment?.price || 0,
      dueDate: buildFallbackDueDate(),
      status: "unpaid",
      isFallback: true,
    }));
  return [...currentPayments, ...fallbackPayments];
};

const getDerivedOutstanding = (payments) => {
  if (!Array.isArray(payments)) return 0;
  return payments
    .filter((p) => p.status !== "paid")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
};

const detectCardType = (cardNumber) => {
  const digits = String(cardNumber || "").replace(/\D/g, "");
  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(digits)) return "visa";
  if (/^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7[01]\d{12}|720\d{12}))$/.test(digits))
    return "mastercard";
  return "";
};

const fmt = (n) => Number(n || 0).toLocaleString("en-PH");
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—";

const formatLocation = (loc) => {
  if (!loc) return "—";
  const parts = [loc.street, loc.barangay, loc.city].map((p) => String(p || "").trim()).filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
};

/* ─── Primitives ─────────────────────────────────────────────────── */

/** Card with optional left accent border */
const PanelCard = ({ children, accent = T.coral, sx = {} }) => (
  <Box
    sx={{
      background: T.white,
      borderRadius: "8px",
      border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${accent}`,
      boxShadow: "0 1px 3px rgba(34,34,34,0.05), 0 4px 16px rgba(34,34,34,0.04)",
      mb: 3,
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Box>
);

/** Card header row with icon pill + title */
const CardHeader = ({ icon, title, subtitle }) => (
  <Box
    sx={{
      px: { xs: 3, md: 4 },
      pt: { xs: 3, md: 3.5 },
      pb: 2.5,
      borderBottom: `1px solid ${T.border}`,
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: "8px",
        background: T.coralMuted,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 17,
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: 16, color: T.charcoal, lineHeight: 1.3 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ color: T.muted, fontSize: 12, mt: 0.2 }}>{subtitle}</Typography>
      )}
    </Box>
  </Box>
);

/** Stat card */
const StatCard = ({ label, value, accent = T.coral, icon }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 150,
      background: T.white,
      borderRadius: "8px",
      border: `1px solid ${T.border}`,
      borderTop: `3px solid ${accent}`,
      boxShadow: "0 1px 3px rgba(34,34,34,0.05)",
      p: 3,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: T.silver, textTransform: "uppercase", letterSpacing: "0.9px" }}>
        {label}
      </Typography>
    </Box>
    <Typography sx={{ fontSize: 26, fontWeight: 700, color: T.charcoal, lineHeight: 1 }}>
      {value}
    </Typography>
  </Box>
);

/** Status badge pill */
const StatusBadge = ({ status }) => {
  const map = {
    unpaid:  { bg: "#FFF1F3", color: T.coral,    border: T.errorBorder,   label: "Unpaid"   },
    partial: { bg: "#FFF5EB", color: T.orange,   border: "#FDD9C4",       label: "Partial"  },
    pending: { bg: "#EBF5FF", color: "#0070F3",  border: "#BDD9FF",       label: "Pending"  },
    late:    { bg: "#FFE8E8", color: "#C13515",  border: "#FFBDBD",       label: "Late"     },
    paid:    { bg: T.tealBg, color: T.teal,      border: T.tealBorder,    label: "Paid"     },
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

/** Feedback toast */
const Toast = ({ type, children }) => {
  const cfg = type === "success"
    ? { bg: T.successBg, border: T.successBorder, color: T.teal, icon: "✓" }
    : { bg: T.errorBg,   border: T.errorBorder,   color: T.coral, icon: "!" };
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 2, mt: 2, borderRadius: "6px", background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Box sx={{ width: 20, height: 20, borderRadius: "50%", background: cfg.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
        {cfg.icon}
      </Box>
      <Typography sx={{ color: T.charcoal, fontWeight: 500, fontSize: 13.5 }}>{children}</Typography>
    </Box>
  );
};

/** Card type indicator */
const CardTypeIndicator = ({ cardType }) => {
  if (!cardType) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 1.5, borderRadius: "6px", border: `1px solid ${T.border}`, background: T.surface }}>
      {cardType === "visa" ? (
        <Box sx={{ px: 1.5, py: 0.4, borderRadius: "4px", bgcolor: "#1A1F71", color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>
          VISA
        </Box>
      ) : (
        <Box sx={{ position: "relative", width: 36, height: 22, flexShrink: 0 }}>
          <Box sx={{ position: "absolute", left: 0, width: 22, height: 22, borderRadius: "50%", bgcolor: "#EB001B" }} />
          <Box sx={{ position: "absolute", left: 14, width: 22, height: 22, borderRadius: "50%", bgcolor: "#F79E1B", opacity: 0.9 }} />
        </Box>
      )}
      <Typography sx={{ color: T.silver, fontSize: 13 }}>
        {cardType === "visa" ? "Visa" : "Mastercard"} detected
      </Typography>
    </Box>
  );
};

/** Section heading */
const SectionHeading = ({ children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 4, mb: 2 }}>
    <Typography sx={{ fontWeight: 700, fontSize: 15, color: T.charcoal, textTransform: "uppercase", letterSpacing: "0.6px" }}>
      {children}
    </Typography>
    <Box sx={{ flex: 1, height: 1, background: T.border }} />
  </Box>
);

/** Styled table */
const DataTable = ({ columns, rows, emptyIcon, emptyText }) => (
  rows.length === 0 ? (
    <Box sx={{ background: T.white, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.border}`, borderRadius: "8px", py: 6, textAlign: "center" }}>
      <Typography sx={{ fontSize: 36, mb: 1.5 }}>{emptyIcon}</Typography>
      <Typography sx={{ color: T.silver, fontSize: 14 }}>{emptyText}</Typography>
    </Box>
  ) : (
    <Box sx={{ background: T.white, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.teal}`, borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(34,34,34,0.05)" }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: T.surface }}>
              {columns.map((col) => (
                <TableCell key={col}
                  sx={{ fontSize: 10, fontWeight: 700, color: T.silver, textTransform: "uppercase", letterSpacing: "0.9px", borderBottom: `1px solid ${T.border}`, py: 1.75, px: 2.5 }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx} sx={{ "&:hover": { background: "#FFF8F8" }, "&:last-child td": { borderBottom: 0 } }}>
                {row.map((cell, ci) => (
                  <TableCell key={ci} sx={{ borderBottom: `1px solid ${T.border}`, py: 1.75, px: 2.5, fontSize: 13.5 }}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
);

/** Styled select field */
const StyledSelect = ({ label, value, onChange, children }) => (
  <FormControl fullWidth size="small">
    <InputLabel sx={{ fontSize: 13, color: T.silver, "&.Mui-focused": { color: T.coral } }}>
      {label}
    </InputLabel>
    <Select
      value={value}
      onChange={onChange}
      input={
        <OutlinedInput
          label={label}
          sx={{
            fontSize: 13.5,
            borderRadius: "6px",
            background: T.white,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: T.charcoal },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: T.coral, borderWidth: 2 },
          }}
        />
      }
    >
      {children}
    </Select>
  </FormControl>
);

/** Styled text input */
const StyledInput = ({ label, value, onChange, placeholder, type = "text", letterSpacing }) => (
  <Box>
    <Typography sx={{ fontSize: 10, fontWeight: 700, color: T.silver, textTransform: "uppercase", letterSpacing: "1px", mb: 0.75 }}>
      {label}
    </Typography>
    <Box
      component="input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      sx={{
        width: "100%",
        px: "14px",
        py: "10px",
        fontSize: 13.5,
        fontFamily: "inherit",
        color: T.charcoal,
        background: T.white,
        border: `1px solid #D1D5DB`,
        borderRadius: "6px",
        boxSizing: "border-box",
        outline: "none",
        letterSpacing: letterSpacing || "normal",
        transition: "border-color 0.15s, box-shadow 0.15s",
        "&:focus": { borderColor: T.coral, boxShadow: `0 0 0 3px ${T.coralMuted}` },
        "&::placeholder": { color: T.muted },
      }}
    />
  </Box>
);

/* ─── Main Component ─────────────────────────────────────────────── */
export default function PaymentsTab({ payForApartment }) {
  const location = useLocation();
  const reservation = location.state?.reservation;

  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [allPayments, setAllPayments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [csv, setCsv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Reservation receipt upload
  const [reservationReceipt, setReservationReceipt] = useState(null);
  // Rent receipt upload
  const [rentReceipt, setRentReceipt] = useState(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [approvedApps, setApprovedApps] = useState([]);
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const derivedOutstanding = getDerivedOutstanding(allPayments);
  const outstandingToShow = Math.max(balance?.outstanding || 0, derivedOutstanding);
  const cardType = detectCardType(cardNumber);

  // Reservation fee must be paid first (before showing balances/rent payments)
  const reservationPayments = Array.isArray(allPayments)
    ? allPayments.filter((p) => String(p?.paymentType || "").toLowerCase() === "reservation")
    : [];
  const hasPaidReservation = reservationPayments.some(
    (p) => String(p?.status || "").toLowerCase() === "paid"
  );

  // Backwards compatible:
  // - If tenant has reservation payment records, use those.
  // - Only fall back to Application.isPaid gate when there are NO reservation payment records.
  const unpaidReservationApps = reservationPayments.length > 0
    ? []
    : approvedApps.filter((a) => !a.isPaid);

  const reservationBlocking = isLoggedIn && !loading && (
    reservationPayments.length > 0 ? !hasPaidReservation : unpaidReservationApps.length > 0
  );

  // Only allow paying rent after reservation fee is approved/paid
  const payablePayments = (reservationBlocking
    ? []
    : allPayments.filter((p) => p && p._id && ["unpaid", "partial", "late"].includes(p.status))
  );

  const selectedPayment = payablePayments.find(
    (p) => String(p._id) === String(selectedPaymentId)
  );

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [appsRes, payRes, balRes, recRes, notifRes] = await Promise.all([
        fetch("http://localhost:5000/api/applications/mine", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/payments/tenant", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/payments/tenant/balance", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/payments/tenant/receipts", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/payments/tenant/notifications", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const appsData = await appsRes.json();
      const payData = await payRes.json();
      const balData = await balRes.json();
      const recData = await recRes.json();
      const notifData = await notifRes.json();

      const myApps = Array.isArray(appsData)
        ? appsData
        : Array.isArray(appsData?.applications)
          ? appsData.applications
          : [];
      const approved = myApps.filter((a) => a.status === "approved");
      setApprovedApps(approved);

      setAllPayments(Array.isArray(payData) ? payData : []);
      setBalance(balData?.outstanding ?? null);
      setReceipts(Array.isArray(recData) ? recData : []);
      setNotifications(Array.isArray(notifData) ? notifData : []);

      // update derived lists
      const merged = mergePaymentsWithApprovedApps(Array.isArray(payData) ? payData : [], approved);
      setPayments(merged);
    } catch {
      setBalance(null);
      setAllPayments([]);
      setReceipts([]);
      setNotifications([]);
      setApprovedApps([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      if (!payForApartment) navigate("/login");
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchAll()
      .catch(() => { setBalance(null); setAllPayments([]); setReceipts([]); setNotifications([]); })
      .finally(() => setLoading(false));
  }, [token, isLoggedIn, payForApartment, navigate]);

  // If we arrive here right after reservation-fee submission, refresh once to reflect latest status.
  useEffect(() => {
    if (!isLoggedIn) return;
    if (location.state?.refreshPayments) {
      fetchAll();
      // clear navigation state so it doesn't refetch repeatedly
      navigate("/payments", { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, isLoggedIn]);

  const handleSubmitPayment = async () => {
    setSubmitMessage("");
    setSubmitError("");

    if (!selectedPayment) {
      setSubmitError("Please select a payment to pay.");
      return;
    }

    if (!paymentMethod) {
      setSubmitError("Please select a payment method.");
      return;
    }

    // Receipt-only flow: we only save method and mark the payment pending.
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/tenant/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          paymentId: selectedPayment._id,
          apartmentId: selectedPayment.apartment?._id || selectedPayment.apartment,
          method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.message || "Failed to submit payment.");
        return;
      }

      setSubmitMessage(data?.message || "Payment method saved. Upload your receipt next.");
      await fetchAll();

      // Clear method-only inputs
      setSelectedPaymentId("");
      setPaymentMethod("");
      setCardNumber("");
      setCsv("");
      setExpiryDate("");
    } catch {
      setSubmitError("Failed to submit payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitReservationPayment = async () => {
    setSubmitError("");
    setSubmitMessage("");

    if (!reservation?.paymentId) {
      setSubmitError("Missing reservation payment details.");
      return;
    }

    if (!paymentMethod) {
      setSubmitError("Please select a payment method.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/tenant/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          paymentId: reservation.paymentId,
          apartmentId: reservation.apartmentId,
          method: paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.message || "Failed to save payment method.");
        return;
      }
      setSubmitMessage(data?.message || "Payment method saved.");
      await fetchAll();
    } catch {
      setSubmitError("Failed to save payment method.");
    } finally {
      setSubmitting(false);
    }
  };

  const uploadReservationReceipt = async () => {
    setSubmitError("");
    setSubmitMessage("");

    if (!reservation?.paymentId) {
      setSubmitError("Missing reservation payment details.");
      return;
    }
    if (!reservationReceipt) {
      setSubmitError("Please choose a receipt file to upload.");
      return;
    }

    if (!paymentMethod) {
      setSubmitError("Please select a payment method before uploading your receipt.");
      return;
    }

    // Ensure method is saved on payment first (receipt-only flow)
    try {
      await submitReservationPayment();
    } catch {
      // submitReservationPayment already sets errors
      return;
    }

    setReceiptUploading(true);
    try {
      const fd = new FormData();
      fd.append("receipt", reservationReceipt);

      const res = await fetch(`http://localhost:5000/api/payments/tenant/reservation/${reservation.paymentId}/receipt`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.message || "Failed to upload receipt.");
        return;
      }

      setSubmitMessage(data?.message || "Receipt uploaded. Waiting for admin verification.");
      setReservationReceipt(null);
      await fetchAll();
    } catch {
      setSubmitError("Failed to upload receipt.");
    } finally {
      setReceiptUploading(false);
    }
  };

  // Reservation fee must be paid first (before showing balances/rent payments)
  // NOTE: unpaidReservationApps is already computed above.
  if (!reservation && isLoggedIn && !loading && unpaidReservationApps.length > 0) {
    return (
      <ThemeProvider theme={theme}>
        <TenantHeader />
        <Box sx={{ minHeight: "100vh", background: T.surface, pt: { xs: 3, md: 5 }, pb: 8 }}>
          <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${T.border}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: 26, md: 32 }, color: T.charcoal, mb: 0.5 }}>
                Reservation Fee Required
              </Typography>
              <Typography sx={{ color: T.muted, fontSize: 13 }}>
                Pay the reservation fee first. After it is confirmed, your apartment payments will appear here.
              </Typography>
            </Box>

            {submitError && <Toast type="error">{submitError}</Toast>}
            {submitMessage && <Toast type="success">{submitMessage}</Toast>}

            {unpaidReservationApps.map((app) => (
              <PanelCard key={app._id}>
                <CardHeader
                  icon="🔒"
                  title={app.apartment?.title || "Apartment"}
                  subtitle={formatLocation(app.apartment?.location)}
                />
                <Box sx={{ px: { xs: 3, md: 4 }, py: 3, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    sx={{
                      background: T.charcoal,
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2,
                      "&:hover": { background: "#111" },
                    }}
                    onClick={async () => {
                      setSubmitError("");
                      try {
                        const res = await fetch("http://localhost:5000/api/payments/tenant/reservation", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ apartmentId: app.apartment?._id || app.apartment }),
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setSubmitError(data?.message || "Failed to start reservation fee payment.");
                          return;
                        }

                        navigate(`/reservation-fee/${data?.payment?._id}`, {
                          state: {
                            reservation: {
                              apartmentId: app.apartment?._id || app.apartment,
                              paymentId: data?.payment?._id,
                              amount: data?.payment?.amount,
                              apartmentTitle: app.apartment?.title,
                              apartmentLocation: app.apartment?.location,
                            },
                          },
                        });
                      } catch {
                        setSubmitError("Failed to start reservation fee payment.");
                      }
                    }}
                  >
                    Pay reservation fee
                  </Button>
                </Box>
              </PanelCard>
            ))}
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  /* ── payForApartment mini-view ── */
  if (payForApartment) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: "auto" }}>
          <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${T.border}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: 24, color: T.charcoal, mb: 0.5 }}>
              {payForApartment.title || payForApartment.unitType}
            </Typography>
            <Typography sx={{ color: T.silver, fontSize: 13 }}>Contract & Payment Details</Typography>
          </Box>

          <PanelCard accent={T.charcoal}>
            <CardHeader icon="📋" title="Contract Rules" subtitle="Review terms before submitting payment" />
            <Box sx={{ px: { xs: 3, md: 4 }, py: 3 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 3 }}>
                {[
                  { label: "Minimum Lease Term", value: payForApartment.minLeaseTerm || "—" },
                  { label: "Security Deposit",   value: `₱${fmt(payForApartment.deposit)}` },
                  { label: "Advance Payment",    value: `₱${fmt(payForApartment.advance)}` },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ p: 2.5, borderRadius: "6px", background: T.surface, border: `1px solid ${T.border}` }}>
                    <Typography sx={{ color: T.silver, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.9px", mb: 0.75 }}>{label}</Typography>
                    <Typography sx={{ fontWeight: 700, color: T.charcoal, fontSize: 15 }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ p: 2.5, borderRadius: "6px", background: T.errorBg, border: `1px solid ${T.errorBorder}`, borderLeft: `3px solid ${T.coral}` }}>
                <Typography sx={{ color: T.warm, fontSize: 13, lineHeight: 1.65 }}>
                  ⚠️ Additional rules may apply as per your landlord agreement. Please review all terms before submitting payment.
                </Typography>
              </Box>
            </Box>
          </PanelCard>

          <PanelCard>
            <CardHeader icon="💳" title="Payment Form" subtitle="Choose how you want to pay" />
            <Box component="form" onSubmit={handleSubmitPayment} sx={{ px: { xs: 3, md: 4 }, py: 3.5, display: "grid", gap: 2.5 }}>

              {/* Mode of payment */}
              <StyledSelect
                label="Mode of Payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="gcash" sx={{ fontSize: 13.5 }}>📱&nbsp; GCash</MenuItem>
                <MenuItem value="paymaya" sx={{ fontSize: 13.5 }}>📱&nbsp; PayMaya</MenuItem>
                <MenuItem value="card" sx={{ fontSize: 13.5 }}>Card (Visa/Mastercard)</MenuItem>
                <MenuItem value="bank transfer" sx={{ fontSize: 13.5 }}>Bank Transfer</MenuItem>
                <MenuItem value="cash" sx={{ fontSize: 13.5 }}>Cash (with landlord approval)</MenuItem>
              </StyledSelect>

              <Box sx={{ pt: 1, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" disabled={submitting} sx={{ background: T.coral, color: "#fff", "&:hover": { background: T.coralDark }, textTransform: "none", fontWeight: 700, px: 4, py: 1.2, borderRadius: "6px" }}>
                  {submitting ? "Processing…" : "Submit Payment"}
                </Button>
              </Box>

              {submitMessage && <Toast type="success">{submitMessage}</Toast>}
              {submitError && <Toast type="error">{submitError}</Toast>}
            </Box>
          </PanelCard>
        </Box>
      </ThemeProvider>
    );
  }

  /* ── Not logged in ── */
  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <TenantHeader />
        <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
          <Typography sx={{ color: T.silver }}>Redirecting to login…</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  /* ── Main view ── */
  return (
    <ThemeProvider theme={theme}>
      <TenantHeader />
      <Box sx={{ minHeight: "100vh", background: T.surface, pt: { xs: 3, md: 5 }, pb: 8 }}>
        <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, md: 4 } }}>

          {/* ── Page title bar ── */}
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: 4, pb: 3, borderBottom: `1px solid ${T.border}` }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: 26, md: 32 }, color: T.charcoal, letterSpacing: "-0.5px", lineHeight: 1.15, mb: 0.5 }}>
                Payments & Billing
              </Typography>
              <Typography sx={{ color: T.muted, fontSize: 13, letterSpacing: "0.2px" }}>
                Manage your rent, track balances, and view your payment history
              </Typography>
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, flexShrink: 0 }}>
              <Box sx={{ width: 32, height: 2, background: T.coral, borderRadius: 1 }} />
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: T.coral }} />
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: 2 }}>
              <CircularProgress size={28} sx={{ color: T.coral }} />
              <Typography sx={{ color: T.muted, fontSize: 13 }}>Loading your payments…</Typography>
            </Box>
          ) : (
            <>
              {/* ── Stat cards ── */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
                <StatCard
                  label="Outstanding Balance"
                  value={`₱${fmt(outstandingToShow)}`}
                  accent={outstandingToShow > 0 ? T.coral : T.teal}
                />
                <StatCard label="Active Payments"  value={payablePayments.length} accent={T.orange} />
                <StatCard label="Paid Receipts"    value={receipts.length}         accent={T.teal}  />
              </Box>

              {/* ══════════════════════════════════════
                  Pay Balance Card
              ══════════════════════════════════════ */}
              <PanelCard>
                <CardHeader icon="💳" title="Pay Balance" subtitle="Choose a balance and complete your payment" />

                <Box component="form" onSubmit={handleSubmitPayment} sx={{ px: { xs: 3, md: 4 }, py: 3.5, display: "grid", gap: 2.5 }}>

                  {/* Select payment */}
                  <StyledSelect
                    label="Select Balance To Pay"
                    value={selectedPaymentId}
                    onChange={(e) => setSelectedPaymentId(e.target.value)}
                  >
                    {payablePayments.length === 0 ? (
                      <MenuItem value="" disabled sx={{ fontSize: 13.5, color: T.muted }}>
                        No payable balances available
                      </MenuItem>
                    ) : (
                      payablePayments.map((p) => (
                        <MenuItem key={p._id} value={p._id} sx={{ fontSize: 13.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", gap: 2 }}>
                            <span>{p.apartment?.title || p.apartment?.unitType || "Apartment"}</span>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                              <Typography sx={{ fontWeight: 700, color: T.coral, fontSize: 13 }}>
                                ₱{fmt(p.amount)}
                              </Typography>
                              <StatusBadge status={p.status} />
                            </Box>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </StyledSelect>

                  {/* Mode of payment */}
                  <StyledSelect
                    label="Mode of Payment"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <MenuItem value="gcash" sx={{ fontSize: 13.5 }}>📱&nbsp; GCash</MenuItem>
                    <MenuItem value="paymaya" sx={{ fontSize: 13.5 }}>📱&nbsp; PayMaya</MenuItem>
                    <MenuItem value="cash"          sx={{ fontSize: 13.5 }}>🏦&nbsp; Cash (with landlord approval)</MenuItem>
                    <MenuItem value="bank transfer"  sx={{ fontSize: 13.5 }}>💳&nbsp; Bank Transfer</MenuItem>
                  </StyledSelect>

                  {/* Submit */}
                  <Box sx={{ pt: 1, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      type="submit"
                      disabled={submitting || payablePayments.length === 0}
                      sx={{
                        background: (submitting || payablePayments.length === 0) ? "#F7F7F7" : T.coral,
                        color: (submitting || payablePayments.length === 0) ? T.muted : "#fff",
                        borderRadius: "6px",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 13.5,
                        px: 4,
                        py: 1.2,
                        boxShadow: (submitting || payablePayments.length === 0) ? "none" : "0 2px 10px rgba(255,56,92,0.3)",
                        "&:hover": {
                          background: (submitting || payablePayments.length === 0) ? "#F7F7F7" : T.coralDark,
                          boxShadow: (submitting || payablePayments.length === 0) ? "none" : "0 4px 14px rgba(255,56,92,0.35)",
                          transform: (submitting || payablePayments.length === 0) ? "none" : "translateY(-1px)",
                        },
                        "&:disabled": { opacity: 0.7 },
                        transition: "all 0.15s ease",
                      }}
                    >
                      {submitting ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                          <CircularProgress size={14} sx={{ color: T.muted }} />
                          Processing…
                        </Box>
                      ) : "Submit Payment"}
                    </Button>
                  </Box>

                  {submitMessage && <Toast type="success">{submitMessage}</Toast>}
                  {submitError   && <Toast type="error">{submitError}</Toast>}
                </Box>
              </PanelCard>

              {/* ── Selected Payment: upload receipt (rent) ── */}
              {selectedPayment && (
                <PanelCard>
                  <CardHeader icon="🧾" title="Upload Receipt" subtitle="Upload proof of payment for the selected balance" />
                  <Box sx={{ px: { xs: 3, md: 4 }, py: 3, display: 'grid', gap: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{selectedPayment.apartment?.title || 'Apartment'}</Typography>
                        <Typography sx={{ color: T.silver, fontSize: 13 }}>{formatLocation(selectedPayment.apartment?.location)}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 800, color: T.coral, fontSize: 18 }}>₱{fmt(selectedPayment.amount)}</Typography>
                        <Box sx={{ mt: 1 }}><StatusBadge status={selectedPayment.status} /></Box>
                      </Box>
                    </Box>

                    {/* existing receipt preview */}
                    {selectedPayment.receiptUrl && (
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <img src={selectedPayment.receiptUrl.startsWith('http') ? selectedPayment.receiptUrl : `http://localhost:5000${selectedPayment.receiptUrl}`} alt="receipt" style={{ maxWidth: 160, maxHeight: 120, objectFit: 'cover', borderRadius: 6, border: `1px solid ${T.border}` }} />
                        <Box>
                          <Typography sx={{ fontSize: 13, color: T.silver }}>Uploaded receipt</Typography>
                          <Typography sx={{ fontSize: 13 }}>{selectedPayment.receiptOriginalName || '—'}</Typography>
                        </Box>
                      </Box>
                    )}

                    <Box>
                      <input
                        id="rent-receipt-input"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setRentReceipt(e.target.files?.[0] || null)}
                        style={{ display: 'block' }}
                      />
                      <Typography sx={{ color: T.muted, fontSize: 12, mt: 1 }}>Supported: images or PDF. After uploading, the landlord will verify and mark the payment approved or rejected.</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        disabled={!rentReceipt || receiptUploading}
                        onClick={async () => { setRentReceipt(null); setSubmitMessage(''); setSubmitError(''); }}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ background: T.coral, color: '#fff', '&:hover': { background: T.coralDark }, textTransform: 'none', fontWeight: 700 }}
                        disabled={!rentReceipt || receiptUploading}
                        onClick={async () => {
                          setSubmitMessage('');
                          setSubmitError('');

                          if (!selectedPayment || !selectedPayment._id) {
                            setSubmitError('No payment selected.');
                            return;
                          }
                          if (!paymentMethod) {
                            setSubmitError('Please select a payment method above before uploading receipt.');
                            return;
                          }

                          // ensure method saved for this payment first
                          try {
                            setSubmitting(true);
                            const res = await fetch('http://localhost:5000/api/payments/tenant/pay', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ paymentId: selectedPayment._id, apartmentId: selectedPayment.apartment?._id || selectedPayment.apartment, method: paymentMethod }),
                            });
                            const data = await res.json();
                            if (!res.ok) {
                              setSubmitError(data?.message || 'Failed to save payment method.');
                              setSubmitting(false);
                              return;
                            }
                          } catch (err) {
                            setSubmitError('Failed to save payment method.');
                            setSubmitting(false);
                            return;
                          } finally {
                            setSubmitting(false);
                          }

                          // upload receipt
                          setReceiptUploading(true);
                          try {
                            const fd = new FormData();
                            fd.append('receipt', rentReceipt);

                            const up = await fetch(`http://localhost:5000/api/payments/tenant/rent/${selectedPayment._id}/receipt`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` },
                              body: fd,
                            });
                            const upData = await up.json();
                            if (!up.ok) {
                              setSubmitError(upData?.message || 'Failed to upload receipt.');
                              return;
                            }

                            setSubmitMessage(upData?.message || 'Receipt uploaded. Waiting for landlord verification.');
                            setRentReceipt(null);

                            // refresh now and then poll until status changes from pending
                            await fetchAll();

                            const pollId = setInterval(async () => {
                              await fetchAll();
                              const updated = (Array.isArray(allPayments) ? allPayments : []).find((p) => String(p._id) === String(selectedPayment._id));
                              if (updated && String(updated.status).toLowerCase() !== 'pending') {
                                clearInterval(pollId);
                              }
                            }, 5000);

                          } catch (err) {
                            setSubmitError('Failed to upload receipt.');
                          } finally {
                            setReceiptUploading(false);
                          }
                        }}
                      >
                        {receiptUploading ? 'Uploading…' : 'Upload Receipt'}
                      </Button>
                    </Box>

                    {submitMessage && <Toast type="success">{submitMessage}</Toast>}
                    {submitError && <Toast type="error">{submitError}</Toast>}
                  </Box>
                </PanelCard>
              )}

              {/* ── Current Payments ── */}
              <SectionHeading>Current Payments</SectionHeading>
              <DataTable
                columns={["Apartment", "Due Date", "Amount", "Status"]}
                emptyIcon="🏠"
                emptyText="No current payments found."
                rows={allPayments.map((p) => [
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: T.charcoal }}>
                    {p.apartment?.title || p.apartment?.unitType || "—"}
                  </Typography>,
                  <Typography sx={{ color: T.silver, fontSize: 13.5 }}>{fmtDate(p.dueDate)}</Typography>,
                  <Typography sx={{ fontWeight: 700, color: T.charcoal, fontSize: 13.5 }}>₱{fmt(p.amount)}</Typography>,
                  <StatusBadge status={p.status} />,
                ])}
              />

              {/* ── Upcoming & Overdue ── */}
              <SectionHeading>Upcoming &amp; Overdue — within 7 days</SectionHeading>
              <DataTable
                columns={["Apartment", "Due Date", "Amount", "Status"]}
                emptyIcon="✅"
                emptyText="No upcoming or overdue payments within 7 days."
                rows={notifications.map((p) => [
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: T.charcoal }}>
                    {p.apartment?.title || p.apartment?.unitType || "—"}
                  </Typography>,
                  <Typography sx={{ color: T.silver, fontSize: 13.5 }}>{fmtDate(p.dueDate)}</Typography>,
                  <Typography sx={{ fontWeight: 700, color: T.charcoal, fontSize: 13.5 }}>₱{fmt(p.amount)}</Typography>,
                  <StatusBadge status={p.status} />,
                ])}
              />

              {/* ── Payment History ── */}
              <SectionHeading>Payment History &amp; Receipts</SectionHeading>
              <DataTable
                columns={["Apartment", "Paid Date", "Amount", "Method", "Landlord"]}
                emptyIcon="🧾"
                emptyText="No payment history found."
                rows={receipts.map((p) => [
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: T.charcoal }}>
                    {p.apartment?.title || p.apartment?.unitType || "—"}
                  </Typography>,
                  <Typography sx={{ color: T.silver, fontSize: 13.5 }}>{fmtDate(p.paidDate)}</Typography>,
                  <Typography sx={{ fontWeight: 700, color: T.teal, fontSize: 13.5 }}>₱{fmt(p.amount)}</Typography>,
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.75, py: 0.4, borderRadius: "20px", background: T.surface, border: `1px solid ${T.border}`, fontSize: 12, fontWeight: 600, color: T.silver }}>
                    {p.method === "bank transfer" ? "💳" : "🏦"} {p.method || "—"}
                  </Box>,
                  <Typography sx={{ fontSize: 13.5, color: T.charcoal }}>{p.landlord?.name || "—"}</Typography>,
                ])}
              />

            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}