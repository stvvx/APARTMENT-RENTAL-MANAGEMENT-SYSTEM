import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TenantHeader from "../header/tenant_header";

const T = {
  coral: "#FF385C",
  coralDark: "#E31C5F",
  border: "#EBEBEB",
  surface: "#F7F7F7",
  silver: "#717171",
  charcoal: "#222222",
  white: "#FFFFFF",
  successBg: "#ECFDF5",
  successBorder: "#B7E4DA",
  errorBg: "#FFF1F3",
  errorBorder: "#FFD6DB",
};

const fmt = (n) => Number(n || 0).toLocaleString("en-PH");

const formatLocation = (loc) => {
  if (!loc) return "—";
  const parts = [loc.street, loc.barangay, loc.city].map((p) => String(p || "").trim()).filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
};

const METHOD_OPTIONS = [
  { value: "gcash", label: "GCash" },
  { value: "paymaya", label: "PayMaya" },
  { value: "bank transfer", label: "Card / Bank Transfer" },
  { value: "cash", label: "COD (Cash on Delivery)" },
];

const isImage = (file) => file && file.type && file.type.startsWith("image/");

export default function ReservationFeePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // allow either navigation-state or URL param
  const reservationFromState = location.state?.reservation;
  const paymentIdFromParam = params.paymentId;

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  // hydration state (so we can render even if state is missing)
  const [reservation, setReservation] = useState(reservationFromState || null);

  const [method, setMethod] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // persisted server state
  const [paymentStatus, setPaymentStatus] = useState("");
  const [existingReceiptUrl, setExistingReceiptUrl] = useState("");
  const [existingMethod, setExistingMethod] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  const methodLabel = useMemo(
    () => METHOD_OPTIONS.find((m) => m.value === method)?.label || "",
    [method]
  );

  const statusPill = useMemo(() => {
    const s = String(paymentStatus || "").toLowerCase();
    if (s === "paid") return { bg: T.successBg, border: T.successBorder, label: "APPROVED / PAID" };
    if (s === "pending") return { bg: "#EBF5FF", border: "#BDD9FF", label: "PENDING APPROVAL" };
    if (s === "unpaid") return { bg: T.errorBg, border: T.errorBorder, label: "NOT SUBMITTED" };
    return { bg: T.surface, border: T.border, label: (paymentStatus || "—").toUpperCase() };
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

      // If we landed via URL (no state), hydrate reservation details from the payment record.
      // Populate apartment info where possible.
      if (!reservation) {
        const apt = p.apartment;
        const aptId = apt?._id || apt;

        setReservation({
          apartmentId: aptId,
          paymentId: p._id,
          amount: p.amount,
          apartmentTitle: apt?.title || apt?.unitType || "Apartment",
          apartmentLocation: apt?.location,
        });
      }

      setPaymentStatus(p.status || "");
      setExistingReceiptUrl(p.receiptUrl ? `http://localhost:5000${p.receiptUrl}` : "");
      setExistingMethod(p.method || "");

      // prefill chosen method from server (if tenant already saved it)
      if (p.method && !method) setMethod(p.method);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    // if navigation state changes (rare), sync
    if (reservationFromState) setReservation(reservationFromState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationFromState?.paymentId]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchReservationStatus();
    const t = setInterval(fetchReservationStatus, 5000); // auto-refresh status
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    setMessage("");
    setError("");

    if (!reservation?.paymentId) {
      setError("Missing reservation payment details. Please go back and click Reserve Now again.");
      return false;
    }
    if (!method) {
      setError("Please select a payment method.");
      return false;
    }

    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/tenant/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: reservation.paymentId,
          apartmentId: reservation.apartmentId,
          method,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to save payment method.");
        return false;
      }
      setMessage(data?.message || "Payment method saved. Upload your receipt next.");
      return true;
    } catch {
      setError("Failed to save payment method.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadReceipt = async () => {
    if (goToLoginIfNeeded()) return;

    setMessage("");
    setError("");

    if (!reservation?.paymentId) {
      setError("Missing reservation payment details. Please go back and click Reserve Now again.");
      return;
    }
    if (!method) {
      setError("Please select a payment method first.");
      return;
    }
    if (!receipt) {
      setError("Please choose a receipt image/file to upload.");
      return;
    }

    setUploading(true);
    try {
      // ensure method is saved on the payment before uploading receipt
      const ok = await saveMethod();
      if (!ok) return;

      const form = new FormData();
      form.append("receipt", receipt);

      const res = await fetch(
        `http://localhost:5000/api/payments/tenant/reservation/${reservation.paymentId}/receipt`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to upload receipt.");
        return;
      }

      setMessage(
        data?.message ||
          `Receipt uploaded. Waiting for admin approval. (Method: ${methodLabel || method})`
      );

      // Clear local file picker and refresh persisted state from server
      setReceipt(null);
      await fetchReservationStatus();
    } catch {
      setError("Failed to upload receipt.");
    } finally {
      setUploading(false);
    }
  };

  if (!reservation) {
    return (
      <Box sx={{ background: T.surface, minHeight: "100vh" }}>
        <TenantHeader />
        <Box sx={{ maxWidth: 980, margin: "0 auto", px: 4, py: 5 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 800, color: T.charcoal, mb: 1 }}>
            Reservation Fee
          </Typography>
          <Typography sx={{ color: T.silver, mb: 3 }}>
            Missing reservation details. Please go back to the apartment details page and click “Reserve Now”.
          </Typography>
          <Button variant="contained" onClick={() => navigate(-1)} sx={{ background: T.coral, "&:hover": { background: T.coralDark } }}>
            Back
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ background: T.surface, minHeight: "100vh" }}>
      <TenantHeader />

      <Box sx={{ maxWidth: 980, margin: "0 auto", px: { xs: 2.5, md: 4 }, py: 5 }}>
        <Typography sx={{ fontSize: 26, fontWeight: 800, color: T.charcoal, mb: 0.5 }}>
          Reservation Fee Payment
        </Typography>
        <Typography sx={{ color: T.silver, mb: 2 }}>
          Choose a payment method, then upload your receipt. The admin will approve it to unlock your apartment balance.
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 3, flexWrap: "wrap" }}>
          <Box sx={{ px: 1.5, py: 0.6, borderRadius: 999, background: statusPill.bg, border: `1px solid ${statusPill.border}` }}>
            <Typography sx={{ fontWeight: 900, fontSize: 12, color: T.charcoal, letterSpacing: "0.4px" }}>
              {statusLoading ? "Checking status…" : statusPill.label}
            </Typography>
          </Box>
          {existingMethod && (
            <Typography sx={{ color: T.silver, fontSize: 13.5 }}>
              Method: <b>{METHOD_OPTIONS.find((m) => m.value === existingMethod)?.label || existingMethod}</b>
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(34,34,34,0.06)",
          }}
        >
          <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${T.border}` }}>
            <Typography sx={{ fontWeight: 800, color: T.charcoal, mb: 0.5 }}>
              Reservation details
            </Typography>
            <Typography sx={{ color: T.silver, fontSize: 13.5 }}>
              {reservation.apartmentTitle || "Apartment"} • {formatLocation(reservation.apartmentLocation)}
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5, px: 3, py: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: T.silver, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Amount due
              </Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 900, color: T.charcoal, mt: 0.5 }}>
                ₱{fmt(reservation.amount)}
              </Typography>
              <Typography sx={{ color: T.silver, fontSize: 13.5, mt: 0.75 }}>
                Payment ID: <b>{reservation.paymentId}</b>
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: T.silver, textTransform: "uppercase", letterSpacing: "0.6px", mb: 1 }}>
                Payment Method
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {METHOD_OPTIONS.map((opt) => (
                  <Box
                    key={opt.value}
                    component="button"
                    type="button"
                    onClick={() => setMethod(opt.value)}
                    disabled={String(paymentStatus).toLowerCase() === "paid"}
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: `1px solid ${method === opt.value ? T.coral : T.border}`,
                      background: method === opt.value ? "#FF385C10" : "#fff",
                      cursor: String(paymentStatus).toLowerCase() === "paid" ? "not-allowed" : "pointer",
                      fontWeight: 800,
                      color: T.charcoal,
                      opacity: String(paymentStatus).toLowerCase() === "paid" ? 0.6 : 1,
                    }}
                  >
                    {opt.label}
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 1.5, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  disabled={saving || !method || String(paymentStatus).toLowerCase() === "paid"}
                  onClick={saveMethod}
                  sx={{
                    borderColor: "#ddd",
                    color: T.charcoal,
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: 2,
                  }}
                >
                  {saving ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} /> Saving…
                    </Box>
                  ) : (
                    "Save method"
                  )}
                </Button>

                <Button
                  variant="contained"
                  onClick={uploadReceipt}
                  disabled={
                    uploading ||
                    !method ||
                    !receipt ||
                    String(paymentStatus).toLowerCase() === "paid"
                  }
                  sx={{
                    background: T.coral,
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: 2,
                    "&:hover": { background: T.coralDark },
                  }}
                >
                  {uploading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} sx={{ color: "#fff" }} /> Uploading…
                    </Box>
                  ) : (
                    "Submit receipt"
                  )}
                </Button>
              </Box>
            </Box>
          </Box>

          <Box sx={{ px: 3, pb: 3 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: T.silver, textTransform: "uppercase", letterSpacing: "0.6px", mb: 1 }}>
              Upload receipt
            </Typography>

            <Box
              sx={{
                border: `1px dashed ${T.border}`,
                borderRadius: 3,
                p: 2.5,
                background: "#fff",
              }}
            >
              <input
                type="file"
                accept="image/*,application/pdf"
                disabled={String(paymentStatus).toLowerCase() === "paid"}
                onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              />

              {existingReceiptUrl && !receipt && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ color: T.silver, fontSize: 13.5, mb: 1 }}>
                    Previously uploaded receipt:
                  </Typography>
                  <a href={existingReceiptUrl} target="_blank" rel="noopener noreferrer">
                    View receipt
                  </a>
                </Box>
              )}

              {receipt && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ color: T.silver, fontSize: 13.5 }}>
                    Selected: <b>{receipt.name}</b>
                  </Typography>
                  {isImage(receipt) && (
                    <Box sx={{ mt: 1.5 }}>
                      <img
                        src={URL.createObjectURL(receipt)}
                        alt="Receipt preview"
                        style={{ width: "100%", maxWidth: 520, borderRadius: 12, border: "1px solid #eee" }}
                      />
                    </Box>
                  )}
                </Box>
              )}

              <Typography sx={{ color: T.silver, fontSize: 12.5, mt: 1.5 }}>
                Tip: Make sure the amount and reference number are visible.
              </Typography>
            </Box>

            {message && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, border: `1px solid ${T.successBorder}`, background: T.successBg }}>
                <Typography sx={{ fontWeight: 700, color: T.charcoal, fontSize: 13.5 }}>{message}</Typography>
              </Box>
            )}
            {error && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, border: `1px solid ${T.errorBorder}`, background: T.errorBg }}>
                <Typography sx={{ fontWeight: 700, color: T.charcoal, fontSize: 13.5 }}>{error}</Typography>
              </Box>
            )}

            <Box sx={{ mt: 2.5, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                variant="text"
                onClick={() => navigate(`/apartment/${reservation.apartmentId}`)}
                sx={{ textTransform: "none", fontWeight: 800, color: T.charcoal }}
              >
                Back to apartment
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/payments", { state: { refreshPayments: true } })}
                sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, borderColor: "#ddd", color: T.charcoal }}
              >
                Go to Payments
              </Button>
              <Button
                variant="contained"
                disabled={String(paymentStatus).toLowerCase() !== "paid"}
                onClick={() => navigate("/payments", { state: { refreshPayments: true } })}
                sx={{
                  background: T.coral,
                  textTransform: "none",
                  fontWeight: 900,
                  borderRadius: 2,
                  "&:hover": { background: T.coralDark },
                  "&.Mui-disabled": { background: "#f1f1f1", color: "#9aa0a6" },
                }}
              >
                Proceed to Payments
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
