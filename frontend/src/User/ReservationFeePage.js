import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TenantHeader from "../header/tenant_header";

/* ─── Design Tokens ──────────────────────────────────────────── */
const T = {
  coral:       "#FF385C",
  coralDark:   "#E31C5F",
  coralLight:  "#FFF0F3",
  coralMid:    "#FFD6DE",
  border:      "#EBEBEB",
  surface:     "#F7F7F7",
  silver:      "#717171",
  muted:       "#B0B0B0",
  charcoal:    "#222222",
  white:       "#FFFFFF",
  successBg:   "#F0FFF8",
  successText: "#1A7A52",
  successBorder:"#A3E6C8",
  errorBg:     "#FFF1F3",
  errorText:   "#C0293F",
  errorBorder: "#FFD6DB",
  pendingBg:   "#FFFBEB",
  pendingText: "#92400E",
  pendingBorder:"#FDE68A",
  shadow:      "0 2px 16px rgba(34,34,34,0.08)",
  shadowMd:    "0 4px 32px rgba(34,34,34,0.12)",
};

/* ─── Helpers ────────────────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString("en-PH");

const formatLocation = (loc) => {
  if (!loc) return "—";
  const parts = [loc.street, loc.barangay, loc.city]
    .map((p) => String(p || "").trim())
    .filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
};

const isImage = (file) => file?.type?.startsWith("image/");

/* ─── Constants ──────────────────────────────────────────────── */
const METHOD_OPTIONS = [
  { value: "gcash",         label: "GCash",                icon: "💚", desc: "Send via GCash number" },
  { value: "paymaya",       label: "Maya",                 icon: "💜", desc: "Send via Maya account" },
  { value: "bank transfer", label: "Card / Bank Transfer", icon: "🏦", desc: "Online banking or debit/credit" },
  { value: "cash",          label: "Cash on Delivery",     icon: "💵", desc: "Pay in person upon arrival" },
];

/* ─── Injected Styles ────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, .rfp-root {
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    background: #F7F7F7;
    color: #222;
  }

  .rfp-page {
    min-height: 100vh;
    background: #F7F7F7;
  }

  .rfp-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  /* ── Breadcrumb ── */
  .rfp-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #717171;
    margin-bottom: 28px;
    font-weight: 500;
  }
  .rfp-breadcrumb a {
    color: #717171;
    text-decoration: none;
    cursor: pointer;
  }
  .rfp-breadcrumb a:hover { text-decoration: underline; }
  .rfp-breadcrumb span { color: #b0b0b0; }

  /* ── Page Title ── */
  .rfp-heading {
    font-size: clamp(22px, 4vw, 30px);
    font-weight: 800;
    color: #222;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }
  .rfp-subheading {
    color: #717171;
    font-size: 15px;
    margin-top: 6px;
    font-weight: 500;
    line-height: 1.5;
  }

  /* ── Status Badge ── */
  .rfp-status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
    flex-wrap: wrap;
  }
  .rfp-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1.5px solid;
  }
  .rfp-badge-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .rfp-method-tag {
    font-size: 13px;
    color: #717171;
    font-weight: 600;
    padding: 5px 12px;
    background: #fff;
    border: 1px solid #ebebeb;
    border-radius: 999px;
  }

  /* ── Two-column layout ── */
  .rfp-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 28px;
    margin-top: 32px;
    align-items: start;
  }
  @media (max-width: 768px) {
    .rfp-layout { grid-template-columns: 1fr; }
  }

  /* ── Card ── */
  .rfp-card {
    background: #fff;
    border: 1px solid #ebebeb;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(34,34,34,0.07);
  }

  .rfp-card-header {
    padding: 22px 24px 18px;
    border-bottom: 1px solid #f0f0f0;
  }
  .rfp-card-header h3 {
    font-size: 17px;
    font-weight: 800;
    color: #222;
    letter-spacing: -0.2px;
  }
  .rfp-card-header p {
    font-size: 13.5px;
    color: #717171;
    margin-top: 3px;
    font-weight: 500;
  }
  .rfp-card-body {
    padding: 22px 24px;
  }

  /* ── Step indicator ── */
  .rfp-steps {
    display: flex;
    gap: 0;
    margin-bottom: 28px;
  }
  .rfp-step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .rfp-step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 16px;
    left: 50%;
    width: 100%;
    height: 2px;
    background: #ebebeb;
    z-index: 0;
  }
  .rfp-step.done:not(:last-child)::after { background: #FF385C; }
  .rfp-step-num {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    z-index: 1;
    background: #f7f7f7;
    border: 2px solid #ebebeb;
    color: #b0b0b0;
    transition: all .2s;
  }
  .rfp-step.active .rfp-step-num {
    background: #FF385C;
    border-color: #FF385C;
    color: #fff;
    box-shadow: 0 0 0 4px #FF385C22;
  }
  .rfp-step.done .rfp-step-num {
    background: #fff;
    border-color: #FF385C;
    color: #FF385C;
  }
  .rfp-step-label {
    font-size: 11px;
    font-weight: 700;
    color: #b0b0b0;
    margin-top: 7px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .rfp-step.active .rfp-step-label,
  .rfp-step.done .rfp-step-label { color: #222; }

  /* ── Method options ── */
  .rfp-method-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .rfp-method-btn {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 15px 16px;
    background: #fff;
    border: 1.5px solid #ebebeb;
    border-radius: 14px;
    cursor: pointer;
    text-align: left;
    transition: all .18s ease;
    font-family: inherit;
  }
  .rfp-method-btn:hover:not(:disabled) {
    border-color: #FF385C55;
    background: #FFF8F9;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(255,56,92,0.08);
  }
  .rfp-method-btn.selected {
    border-color: #FF385C;
    background: #FFF0F3;
    box-shadow: 0 0 0 3px #FF385C18;
  }
  .rfp-method-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .rfp-method-icon {
    font-size: 22px;
    line-height: 1;
    flex-shrink: 0;
    width: 40px; height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f7f7f7;
    border-radius: 10px;
  }
  .rfp-method-info { flex: 1; }
  .rfp-method-name {
    font-size: 14.5px;
    font-weight: 700;
    color: #222;
  }
  .rfp-method-desc {
    font-size: 12.5px;
    color: #717171;
    margin-top: 2px;
    font-weight: 500;
  }
  .rfp-method-check {
    width: 20px; height: 20px;
    border-radius: 50%;
    border: 2px solid #ebebeb;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all .15s;
  }
  .rfp-method-check.checked {
    background: #FF385C;
    border-color: #FF385C;
    color: #fff;
    font-size: 11px;
  }

  /* ── Upload zone ── */
  .rfp-upload-zone {
    border: 2px dashed #d8d8d8;
    border-radius: 16px;
    padding: 28px 20px;
    text-align: center;
    transition: all .2s;
    background: #fafafa;
    cursor: pointer;
    position: relative;
  }
  .rfp-upload-zone:hover { border-color: #FF385C88; background: #FFF8F9; }
  .rfp-upload-zone.has-file { border-color: #FF385C; background: #FFF4F6; }
  .rfp-upload-icon {
    width: 48px; height: 48px;
    background: #FF385C12;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    font-size: 22px;
  }
  .rfp-upload-title {
    font-size: 14px;
    font-weight: 700;
    color: #222;
  }
  .rfp-upload-sub {
    font-size: 12.5px;
    color: #717171;
    margin-top: 4px;
    font-weight: 500;
  }
  .rfp-upload-zone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }
  .rfp-receipt-preview {
    margin-top: 16px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #ebebeb;
  }
  .rfp-receipt-preview img {
    width: 100%;
    display: block;
    max-height: 240px;
    object-fit: cover;
  }
  .rfp-file-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 8px 14px;
    background: #fff;
    border: 1px solid #ebebeb;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    color: #222;
  }

  /* ── Action buttons ── */
  .rfp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 20px;
    border-radius: 12px;
    font-size: 14.5px;
    font-weight: 800;
    font-family: inherit;
    cursor: pointer;
    border: none;
    transition: all .18s ease;
    letter-spacing: -0.1px;
  }
  .rfp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .rfp-btn-primary {
    background: #FF385C;
    color: #fff;
    width: 100%;
  }
  .rfp-btn-primary:hover:not(:disabled) {
    background: #E31C5F;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255,56,92,0.3);
  }
  .rfp-btn-secondary {
    background: #fff;
    color: #222;
    border: 1.5px solid #ebebeb;
  }
  .rfp-btn-secondary:hover:not(:disabled) {
    background: #f7f7f7;
    border-color: #d0d0d0;
  }
  .rfp-btn-ghost {
    background: transparent;
    color: #717171;
    font-size: 13.5px;
    padding: 10px 14px;
  }
  .rfp-btn-ghost:hover { color: #222; text-decoration: underline; }
  .rfp-btn-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    margin-top: 20px;
  }

  /* ── Sidebar price card ── */
  .rfp-price-card {
    background: #fff;
    border: 1px solid #ebebeb;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 2px 20px rgba(34,34,34,0.09);
    position: sticky;
    top: 24px;
  }
  .rfp-price-label {
    font-size: 12px;
    font-weight: 700;
    color: #717171;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }
  .rfp-price-amount {
    font-size: 36px;
    font-weight: 800;
    color: #222;
    letter-spacing: -1px;
    line-height: 1.1;
    margin-top: 6px;
  }
  .rfp-price-currency {
    font-size: 20px;
    font-weight: 700;
    color: #717171;
    vertical-align: super;
    margin-right: 2px;
  }
  .rfp-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 18px 0;
  }
  .rfp-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 14px;
  }
  .rfp-detail-label { color: #717171; font-weight: 500; }
  .rfp-detail-value { color: #222; font-weight: 700; text-align: right; max-width: 55%; }
  .rfp-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15.5px;
    font-weight: 800;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1.5px solid #222;
  }

  /* ── Alert boxes ── */
  .rfp-alert {
    display: flex;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1.5px solid;
    margin-top: 16px;
    font-size: 13.5px;
    font-weight: 600;
    line-height: 1.5;
  }
  .rfp-alert-icon { flex-shrink: 0; font-size: 16px; }

  /* ── Spinner ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  .rfp-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin .6s linear infinite;
    display: inline-block;
  }
  .rfp-spinner.dark {
    border-color: rgba(34,34,34,0.15);
    border-top-color: #222;
  }

  /* ── Receipt link ── */
  .rfp-receipt-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 16px;
    background: #f7f7f7;
    border: 1px solid #ebebeb;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 700;
    color: #222;
    text-decoration: none;
    margin-top: 10px;
    transition: all .15s;
  }
  .rfp-receipt-link:hover {
    background: #FFF0F3;
    border-color: #FF385C55;
    color: #FF385C;
  }

  /* ── Paid banner ── */
  .rfp-paid-banner {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 22px;
    background: linear-gradient(135deg, #F0FFF8 0%, #DCFCE7 100%);
    border: 1.5px solid #A3E6C8;
    border-radius: 16px;
    margin-bottom: 24px;
  }
  .rfp-paid-icon {
    width: 44px; height: 44px;
    background: #1A7A52;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    flex-shrink: 0;
  }
  .rfp-paid-title {
    font-size: 16px;
    font-weight: 800;
    color: #1A7A52;
  }
  .rfp-paid-sub {
    font-size: 13px;
    color: #2D7A56;
    margin-top: 2px;
    font-weight: 500;
  }
`;

/* ─── Sub-components ─────────────────────────────────────────── */
const Spinner = ({ dark }) => (
  <span className={`rfp-spinner${dark ? " dark" : ""}`} />
);

const StepBar = ({ step }) => {
  const steps = ["Choose method", "Upload receipt", "Approval"];
  return (
    <div className="rfp-steps">
      {steps.map((label, i) => {
        const idx = i + 1;
        const cls = step > idx ? "done" : step === idx ? "active" : "";
        return (
          <div key={idx} className={`rfp-step ${cls}`}>
            <div className="rfp-step-num">
              {step > idx ? "✓" : idx}
            </div>
            <div className="rfp-step-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
export default function ReservationFeePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const reservationFromState = location.state?.reservation;
  const paymentIdFromParam = params.paymentId;

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const [reservation, setReservation] = useState(reservationFromState || null);
  const [method, setMethod] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [existingReceiptUrl, setExistingReceiptUrl] = useState("");
  const [existingMethod, setExistingMethod] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  const methodLabel = useMemo(
    () => METHOD_OPTIONS.find((m) => m.value === method)?.label || "",
    [method]
  );

  const isPaid    = String(paymentStatus).toLowerCase() === "paid";
  const isPending = String(paymentStatus).toLowerCase() === "pending";

  // Derive step from state
  const currentStep = useMemo(() => {
    if (isPaid) return 3;
    if (existingReceiptUrl) return 3;
    if (existingMethod || method) return 2;
    return 1;
  }, [isPaid, existingReceiptUrl, existingMethod, method]);

  const statusPill = useMemo(() => {
    const s = String(paymentStatus || "").toLowerCase();
    if (s === "paid")    return { bg: T.successBg, border: T.successBorder, text: T.successText, dot: "#1A7A52", label: "Approved & Paid" };
    if (s === "pending") return { bg: T.pendingBg, border: T.pendingBorder, text: T.pendingText, dot: "#D97706", label: "Pending Approval" };
    if (s === "unpaid")  return { bg: T.errorBg,   border: T.errorBorder,   text: T.errorText,  dot: "#C0293F", label: "Not Submitted" };
    return { bg: T.surface, border: T.border, text: T.silver, dot: "#aaa", label: (paymentStatus || "—") };
  }, [paymentStatus]);

  const fetchReservationStatus = async () => {
    if (!token) return;
    const paymentId = reservation?.paymentId || paymentIdFromParam;
    if (!paymentId) return;
    setStatusLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/tenant", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return;
      const list = Array.isArray(data) ? data : [];
      const p = list.find((x) => String(x?._id) === String(paymentId));
      if (!p) return;
      if (!reservation) {
        const apt = p.apartment;
        setReservation({
          apartmentId: apt?._id || apt,
          paymentId: p._id,
          amount: p.amount,
          apartmentTitle: apt?.title || apt?.unitType || "Apartment",
          apartmentLocation: apt?.location,
        });
      }
      setPaymentStatus(p.status || "");
      setExistingReceiptUrl(p.receiptUrl ? `http://localhost:5000${p.receiptUrl}` : "");
      setExistingMethod(p.method || "");
      if (p.method && !method) setMethod(p.method);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (reservationFromState) setReservation(reservationFromState);
  }, [reservationFromState?.paymentId]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchReservationStatus();
    const t = setInterval(fetchReservationStatus, 5000);
    return () => clearInterval(t);
  }, [isLoggedIn, reservation?.paymentId, paymentIdFromParam]);

  const goToLoginIfNeeded = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/reservation-fee" } });
      return true;
    }
    return false;
  };

  const saveMethod = async () => {
    if (goToLoginIfNeeded()) return false;
    setMessage(""); setError("");
    if (!reservation?.paymentId) { setError("Missing reservation payment details. Please go back and click Reserve Now again."); return false; }
    if (!method) { setError("Please select a payment method."); return false; }
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/tenant/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentId: reservation.paymentId, apartmentId: reservation.apartmentId, method }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.message || "Failed to save payment method."); return false; }
      setMessage(data?.message || "Payment method saved! Upload your receipt to continue.");
      return true;
    } catch { setError("Failed to save payment method."); return false; }
    finally { setSaving(false); }
  };

  const uploadReceipt = async () => {
    if (goToLoginIfNeeded()) return;
    setMessage(""); setError("");
    if (!reservation?.paymentId) { setError("Missing reservation payment details."); return; }
    if (!method) { setError("Please select a payment method first."); return; }
    if (!receipt) { setError("Please choose a receipt file to upload."); return; }
    setUploading(true);
    try {
      const ok = await saveMethod();
      if (!ok) return;
      const form = new FormData();
      form.append("receipt", receipt);
      const res = await fetch(
        `http://localhost:5000/api/payments/tenant/reservation/${reservation.paymentId}/receipt`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form }
      );
      const data = await res.json();
      if (!res.ok) { setError(data?.message || "Failed to upload receipt."); return; }
      setMessage(data?.message || `Receipt uploaded! Awaiting admin approval. (${methodLabel || method})`);
      setReceipt(null);
      await fetchReservationStatus();
    } catch { setError("Failed to upload receipt."); }
    finally { setUploading(false); }
  };

  /* ── Guard: no reservation ── */
  if (!reservation) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div className="rfp-page">
          <TenantHeader />
          <div className="rfp-container">
            <div className="rfp-card" style={{ maxWidth: 480, margin: "60px auto", padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                No reservation found
              </h2>
              <p style={{ color: T.silver, fontSize: 14.5, lineHeight: 1.6, marginBottom: 24 }}>
                Missing reservation details. Please go back to the apartment page and click "Reserve Now".
              </p>
              <button className="rfp-btn rfp-btn-primary" onClick={() => navigate(-1)}>
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="rfp-page">
        <TenantHeader />

        <div className="rfp-container">

          {/* Breadcrumb */}
          <div className="rfp-breadcrumb">
            <a onClick={() => navigate(`/apartment/${reservation.apartmentId}`)}>
              {reservation.apartmentTitle || "Apartment"}
            </a>
            <span>›</span>
            <span style={{ color: "#222", fontWeight: 700 }}>Reservation Fee</span>
          </div>

          {/* Page heading */}
          <h1 className="rfp-heading">Confirm your reservation fee</h1>
          <p className="rfp-subheading">
            Complete payment to secure your unit. The landlord will approve once your receipt is verified.
          </p>

          {/* Status row */}
          <div className="rfp-status-row">
            <div
              className="rfp-badge"
              style={{ background: statusPill.bg, borderColor: statusPill.border, color: statusPill.text }}
            >
              <div className="rfp-badge-dot" style={{ background: statusPill.dot }} />
              {statusLoading ? "Refreshing…" : statusPill.label}
            </div>
            {existingMethod && (
              <div className="rfp-method-tag">
                {METHOD_OPTIONS.find((m) => m.value === existingMethod)?.icon}{" "}
                {METHOD_OPTIONS.find((m) => m.value === existingMethod)?.label || existingMethod}
              </div>
            )}
          </div>

          {/* Paid success banner */}
          {isPaid && (
            <div className="rfp-paid-banner" style={{ marginTop: 24 }}>
              <div className="rfp-paid-icon">✓</div>
              <div>
                <div className="rfp-paid-title">Payment Approved!</div>
                <div className="rfp-paid-sub">Your reservation fee has been verified. You can now proceed to your full payment.</div>
              </div>
            </div>
          )}

          {/* Two-column layout */}
          <div className="rfp-layout">

            {/* LEFT — Steps */}
            <div>
              {/* Step card */}
              <div className="rfp-card">
                <div className="rfp-card-header">
                  <h3>Payment steps</h3>
                  <p>Follow the steps below to complete your reservation fee payment.</p>
                </div>
                <div className="rfp-card-body">
                  <StepBar step={currentStep} />

                  {/* Step 1: Method */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: currentStep >= 1 ? T.coral : "#f0f0f0",
                        color: currentStep >= 1 ? "#fff" : T.muted,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, flexShrink: 0,
                      }}>1</div>
                      <span style={{ fontWeight: 800, fontSize: 15, color: T.charcoal }}>Select payment method</span>
                    </div>
                    <div className="rfp-method-grid">
                      {METHOD_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          className={`rfp-method-btn${method === opt.value ? " selected" : ""}`}
                          onClick={() => setMethod(opt.value)}
                          disabled={isPaid}
                          type="button"
                        >
                          <div className="rfp-method-icon">{opt.icon}</div>
                          <div className="rfp-method-info">
                            <div className="rfp-method-name">{opt.label}</div>
                            <div className="rfp-method-desc">{opt.desc}</div>
                          </div>
                          <div className={`rfp-method-check${method === opt.value ? " checked" : ""}`}>
                            {method === opt.value && "✓"}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <button
                        className="rfp-btn rfp-btn-secondary"
                        onClick={saveMethod}
                        disabled={saving || !method || isPaid}
                        type="button"
                        style={{ fontSize: 13.5 }}
                      >
                        {saving ? <><Spinner dark /> Saving…</> : "Save method"}
                      </button>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "#f0f0f0", margin: "4px 0 24px" }} />

                  {/* Step 2: Upload */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: currentStep >= 2 ? T.coral : "#f0f0f0",
                        color: currentStep >= 2 ? "#fff" : T.muted,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, flexShrink: 0,
                      }}>2</div>
                      <span style={{ fontWeight: 800, fontSize: 15, color: T.charcoal }}>Upload proof of payment</span>
                    </div>

                    <div className={`rfp-upload-zone${receipt ? " has-file" : ""}`}>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        disabled={isPaid}
                        onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                      />
                      {!receipt ? (
                        <>
                          <div className="rfp-upload-icon">📎</div>
                          <div className="rfp-upload-title">
                            {existingReceiptUrl ? "Replace receipt" : "Drag & drop or click to upload"}
                          </div>
                          <div className="rfp-upload-sub">PNG, JPG, PDF — max 10 MB</div>
                        </>
                      ) : (
                        <>
                          <div className="rfp-upload-icon">✅</div>
                          <div className="rfp-upload-title">File selected</div>
                          <div className="rfp-upload-sub">{receipt.name}</div>
                        </>
                      )}
                    </div>

                    {receipt && isImage(receipt) && (
                      <div className="rfp-receipt-preview">
                        <img src={URL.createObjectURL(receipt)} alt="Receipt preview" />
                      </div>
                    )}

                    {existingReceiptUrl && !receipt && (
                      <>
                        <a className="rfp-receipt-link" href={existingReceiptUrl} target="_blank" rel="noopener noreferrer">
                          🧾 View submitted receipt ↗
                        </a>
                      </>
                    )}

                    <div style={{ marginTop: 16 }}>
                      <button
                        className="rfp-btn rfp-btn-primary"
                        onClick={uploadReceipt}
                        disabled={uploading || !method || !receipt || isPaid}
                        type="button"
                      >
                        {uploading ? <><Spinner /> Uploading…</> : "Submit receipt →"}
                      </button>
                    </div>

                    {/* Alerts */}
                    {message && (
                      <div className="rfp-alert" style={{ background: T.successBg, borderColor: T.successBorder, color: T.successText }}>
                        <span className="rfp-alert-icon">✅</span>
                        <span>{message}</span>
                      </div>
                    )}
                    {error && (
                      <div className="rfp-alert" style={{ background: T.errorBg, borderColor: T.errorBorder, color: T.errorText }}>
                        <span className="rfp-alert-icon">⚠️</span>
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom nav */}
              <div className="rfp-btn-group">
                <button className="rfp-btn rfp-btn-ghost" onClick={() => navigate(`/apartment/${reservation.apartmentId}`)} type="button">
                  ← Back to apartment
                </button>
                <button className="rfp-btn rfp-btn-secondary" style={{ fontSize: 13.5 }} onClick={() => navigate("/payments", { state: { refreshPayments: true } })} type="button">
                  View all payments
                </button>
                <button
                  className="rfp-btn rfp-btn-primary"
                  style={{ flex: "1 1 auto", minWidth: 180 }}
                  disabled={!isPaid}
                  onClick={() => navigate("/payments", { state: { refreshPayments: true } })}
                  type="button"
                >
                  Proceed to Payments →
                </button>
              </div>
            </div>

            {/* RIGHT — Summary sidebar */}
            <div>
              <div className="rfp-price-card">
                <p className="rfp-price-label">Reservation fee</p>
                <div className="rfp-price-amount">
                  <span className="rfp-price-currency">₱</span>
                  {fmt(reservation.amount)}
                </div>

                <div className="rfp-divider" />

                <div className="rfp-detail-row">
                  <span className="rfp-detail-label">Property</span>
                  <span className="rfp-detail-value">{reservation.apartmentTitle || "Apartment"}</span>
                </div>
                <div className="rfp-detail-row">
                  <span className="rfp-detail-label">Location</span>
                  <span className="rfp-detail-value">{formatLocation(reservation.apartmentLocation)}</span>
                </div>
                <div className="rfp-detail-row">
                  <span className="rfp-detail-label">Payment ID</span>
                  <span className="rfp-detail-value" style={{ fontSize: 11.5, wordBreak: "break-all" }}>
                    {reservation.paymentId}
                  </span>
                </div>
                {existingMethod && (
                  <div className="rfp-detail-row">
                    <span className="rfp-detail-label">Method</span>
                    <span className="rfp-detail-value">
                      {METHOD_OPTIONS.find((m) => m.value === existingMethod)?.icon}{" "}
                      {METHOD_OPTIONS.find((m) => m.value === existingMethod)?.label || existingMethod}
                    </span>
                  </div>
                )}

                <div className="rfp-total-row">
                  <span>Total due</span>
                  <span>₱{fmt(reservation.amount)}</span>
                </div>

                <div className="rfp-divider" />

                {/* Security note */}
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
                  <p style={{ fontSize: 12.5, color: T.silver, lineHeight: 1.55, fontWeight: 500 }}>
                    Your payment is secured. The landlord will review and approve your receipt before your balance is activated.
                  </p>
                </div>

                <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>💬</span>
                  <p style={{ fontSize: 12.5, color: T.silver, lineHeight: 1.55, fontWeight: 500 }}>
                    Ensure your receipt clearly shows the amount and reference number for faster approval.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}