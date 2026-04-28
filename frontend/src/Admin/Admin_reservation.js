import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "../header/admin_header";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap";
document.head.appendChild(fontLink);

const styleTag = document.createElement("style");
styleTag.innerHTML = `
  *, *::before, *::after { box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes slideIn {
    from { opacity:0; transform:translateX(-12px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  .ar-fade { animation: fadeUp 0.45s cubic-bezier(.22,.68,0,1.15) both; }
  .ar-fade-1 { animation-delay:.04s; }
  .ar-fade-2 { animation-delay:.10s; }
  .ar-fade-3 { animation-delay:.18s; }

  .ar-row {
    transition: background 0.15s;
  }
  .ar-row:hover { background: #faf9f7 !important; }
  .ar-row:last-child td { border-bottom: none !important; }

  .ar-approve-btn {
    display:inline-flex; align-items:center; gap:6px;
    background: #1a1a1a; color:#fff;
    border:none; border-radius:10px;
    padding: 9px 16px; font-size:13px; font-weight:600;
    font-family:'DM Sans',sans-serif; cursor:pointer;
    transition: all 0.18s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .ar-approve-btn:hover { background:#333; transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.2); }

  .ar-reject-btn {
    display:inline-flex; align-items:center; gap:6px;
    background:transparent; color:#C8602B;
    border:1.5px solid #C8602B; border-radius:10px;
    padding: 9px 16px; font-size:13px; font-weight:600;
    font-family:'DM Sans',sans-serif; cursor:pointer;
    transition: all 0.18s;
  }
  .ar-reject-btn:hover { background:#C8602B; color:#fff; transform:translateY(-1px); }

  .ar-receipt-thumb {
    width:54px; height:54px; object-fit:cover; border-radius:10px;
    border:1.5px solid #e8e3dd;
    transition: transform 0.18s, box-shadow 0.18s;
    display:block;
  }
  .ar-receipt-thumb:hover { transform:scale(1.08); box-shadow:0 4px 16px rgba(0,0,0,0.14); }

  .ar-view-link {
    font-size:13px; font-weight:600; color:#C8602B;
    text-decoration:none; border-bottom:1.5px solid transparent;
    transition: border-color 0.15s;
  }
  .ar-view-link:hover { border-color:#C8602B; }

  .ar-stat-card {
    background:#fff; border:1px solid #ece8e3; border-radius:18px;
    padding:22px 26px; display:flex; flex-direction:column; gap:6px;
    transition: box-shadow 0.18s, transform 0.18s;
  }
  .ar-stat-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.07); transform:translateY(-2px); }

  .ar-spinner {
    width:28px; height:28px; border:3px solid #ece8e3;
    border-top-color:#C8602B; border-radius:50%;
    animation: spin 0.8s linear infinite;
  }

  .ar-toast-success {
    background:#f0fdf4; border:1px solid #bbf7d0; color:#166534;
    border-radius:12px; padding:13px 18px; font-size:13.5px; font-weight:600;
    font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:10px;
    animation: slideIn 0.3s ease both;
  }
  .ar-toast-error {
    background:#fff1f2; border:1px solid #fecdd3; color:#9f1239;
    border-radius:12px; padding:13px 18px; font-size:13.5px; font-weight:600;
    font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:10px;
    animation: slideIn 0.3s ease both;
  }

  .ar-status-pending  { background:#fff7ed; color:#c2410c; border:1px solid #fed7aa; }
  .ar-status-approved { background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; }
  .ar-status-rejected { background:#fff1f2; color:#9f1239; border:1px solid #fecdd3; }
  .ar-status-default  { background:#f4f4f5; color:#52525b; border:1px solid #e4e4e7; }
  .ar-status-pill {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 12px; border-radius:999px;
    font-size:12px; font-weight:700; font-family:'DM Sans',sans-serif;
    text-transform:capitalize; letter-spacing:0.02em;
  }
`;
document.head.appendChild(styleTag);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const formatLocation = (loc) => {
  if (!loc) return "—";
  return [loc.street, loc.barangay, loc.city].map((p) => String(p || "").trim()).filter(Boolean).join(", ") || "—";
};

const isImageMime = (mime) => typeof mime === "string" && mime.toLowerCase().startsWith("image/");

const StatusDot = ({ status }) => {
  const s = String(status || "").toLowerCase();
  const cls = s === "pending" ? "ar-status-pending" : s === "approved" ? "ar-status-approved" : s === "rejected" ? "ar-status-rejected" : "ar-status-default";
  const dot = s === "pending" ? "🕐" : s === "approved" ? "✓" : s === "rejected" ? "✕" : "–";
  return <span className={`ar-status-pill ${cls}`}>{dot} {status || "—"}</span>;
};

export default function AdminReservation() {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const pendingCount   = useMemo(() => payments.filter((p) => String(p?.status).toLowerCase() === "pending").length,  [payments]);
  const approvedCount  = useMemo(() => payments.filter((p) => String(p?.status).toLowerCase() === "approved").length, [payments]);
  const rejectedCount  = useMemo(() => payments.filter((p) => String(p?.status).toLowerCase() === "rejected").length, [payments]);

  const fetchPending = async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:5000/api/payments/admin/reservations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.message || "Failed to load reservation receipts."); setPayments([]); return; }
      setPayments(Array.isArray(data) ? data : []);
    } catch { setError("Failed to load reservation receipts."); setPayments([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPending(); }, [token]);

  const review = async (paymentId, action) => {
    setMessage(""); setError(""); setActionLoading(paymentId + action);
    try {
      const res = await fetch(`http://localhost:5000/api/payments/admin/reservations/${paymentId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.message || "Failed to update status."); return; }
      setMessage(data?.message || `Receipt ${action}d successfully.`);
      await fetchPending();
    } catch { setError("Failed to update status."); }
    finally { setActionLoading(null); }
  };

  if (!token) return (
    <div style={{ minHeight:"100vh", background:"#faf9f7", fontFamily:"'DM Sans',sans-serif" }}>
      <AdminHeader />
      <div style={{ padding:"60px 40px", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:32, color:"#1a1a1a", margin:"0 0 8px" }}>Access Denied</h1>
        <p style={{ color:"#888", fontSize:15 }}>Please login with admin credentials.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#faf9f7", fontFamily:"'DM Sans',sans-serif" }}>
      <AdminHeader />

      <div style={{ maxWidth:1360, margin:"0 auto", padding:"40px 40px 80px" }}>

        {/* ── Page Header ── */}
        <div className="ar-fade ar-fade-1" style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:38, fontWeight:400, color:"#1a1a1a", margin:"0 0 6px", letterSpacing:"-0.3px" }}>
            Reservations
          </h1>
          <p style={{ margin:0, color:"#999", fontSize:14.5, fontWeight:400 }}>
            Review and manage all reservation fee submissions
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="ar-fade ar-fade-2" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16, marginBottom:28 }}>
          {[
            { label:"Pending Review", value:pendingCount,  accent:"#c2410c", bg:"#fff7ed", icon:"🕐" },
            { label:"Approved",       value:approvedCount, accent:"#166534", bg:"#f0fdf4", icon:"✓" },
            { label:"Rejected",       value:rejectedCount, accent:"#9f1239", bg:"#fff1f2", icon:"✕" },
          ].map((s, i) => (
            <div key={i} className="ar-stat-card">
              <div style={{ fontSize:28, lineHeight:1 }}>{s.icon}</div>
              <div style={{ fontSize:36, fontWeight:700, fontFamily:"'DM Serif Display',serif", color:"#1a1a1a", lineHeight:1, marginTop:4 }}>{s.value}</div>
              <div style={{ fontSize:13, fontWeight:500, color:"#999", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Toast Messages ── */}
        {message && (
          <div className="ar-toast-success" style={{ marginBottom:16 }}>
            <span>✓</span> {message}
          </div>
        )}
        {error && (
          <div className="ar-toast-error" style={{ marginBottom:16 }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* ── Table Card ── */}
        <div className="ar-fade ar-fade-3" style={{ background:"#fff", border:"1px solid #ece8e3", borderRadius:20, overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.05)" }}>

          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 20px", gap:16 }}>
              <div className="ar-spinner" />
              <span style={{ fontSize:14, color:"#bbb" }}>Loading reservations…</span>
            </div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
              <p style={{ color:"#aaa", fontSize:15, margin:0 }}>No reservation records found.</p>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"#faf9f7", borderBottom:"1px solid #ece8e3" }}>
                    {["Tenant","Apartment","Amount","Uploaded","Receipt","Status","Action"].map((h) => (
                      <th key={h} style={{ textAlign:"left", fontSize:11.5, color:"#bbb", padding:"13px 20px", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={p._id} className="ar-row" style={{ background: idx % 2 === 0 ? "#fff" : "#fdfcfb", borderBottom:"1px solid #f0ede9" }}>

                      {/* Tenant */}
                      <td style={{ padding:"16px 20px", verticalAlign:"middle" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#1a1a1a,#444)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:15, flexShrink:0 }}>
                            {(p.tenant?.name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:14, color:"#1a1a1a" }}>{p.tenant?.name || "—"}</div>
                            <div style={{ fontSize:12.5, color:"#aaa", marginTop:2 }}>{p.tenant?.email || "—"}</div>
                          </div>
                        </div>
                      </td>

                      {/* Apartment */}
                      <td style={{ padding:"16px 20px", verticalAlign:"middle" }}>
                        <div style={{ fontWeight:700, fontSize:14, color:"#1a1a1a", marginBottom:3 }}>{p.apartment?.title || "—"}</div>
                        <div style={{ fontSize:12.5, color:"#aaa" }}>{formatLocation(p.apartment?.location)}</div>
                      </td>

                      {/* Amount */}
                      <td style={{ padding:"16px 20px", verticalAlign:"middle" }}>
                        <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, fontWeight:400, color:"#1a1a1a" }}>
                          ₱{Number(p.amount || 0).toLocaleString("en-PH")}
                        </span>
                      </td>

                      {/* Uploaded */}
                      <td style={{ padding:"16px 20px", verticalAlign:"middle", whiteSpace:"nowrap" }}>
                        <span style={{ fontSize:13, color:"#777" }}>{fmtDate(p.receiptUploadedAt || p.createdAt)}</span>
                      </td>

                      {/* Receipt */}
                      <td style={{ padding:"16px 20px", verticalAlign:"middle" }}>
                        {p.receiptUrl ? (
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            {isImageMime(p.receiptMimeType) && (
                              <a href={`http://localhost:5000${p.receiptUrl}`} target="_blank" rel="noopener noreferrer">
                                <img
                                  className="ar-receipt-thumb"
                                  src={`http://localhost:5000${p.receiptUrl}`}
                                  alt={p.receiptOriginalName || "Receipt"}
                                />
                              </a>
                            )}
                            <a className="ar-view-link" href={`http://localhost:5000${p.receiptUrl}`} target="_blank" rel="noopener noreferrer">
                              View →
                            </a>
                          </div>
                        ) : (
                          <span style={{ fontSize:13, color:"#ccc" }}>None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding:"16px 20px", verticalAlign:"middle" }}>
                        <StatusDot status={p.status} />
                      </td>

                      {/* Action */}
                      <td style={{ padding:"16px 20px", verticalAlign:"middle" }}>
                        {String(p.status).toLowerCase() === "pending" ? (
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            <button
                              className="ar-approve-btn"
                              onClick={() => review(p._id, "approve")}
                              disabled={!!actionLoading}
                              style={{ opacity: actionLoading ? 0.6 : 1 }}
                            >
                              {actionLoading === p._id + "approve" ? "…" : "✓"} Approve
                            </button>
                            <button
                              className="ar-reject-btn"
                              onClick={() => review(p._id, "reject")}
                              disabled={!!actionLoading}
                              style={{ opacity: actionLoading ? 0.6 : 1 }}
                            >
                              {actionLoading === p._id + "reject" ? "…" : "✕"} Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize:13, color:"#ccc", fontStyle:"italic" }}>No action needed</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && payments.length > 0 && (
          <p style={{ textAlign:"right", marginTop:12, fontSize:13, color:"#ccc" }}>
            {payments.length} record{payments.length !== 1 ? "s" : ""} total
          </p>
        )}
      </div>
    </div>
  );
}

