import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "../header/admin_header";

const styles = {
  page: { background: "#fff", minHeight: "100vh", color: "#222" },
  content: { padding: "32px 40px", maxWidth: 1400, margin: "0 auto" },
  title: { fontSize: 28, fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.4px" },
  subtitle: { margin: 0, color: "#717171", fontSize: 14 },
  card: {
    marginTop: 22,
    background: "#f7f7f7",
    border: "1px solid #ebebeb",
    borderRadius: 16,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#717171",
    padding: "14px 16px",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    borderBottom: "1px solid #ebebeb",
    background: "#fafafa",
  },
  td: { padding: "14px 16px", borderBottom: "1px solid #ebebeb", verticalAlign: "top", fontSize: 14 },
  pill: (bg, color) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    background: bg,
    color,
    fontSize: 12,
    fontWeight: 700,
    border: `1px solid ${bg === "#EBF5FF" ? "#BDD9FF" : "#ebebeb"}`,
  }),
  btn: (variant) => {
    const base = {
      borderRadius: 10,
      padding: "10px 12px",
      border: "1px solid #ddd",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 13,
      background: "#fff",
    };
    if (variant === "approve") return { ...base, background: "#00A699", color: "#fff", borderColor: "#00A699" };
    if (variant === "reject") return { ...base, background: "#FF385C", color: "#fff", borderColor: "#FF385C" };
    return base;
  },
  empty: { padding: 26, color: "#717171" },
  toast: (type) => ({
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 12,
    border: `1px solid ${type === "error" ? "#FECACA" : "#B7E4DA"}`,
    background: type === "error" ? "#FFF1F3" : "#ECFDF5",
    color: type === "error" ? "#B42318" : "#065F46",
    fontWeight: 600,
    fontSize: 13,
  }),
};

const fmtDate = (d) => (d ? new Date(d).toLocaleString("en-PH") : "—");

const formatLocation = (loc) => {
  if (!loc) return "—";
  const parts = [loc.street, loc.barangay, loc.city].map((p) => String(p || "").trim()).filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
};

const isImageMime = (mime) => typeof mime === "string" && mime.toLowerCase().startsWith("image/");

export default function AdminReservation() {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const pendingCount = useMemo(
    () => (Array.isArray(payments) ? payments.filter((p) => p?.status === "pending").length : 0),
    [payments]
  );

  const fetchPending = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/payments/admin/reservations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to load reservation receipts.");
        setPayments([]);
        return;
      }
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load reservation receipts.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const review = async (paymentId, action) => {
    setMessage("");
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/payments/admin/reservations/${paymentId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to update status.");
        return;
      }
      setMessage(data?.message || `Receipt ${action}d.`);
      await fetchPending();
    } catch {
      setError("Failed to update status.");
    }
  };

  if (!token) {
    return (
      <div style={styles.page}>
        <AdminHeader />
        <div style={styles.content}>
          <h1 style={styles.title}>Access Denied</h1>
          <p style={styles.subtitle}>Please login with admin credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <AdminHeader />
      <div style={styles.content}>
        <h1 style={styles.title}>Reservations</h1>
        <p style={styles.subtitle}>
          All reservation fee submissions (pending / approved / rejected). Pending: <b>{pendingCount}</b>
        </p>

        {message && <div style={styles.toast("success")}>{message}</div>}
        {error && <div style={styles.toast("error")}>{error}</div>}

        <div style={styles.card}>
          {loading ? (
            <div style={styles.empty}>Loading…</div>
          ) : payments.length === 0 ? (
            <div style={styles.empty}>No reservation records found.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Tenant</th>
                  <th style={styles.th}>Apartment</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Uploaded</th>
                  <th style={styles.th}>Receipt</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 800 }}>{p.tenant?.name || "—"}</div>
                      <div style={{ color: "#717171", fontSize: 13 }}>{p.tenant?.email || "—"}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 800 }}>{p.apartment?.title || "—"}</div>
                      <div style={{ color: "#717171", fontSize: 13 }}>{formatLocation(p.apartment?.location)}</div>
                    </td>
                    <td style={styles.td}>₱{Number(p.amount || 0).toLocaleString("en-PH")}</td>
                    <td style={styles.td}>{fmtDate(p.receiptUploadedAt || p.createdAt)}</td>
                    <td style={styles.td}>
                      {p.receiptUrl ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {isImageMime(p.receiptMimeType) && (
                            <a
                              href={`http://localhost:5000${p.receiptUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "inline-flex" }}
                            >
                              <img
                                src={`http://localhost:5000${p.receiptUrl}`}
                                alt={p.receiptOriginalName || "Receipt"}
                                style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 10, border: "1px solid #ddd" }}
                              />
                            </a>
                          )}
                          <a href={`http://localhost:5000${p.receiptUrl}`} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.pill("#EBF5FF", "#0070F3")}>{p.status || "—"}</span>
                    </td>
                    <td style={styles.td}>
                      {String(p.status).toLowerCase() === 'pending' ? (
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button style={styles.btn("approve")} onClick={() => review(p._id, "approve")}>
                            Approve
                          </button>
                          <button style={styles.btn("reject")} onClick={() => review(p._id, "reject")}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "#717171", fontSize: 13 }}>
                          No action
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
