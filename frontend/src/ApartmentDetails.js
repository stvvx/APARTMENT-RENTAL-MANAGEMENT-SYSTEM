import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button, CircularProgress } from "@mui/material";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap";
document.head.appendChild(fontLink);

const styleTag = document.createElement("style");
styleTag.innerHTML = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  .apt-fade { animation: fadeUp 0.55s cubic-bezier(.22,.68,0,1.2) both; }
  .apt-fade-1 { animation-delay: .05s; }
  .apt-fade-2 { animation-delay: .13s; }
  .apt-fade-3 { animation-delay: .21s; }
  .apt-fade-4 { animation-delay: .29s; }
  .apt-fade-5 { animation-delay: .37s; }

  .thumb-img-btn {
    border-radius: 10px;
    overflow: hidden;
    border: 2.5px solid transparent;
    padding: 0;
    background: none;
    cursor: pointer;
    flex-shrink: 0;
    width: 96px;
    height: 68px;
    transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
    position: relative;
  }
  .thumb-img-btn:hover { transform: scale(1.05); box-shadow: 0 4px 16px rgba(0,0,0,0.14); }
  .thumb-img-btn.active { border-color: #C8602B; box-shadow: 0 0 0 3px rgba(200,96,43,0.18); }

  .back-btn {
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(0,0,0,0.09);
    padding: 10px 20px;
    border-radius: 100px;
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 600;
    color: #1a1a1a;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.01em;
    transition: all 0.18s;
    display: flex;
    align-items: center;
    gap: 7px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  }
  .back-btn:hover { background: #fff; box-shadow: 0 3px 16px rgba(0,0,0,0.11); transform: translateY(-1px); }

  .reserve-btn {
    background: linear-gradient(135deg, #C8602B 0%, #e8784a 100%);
    color: #fff;
    border: none;
    padding: 16px 28px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 14px;
    cursor: pointer;
    letter-spacing: 0.01em;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(200,96,43,0.30);
    position: relative;
    overflow: hidden;
  }
  .reserve-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(200,96,43,0.38);
  }
  .reserve-btn:disabled {
    background: #eee;
    color: #aaa;
    cursor: not-allowed;
    box-shadow: none;
  }
  .reveal-btn {
    background: transparent;
    border: 1.5px solid #1a1a1a;
    color: #1a1a1a;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.18s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .reveal-btn:hover { background: #1a1a1a; color: #fff; }

  .amenity-chip {
    background: #f5f0eb;
    border: 1px solid #e8ddd3;
    border-radius: 100px;
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 500;
    color: #4a3728;
    font-family: 'DM Sans', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .info-card {
    background: #fafaf8;
    border: 1px solid #ece8e3;
    border-radius: 20px;
    padding: 28px 32px;
    margin-bottom: 28px;
    transition: box-shadow 0.18s;
  }
  .info-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.06); }

  .price-sidebar {
    background: #1a1a1a;
    border-radius: 24px;
    padding: 36px 32px;
    position: sticky;
    top: 24px;
    color: #fff;
    box-shadow: 0 8px 48px rgba(0,0,0,0.18);
  }

  .dot-status {
    width: 8px; height: 8px; border-radius: 50%;
    background: #4caf50;
    display: inline-block;
    animation: pulse-dot 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  .photo-count-badge {
    position: absolute;
    bottom: 18px;
    right: 18px;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(6px);
    border-radius: 100px;
    padding: 5px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.02em;
    pointer-events: none;
  }

  .tag-pill {
    background: #fff8f5;
    border: 1px solid #f0ddd3;
    color: #C8602B;
    border-radius: 100px;
    padding: 4px 14px;
    font-size: 12.5px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
`;
document.head.appendChild(styleTag);

const ICONS = {
  bed:      "🛏",
  bath:     "🚿",
  floor:    "🏢",
  location: "📍",
  furnish:  "🪑",
  pet:      "🐾",
  deposit:  "💰",
  advance:  "📋",
  lease:    "📅",
  avail:    "✅",
  back:     "←",
  lock:     "🔒",
  unlock:   "✉️",
  phone:    "📞",
  email:    "✉️",
  check:    "✓",
};

export default function ApartmentDetails() {
  const { id } = useParams();
  const location = useLocation();
  const routedApartment =
    location.state?.apartment && location.state.apartment._id === id
      ? location.state.apartment
      : null;
  const [apartment, setApartment] = useState(routedApartment);
  const [loading, setLoading] = useState(!routedApartment);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [contact, setContact] = useState(null);
  const [contactError, setContactError] = useState("");
  const [reservationPaid, setReservationPaid] = useState(false);
  const [reservationStatusLoading, setReservationStatusLoading] = useState(false);
  const [applicationApproved, setApplicationApproved] = useState(false);
  const [applicationStatusLoading, setApplicationStatusLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchApartment() {
      if (routedApartment) setApartment(routedApartment);
      else setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/apartments/${id}`);
        const data = await res.json();
        if (!res.ok || !data?._id) { if (!routedApartment) setApartment(null); }
        else setApartment(data);
      } catch { if (!routedApartment) setApartment(null); }
      finally { setLoading(false); }
    }
    fetchApartment();
  }, [id, routedApartment]);

  useEffect(() => { setActivePhotoIndex(0); }, [id, apartment?._id]);

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const fetchReservationPaidStatus = async () => {
    if (!token) { setReservationPaid(false); return; }
    setReservationStatusLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/tenant", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) return;
      const hasPaid = (Array.isArray(data) ? data : []).some(
        p => String(p?.paymentType||"").toLowerCase() === "reservation" &&
             String(p?.status||"").toLowerCase() === "paid" &&
             String(p?.apartment?._id || p?.apartment) === String(id)
      );
      setReservationPaid(hasPaid);
    } catch {} finally { setReservationStatusLoading(false); }
  };

  const fetchApplicationApprovalStatus = async () => {
    if (!token) { setApplicationApproved(false); return; }
    setApplicationStatusLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/applications/mine", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) return;
      const list = Array.isArray(data) ? data : Array.isArray(data?.applications) ? data.applications : [];
      const app = list.find(a => String(a?.apartment?._id || a?.apartment) === String(id));
      setApplicationApproved(String(app?.status||"").toLowerCase() === "approved");
    } catch {} finally { setApplicationStatusLoading(false); }
  };

  useEffect(() => {
    fetchReservationPaidStatus();
    fetchApplicationApprovalStatus();
  }, [id, token]);

  const formatLocation = (loc) => {
    if (!loc) return "—";
    return [loc.street, loc.barangay, loc.city].map(p => String(p||"").trim()).filter(Boolean).join(", ") || "—";
  };

  const handleReserveNow = async () => {
    setReserveError("");
    if (!isLoggedIn) { navigate("/login", { state: { from: `/apartment/${id}` } }); return; }
    setReserving(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/tenant/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ apartmentId: id }),
      });
      const data = await res.json();
      if (!res.ok) { setReserveError(data?.message || "Failed to start reservation fee payment."); return; }
      navigate(`/reservation-fee/${data?.payment?._id}`, {
        state: { reservation: { apartmentId: id, paymentId: data?.payment?._id, amount: data?.payment?.amount, apartmentTitle: apartment?.title || apartment?.unitType, apartmentLocation: apartment?.location } },
      });
    } catch { setReserveError("Failed to start reservation fee payment."); }
    finally { setReserving(false); }
  };

  const handleRevealContact = async () => {
    setContactError(""); setContact(null);
    if (!isLoggedIn) { navigate("/login", { state: { from: `/apartment/${id}` } }); return; }
    try {
      const res = await fetch(`http://localhost:5000/api/payments/tenant/apartment/${id}/contact`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setContactError(data?.message || "Unable to fetch contact info."); return; }
      setContact(data?.landlord || null);
    } catch { setContactError("Unable to fetch contact info."); }
  };

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#faf9f7", fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <CircularProgress sx={{ color:"#C8602B" }} />
        <span style={{ fontSize:14, color:"#999", fontFamily:"'DM Sans', sans-serif" }}>Loading listing…</span>
      </div>
    </div>
  );

  if (!apartment) return (
    <div style={{ minHeight:"100vh", background:"#faf9f7", fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ padding:"24px 40px" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>{ICONS.back} Back to listings</button>
      </div>
      <div style={{ textAlign:"center", padding:"80px 20px" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🏚</div>
        <h2 style={{ fontFamily:"'DM Serif Display', serif", fontSize:32, color:"#1a1a1a", marginBottom:8 }}>Listing not found</h2>
        <p style={{ color:"#888", fontFamily:"'DM Sans', sans-serif" }}>This listing may have been removed or is no longer available.</p>
      </div>
    </div>
  );

  const photos = apartment.photos?.length ? apartment.photos : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"];
  const currentPhoto = photos[activePhotoIndex] || photos[0];

  const reserveBtnLabel = reservationStatusLoading ? "Checking…"
    : applicationStatusLoading ? "Checking approval…"
    : reservationPaid ? "✓ Already Reserved"
    : reserving ? "Processing…"
    : applicationApproved ? "Reserve Now"
    : "Awaiting Landlord Approval";

  const isReserveDisabled = reserving || reservationPaid || reservationStatusLoading || applicationStatusLoading || !applicationApproved;

  return (
    <div style={{ minHeight:"100vh", background:"#faf9f7", fontFamily:"'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ padding:"20px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, background:"rgba(250,249,247,0.9)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          {ICONS.back} Back to listings
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span className="dot-status"></span>
          <span style={{ fontSize:13, color:"#555", fontWeight:500 }}>Available</span>
        </div>
      </div>

      <div style={{ maxWidth:1180, margin:"0 auto", padding:"40px 40px 80px" }}>

        {/* ── Hero Gallery ── */}
        <div className="apt-fade apt-fade-1" style={{ marginBottom:44, position:"relative" }}>
          <div style={{ borderRadius:24, overflow:"hidden", aspectRatio:"16/7", background:"#e8e4df", position:"relative", boxShadow:"0 8px 48px rgba(0,0,0,0.12)" }}>
            <img
              src={currentPhoto}
              alt={apartment.title || apartment.unitType}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"opacity 0.3s" }}
            />
            {photos.length > 1 && (
              <span className="photo-count-badge">{activePhotoIndex + 1} / {photos.length}</span>
            )}
          </div>
          {photos.length > 1 && (
            <div style={{ display:"flex", gap:10, marginTop:12, overflowX:"auto", paddingBottom:4 }}>
              {photos.map((photo, idx) => (
                <button
                  key={`${photo}-${idx}`}
                  type="button"
                  className={`thumb-img-btn${idx === activePhotoIndex ? " active" : ""}`}
                  onClick={() => setActivePhotoIndex(idx)}
                  aria-label={`Show image ${idx + 1}`}
                >
                  <img src={photo} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Title Row ── */}
        <div className="apt-fade apt-fade-2" style={{ marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:24, flexWrap:"wrap" }}>
            <div>
              {apartment.unitType && <span className="tag-pill">{apartment.unitType}</span>}
              <h1 style={{ fontFamily:"'DM Serif Display', serif", fontSize:42, fontWeight:400, color:"#1a1a1a", marginTop:10, marginBottom:8, lineHeight:1.15, letterSpacing:"-0.5px" }}>
                {apartment.title || apartment.unitType || "Untitled Listing"}
              </h1>
              <div style={{ display:"flex", alignItems:"center", gap:6, color:"#888" }}>
                <span style={{ fontSize:15 }}>{ICONS.location}</span>
                <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:15, fontWeight:400 }}>
                  {apartment.buildingName && <>{apartment.buildingName} &middot; </>}
                  {formatLocation(apartment.location)}
                  {apartment.area && <> &middot; {apartment.area} sqm</>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:36, alignItems:"start" }}>

          {/* Left Column */}
          <div className="apt-fade apt-fade-3">

            {/* Quick Stats Strip */}
            <div className="info-card" style={{ display:"flex", gap:0, flexWrap:"wrap", padding:"0" }}>
              {[
                { icon: ICONS.bed,   label:"Bedrooms",   value: apartment.bedrooms || (apartment.unitType?.toLowerCase() === "studio" ? 1 : "—") },
                { icon: ICONS.bath,  label:"Bathrooms",  value: apartment.bathrooms || "—" },
                { icon: ICONS.floor, label:"Floor",      value: apartment.floor || "—" },
              ].map((stat, i) => (
                <div key={i} style={{ flex:"1 1 120px", padding:"22px 24px", borderRight: i < 2 ? "1px solid #ece8e3" : "none", display:"flex", flexDirection:"column", gap:4 }}>
                  <span style={{ fontSize:22 }}>{stat.icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.06em" }}>{stat.label}</span>
                  <span style={{ fontSize:22, fontWeight:700, color:"#1a1a1a", fontFamily:"'DM Serif Display', serif" }}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="info-card">
              <h3 style={{ fontFamily:"'DM Serif Display', serif", fontSize:20, fontWeight:400, color:"#1a1a1a", marginBottom:20, marginTop:0 }}>Features</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                {[
                  { icon: ICONS.furnish, label:"Furnishing", value: apartment.furnishing },
                  { icon: ICONS.pet,     label:"Pet Policy",  value: apartment.petPolicy },
                ].map((item, i) => item.value && (
                  <div key={i} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.06em" }}>{item.icon} {item.label}</span>
                    <span style={{ fontSize:16, fontWeight:500, color:"#1a1a1a" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            {apartment.amenities?.length > 0 && (
              <div className="info-card">
                <h3 style={{ fontFamily:"'DM Serif Display', serif", fontSize:20, fontWeight:400, color:"#1a1a1a", marginBottom:18, marginTop:0 }}>Amenities</h3>
                <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                  {apartment.amenities.map((amenity, idx) => (
                    <span key={idx} className="amenity-chip">{ICONS.check} {amenity}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Terms */}
            <div className="info-card">
              <h3 style={{ fontFamily:"'DM Serif Display', serif", fontSize:20, fontWeight:400, color:"#1a1a1a", marginBottom:20, marginTop:0 }}>Payment Terms</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                {[
                  { icon: ICONS.deposit, label:"Security Deposit", value: apartment.deposit ? `₱${apartment.deposit.toLocaleString()}` : null },
                  { icon: ICONS.advance, label:"Advance",          value: apartment.advance  ? `₱${apartment.advance.toLocaleString()}`  : null },
                  { icon: ICONS.lease,   label:"Min. Lease Term",  value: apartment.minLeaseTerm || null },
                  { icon: ICONS.avail,   label:"Available From",   value: apartment.availableFrom ? new Date(apartment.availableFrom).toLocaleDateString("en-PH", { year:"numeric", month:"long", day:"numeric" }) : null },
                ].filter(i => i.value).map((item, i) => (
                  <div key={i} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.06em" }}>{item.icon} {item.label}</span>
                    <span style={{ fontSize:16, fontWeight:600, color:"#1a1a1a" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {apartment.description && (
              <div className="info-card">
                <h3 style={{ fontFamily:"'DM Serif Display', serif", fontSize:20, fontWeight:400, color:"#1a1a1a", marginBottom:14, marginTop:0 }}>About this unit</h3>
                <p style={{ color:"#666", lineHeight:1.75, fontSize:15, margin:0 }}>{apartment.description}</p>
              </div>
            )}

            {/* Special Notes */}
            {apartment.specialNotes && (
              <div className="info-card" style={{ background:"#fffbf5", borderColor:"#f0ddd3" }}>
                <h3 style={{ fontFamily:"'DM Serif Display', serif", fontSize:18, fontWeight:400, color:"#C8602B", marginBottom:12, marginTop:0 }}>📌 Special Notes</h3>
                <p style={{ color:"#4a3728", lineHeight:1.7, fontSize:15, margin:0 }}>{apartment.specialNotes}</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="apt-fade apt-fade-4">
            <div className="price-sidebar">
              {/* Price */}
              <div style={{ marginBottom:24, paddingBottom:24, borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Monthly Rent</div>
                <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:46, fontWeight:400, color:"#fff", lineHeight:1, marginBottom:4 }}>
                  ₱{apartment.price?.toLocaleString()}
                </div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>per month</div>
              </div>

              {/* Reserve Button */}
              <button
                className="reserve-btn"
                style={{ width:"100%", marginBottom:12 }}
                onClick={handleReserveNow}
                disabled={isReserveDisabled}
              >
                {reserveBtnLabel}
              </button>

              {!applicationApproved && !applicationStatusLoading && !reservationPaid && (
                <p style={{ fontSize:12.5, color:"rgba(255,255,255,0.45)", textAlign:"center", margin:"0 0 8px", lineHeight:1.6 }}>
                  You'll be able to reserve once the landlord approves your application.
                </p>
              )}

              {reserveError && (
                <div style={{ background:"rgba(220,53,69,0.15)", border:"1px solid rgba(220,53,69,0.3)", borderRadius:10, padding:"10px 14px", marginTop:8 }}>
                  <span style={{ fontSize:13, color:"#ff8080" }}>{reserveError}</span>
                </div>
              )}

              {/* Landlord Section */}
              {apartment.landlord && (
                <div style={{ marginTop:28, paddingTop:24, borderTop:"1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:14 }}>Landlord</div>

                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                    <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg, #C8602B, #e8784a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#fff", flexShrink:0 }}>
                      {(apartment.landlord.name || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, color:"#fff", fontSize:15 }}>{apartment.landlord.name || "Anonymous"}</div>
                      <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.4)" }}>Property Owner</div>
                    </div>
                  </div>

                  {!contact ? (
                    <div>
                      <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:12, padding:"14px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:18 }}>{ICONS.lock}</span>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.7)", marginBottom:2 }}>Contact hidden</div>
                          <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", lineHeight:1.4 }}>Pay the reservation fee to unlock the landlord's contact details.</div>
                        </div>
                      </div>
                      <button className="reveal-btn" style={{ width:"100%", justifyContent:"center", borderColor:"rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.8)" }} onClick={handleRevealContact}>
                        {ICONS.lock} Reveal contact info
                      </button>
                      {contactError && (
                        <p style={{ fontSize:12.5, color:"#ff8080", marginTop:8, textAlign:"center" }}>{contactError}</p>
                      )}
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      {contact.email && (
                        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{ICONS.email} Email</span>
                          <span style={{ fontSize:15, fontWeight:500, color:"#fff" }}>{contact.email}</span>
                        </div>
                      )}
                      {contact.contactNumber && (
                        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{ICONS.phone} Phone</span>
                          <span style={{ fontSize:15, fontWeight:500, color:"#fff" }}>{contact.contactNumber}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}