import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
} from "@mui/material";
import TenantHeader from "./header/tenant_header";
import { useNavigate } from "react-router-dom";

// Google Fonts
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap";
document.head.appendChild(fontLink);

const API_URL = "http://localhost:5000/api/apartments/tenant";

// ── GLOBAL CSS INJECTION ─────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("tenant-home-styles")) return;
  const style = document.createElement("style");
  style.id = "tenant-home-styles";
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --coral: #FF385C;
      --coral-dark: #D90B3C;
      --coral-light: #fff0f2;
      --ink: #1a1a1a;
      --ink-muted: #6b6b6b;
      --border: #e8e8e8;
      --surface: #f9f9f9;
      --white: #ffffff;
      --radius-card: 20px;
      --radius-chip: 999px;
      --shadow-card: 0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04);
      --shadow-card-hover: 0 8px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
      --shadow-search: 0 4px 20px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06);
      --font-display: 'Sora', sans-serif;
      --font-body: 'DM Sans', sans-serif;
      --transition: 0.25s cubic-bezier(0.4,0,0.2,1);
    }

    body { font-family: var(--font-body); }

    /* ── SCROLLBAR ── */
    .filter-scroll::-webkit-scrollbar { display: none; }
    .filter-scroll { scrollbar-width: none; }

    /* ── CARD HOVER ── */
    .apt-card {
      transition: transform var(--transition), box-shadow var(--transition);
    }
    .apt-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-card-hover);
    }
    .apt-card:hover .card-img {
      transform: scale(1.06);
    }
    .card-img {
      transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
    }

    /* ── HEART BTN ── */
    .heart-btn {
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
    }
    .heart-btn:hover {
      transform: scale(1.18);
    }
    .heart-btn:active {
      transform: scale(0.92);
    }

    /* ── FILTER CHIP ── */
    .filter-chip {
      transition: all var(--transition);
      position: relative;
      overflow: hidden;
    }
    .filter-chip::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.05);
      opacity: 0;
      transition: opacity 0.15s;
    }
    .filter-chip:hover::after { opacity: 1; }
    .filter-chip:active { transform: scale(0.96); }

    /* ── SEARCH BAR ── */
    .search-bar {
      transition: box-shadow var(--transition);
    }
    .search-bar:hover {
      box-shadow: 0 6px 24px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08) !important;
    }
    .search-field:hover {
      background: var(--surface);
    }
    .search-field:focus-within {
      background: var(--surface);
    }
    .search-field { transition: background var(--transition); border-radius: var(--radius-chip); }

    /* ── APPLY BTN ── */
    .apply-btn {
      transition: all var(--transition);
    }
    .apply-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #e3195e 0%, #c5103f 100%) !important;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(255,56,92,0.35);
    }
    .apply-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    /* ── CLOSE BTN ── */
    .close-btn {
      transition: all var(--transition);
    }
    .close-btn:hover {
      background: var(--surface) !important;
    }

    /* ── CARD FADE IN ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .card-animate {
      animation: fadeUp 0.45s cubic-bezier(0.4,0,0.2,1) both;
    }

    /* ── DIALOG ── */
    .MuiDialog-paper {
      font-family: var(--font-body) !important;
    }

    /* ── CATEGORY ICONS ── */
    .category-btn {
      transition: all var(--transition);
      position: relative;
    }
    .category-btn::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%) scaleX(0);
      width: 24px;
      height: 2px;
      background: var(--ink);
      border-radius: 999px;
      transition: transform var(--transition);
    }
    .category-btn.active::after {
      transform: translateX(-50%) scaleX(1);
    }
    .category-btn:hover { color: var(--ink) !important; }
    .category-btn:hover svg path, .category-btn:hover svg circle, .category-btn:hover svg rect {
      stroke: var(--ink);
    }

    /* ── DIVIDER SEPARATOR ── */
    .search-divider {
      width: 1px;
      height: 32px;
      background: var(--border);
      flex-shrink: 0;
    }

    /* ── PRICE BADGE ── */
    .price-badge {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    /* ── MODAL PHOTO STRIP ── */
    .photo-strip {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 2px;
    }
    .photo-strip::-webkit-scrollbar { display: none; }

    /* ── SKELETON LOADING ── */
    @keyframes shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
      border-radius: 12px;
    }

    /* ── SECTION FADE ── */
    @keyframes sectionFade {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .section-enter { animation: sectionFade 0.4s ease both; }
  `;
  document.head.appendChild(style);
};
injectStyles();

// ── ICONS ──────────────────────────────────────────────────────────────────
const Logo = () => (
  <svg width="30" height="32" viewBox="0 0 30 32" fill="none">
    <path d="M15 0C10.5 8.5 3 12.5 3 20a12 12 0 0 0 24 0C27 12.5 19.5 8.5 15 0z" fill="#FF385C"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const StarIcon = ({ size = 12, color = "#1a1a1a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24"
    fill={filled ? "#FF385C" : "rgba(0,0,0,0.001)"}
    stroke={filled ? "#FF385C" : "#fff"}
    strokeWidth="2"
    style={{ filter: filled ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);

// Category SVG icons
const CATEGORY_ICONS = {
  All: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  Studio: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 10h18M7 7V5a2 2 0 014 0v2"/></svg>,
  "1BR": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21V5a2 2 0 012-2h14a2 2 0 012 2v16"/><path d="M3 21h18M9 21V9h6v12"/></svg>,
  "2BR": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 20V8l10-5 10 5v12"/><path d="M6 20v-8h4v8M14 20v-8h4v8"/></svg>,
  "3BR": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 20V9l11-6 11 6v11"/><path d="M4 20v-9h3v9M10.5 20v-9h3v9M17 20v-9h3v9"/></svg>,
};

const UNIT_TYPES = ["All", "Studio", "1BR", "2BR", "3BR"];
const PRICE_FILTERS = [
  { label: "Under ₱10k", min: 0, max: 10000 },
  { label: "₱10k–₱20k", min: 10000, max: 20000 },
  { label: "₱20k–₱30k", min: 20000, max: 30000 },
  { label: "₱30k+", min: 30000, max: Infinity },
];

const FALLBACK_IMG = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80";

// ── SKELETON CARD ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 20, overflow: "hidden" }}>
      <div className="skeleton" style={{ aspectRatio: "1/1", width: "100%", borderRadius: 16 }} />
      <div style={{ padding: "12px 4px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 14, width: "70%", borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 12, width: "50%", borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 14, width: "35%", borderRadius: 6 }} />
      </div>
    </div>
  );
}

// ── APARTMENT CARD ──────────────────────────────────────────────────────────
function ApartmentCard({ apt, onClick, saved, onToggleSave, index }) {
  const rating = (4.75 + (apt._id?.charCodeAt(0) % 25) / 100).toFixed(2);
  const isGuestFav = (apt._id?.charCodeAt(2) || 0) % 3 !== 0;
  const isNew = (apt._id?.charCodeAt(3) || 0) % 5 === 0;

  return (
    <div
      className="apt-card card-animate"
      style={{
        borderRadius: 20,
        cursor: "pointer",
        background: "#fff",
        animationDelay: `${Math.min(index * 0.06, 0.5)}s`,
      }}
      onClick={onClick}
    >
      {/* Image */}
      <div style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        aspectRatio: "1 / 1",
        background: "#f0f0f0",
      }}>
        <img
          src={apt.photos?.[0] || FALLBACK_IMG}
          alt={apt.title || apt.unitType}
          className="card-img"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          loading="lazy"
        />

        {/* Badge */}
        {(isGuestFav || isNew) && (
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: "#fff",
            borderRadius: 8,
            padding: "5px 10px",
            fontSize: 11,
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "var(--font-display)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
            letterSpacing: "-0.1px",
          }}>
            {isNew ? "✨ New" : "Guest favourite"}
          </div>
        )}

        {/* Heart */}
        <button
          className="heart-btn"
          style={{
            position: "absolute", top: 12, right: 12,
            background: "none", border: "none",
            cursor: "pointer", padding: 4,
            display: "flex", alignItems: "center",
          }}
          onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
        >
          <HeartIcon filled={saved} />
        </button>

        {/* Photo dots if multiple */}
        {apt.photos?.length > 1 && (
          <div style={{
            position: "absolute", bottom: 10,
            left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 4,
          }}>
            {apt.photos.slice(0, 5).map((_, i) => (
              <div key={i} style={{
                width: i === 0 ? 16 : 6, height: 6,
                borderRadius: 999,
                background: i === 0 ? "#fff" : "rgba(255,255,255,0.55)",
                transition: "width 0.2s",
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "13px 2px 6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{
            fontSize: 14.5,
            fontWeight: 600,
            color: "#1a1a1a",
            fontFamily: "var(--font-display)",
            lineHeight: 1.35,
            flex: 1,
            letterSpacing: "-0.2px",
          }}>
            {apt.title || apt.unitType || "Apartment"}
            {apt.buildingName ? <span style={{ fontWeight: 400, color: "#6b6b6b" }}>{" · "}{apt.buildingName}</span> : null}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 3,
            fontSize: 13.5, fontWeight: 500, color: "#1a1a1a",
            flexShrink: 0, paddingTop: 1,
          }}>
            <StarIcon size={12} />
            <span>{rating}</span>
          </div>
        </div>

        <div style={{ fontSize: 13.5, color: "#6b6b6b", marginTop: 3, lineHeight: 1.4 }}>
          {apt.floor ? `Floor ${apt.floor}` : apt.location || "Available now"}
        </div>
        <div style={{ fontSize: 13.5, color: "#6b6b6b", marginTop: 1 }}>
          {[apt.unitType, apt.bedrooms && `${apt.bedrooms} bed`, apt.bathrooms && `${apt.bathrooms} bath`]
            .filter(Boolean).join(" · ")}
        </div>

        <div style={{ marginTop: 8, fontSize: 14.5 }}>
          <span style={{ fontWeight: 700, color: "#1a1a1a", fontFamily: "var(--font-display)" }}>
            ₱{apt.price?.toLocaleString() ?? "N/A"}
          </span>
          <span style={{ color: "#6b6b6b", fontWeight: 400 }}> / month</span>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [idFile, setIdFile] = useState(null);
  const [incomeFile, setIncomeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userApplications, setUserApplications] = useState([]);
  const [showApprovalAlert, setShowApprovalAlert] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [activeUnitType, setActiveUnitType] = useState("All");
  const [activePriceFilter, setActivePriceFilter] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [profileIdentity, setProfileIdentity] = useState({ name: "", email: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((r) => r.json())
      .then((d) => { setApartments(Array.isArray(d) ? d : d.apartments || []); })
      .catch(() => setApartments([]))
      .finally(() => setLoading(false));

    const token = localStorage.getItem("token");
    if (token) {
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      setProfileIdentity({ name: localUser?.name || "", email: localUser?.email || "" });

      fetch("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((u) => {
          const p = { name: u?.name || localUser?.name || "", email: u?.email || localUser?.email || "" };
          setProfileIdentity(p); setName(p.name); setEmail(p.email);
          localStorage.setItem("user", JSON.stringify({ ...localUser, ...u }));
        }).catch(() => {});

      fetch("http://localhost:5000/api/applications/mine", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => {
          const apps = Array.isArray(d) ? d : d.applications || [];
          setUserApplications(apps);
          if (apps.find((a) => a.status === "approved")) setShowApprovalAlert(true);
        }).catch(() => {});

      fetch("http://localhost:5000/api/tenant/wishlist", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setSavedIds(new Set((Array.isArray(d) ? d : []).map((a) => a._id))))
        .catch(() => {});
    }
  }, []);

  const uploadToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET_NAME);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
    return (await res.json()).secure_url;
  };

  const applyApartment = async () => {
    if (!name || !email) return alert("Please enter your name and email");
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setSubmitting(true);
    try {
      let idUrl = idFile ? await uploadToCloudinary(idFile) : "";
      let incomeUrl = incomeFile ? await uploadToCloudinary(incomeFile) : "";
      const documents = [idUrl, incomeUrl].filter(Boolean);
      if (!documents.length) { alert("Please upload required documents."); setSubmitting(false); return; }
      const res = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, message, apartmentId: selected._id, documents }),
      });
      if (!res.ok) throw new Error("Failed to submit application");
      const result = await res.json();
      if (result.status === "approved") { setShowApprovalAlert(true); navigate("/payments"); }
      else { alert("Application submitted! Track your status in the Applications tab."); closeModal(); }
    } catch (err) { alert(err.message); }
    setSubmitting(false);
  };

  const openModal = (apt) => {
    setSelected(apt);
    setModalPhotoIndex(0);
    setName(profileIdentity.name || "");
    setEmail(profileIdentity.email || "");
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false); setSelected(null);
    setModalPhotoIndex(0);
    setName(profileIdentity.name || ""); setEmail(profileIdentity.email || "");
    setMessage(""); setIdFile(null); setIncomeFile(null);
  };

  const modalPhotos = selected?.photos?.length ? selected.photos : [FALLBACK_IMG];
  const goToPrevModalPhoto = () => {
    setModalPhotoIndex((prev) => (prev - 1 + modalPhotos.length) % modalPhotos.length);
  };
  const goToNextModalPhoto = () => {
    setModalPhotoIndex((prev) => (prev + 1) % modalPhotos.length);
  };

  const toggleSave = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Please login to save apartments to your wishlist"); navigate("/login"); return; }
    const isSaved = savedIds.has(id);
    try {
      const res = await fetch(`http://localhost:5000/api/tenant/wishlist/${isSaved ? "remove" : "add"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ apartmentId: id }),
      });
      if (res.ok) setSavedIds((prev) => { const s = new Set(prev); isSaved ? s.delete(id) : s.add(id); return s; });
    } catch (err) { console.error(err); }
  };

  const handleSearch = () => setSearchQuery(searchInput.trim().toLowerCase());

  const existingApp = selected && userApplications.find(
    (app) => app.apartment?._id === selected._id && ["pending", "approved", "rejected"].includes(app.status)
  );

  const filteredApartments = apartments.filter((apt) => {
    const unitOk = activeUnitType === "All" || (apt.unitType || "").toLowerCase().includes(activeUnitType.toLowerCase());
    const priceOk = !activePriceFilter || (apt.price >= activePriceFilter.min && apt.price < activePriceFilter.max);
    const searchOk = !searchQuery || [apt.title, apt.buildingName, apt.unitType, apt.unitNumber, apt.location, apt.floor ? `floor ${apt.floor}` : ""]
      .filter(Boolean).join(" ").toLowerCase().includes(searchQuery);
    return unitOk && priceOk && searchOk;
  });

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "#fff", minHeight: "100vh", color: "#1a1a1a" }}>
      <TenantHeader />

      {/* ── HERO SEARCH ── */}
      <div style={{
        background: "linear-gradient(180deg, #fff5f6 0%, #fff 100%)",
        padding: "36px 40px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}>
        {/* Tagline */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            fontWeight: 800,
            color: "#1a1a1a",
            letterSpacing: "-0.8px",
            lineHeight: 1.2,
            marginBottom: 6,
          }}>
            Find your next home
          </h1>
          <p style={{ fontSize: 15, color: "#6b6b6b", fontWeight: 400 }}>
            Discover apartments that feel like they were made for you
          </p>
        </div>

        {/* Search Bar */}
        <div
          className="search-bar"
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #ddd",
            borderRadius: 999,
            boxShadow: "var(--shadow-search)",
            background: "#fff",
            width: "100%",
            maxWidth: 780,
            padding: "6px",
          }}
        >
          <input
            type="text"
            placeholder="Search locations, buildings, unit types..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              width: "100%",
              padding: "12px 18px",
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "#1a1a1a",
              fontWeight: 400,
            }}
          />

          {/* Search button */}
          <div style={{ padding: 0 }}>
            <button
              onClick={handleSearch}
              style={{
                background: "linear-gradient(135deg, #FF385C 0%, #e0174f 100%)",
                border: "none", borderRadius: 999,
                width: 48, height: 48,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255,56,92,0.4)",
                transition: "all 0.2s",
              }}
            >
              <SearchIcon />
            </button>
          </div>
        </div>
      </div>

      {/* ── CATEGORY + FILTER ROW ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#fff",
        borderBottom: "1px solid var(--border)",
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        {/* Categories */}
        <div className="filter-scroll" style={{ display: "flex", gap: 0, overflowX: "auto", flex: 1 }}>
          {UNIT_TYPES.map((u) => (
            <button
              key={u}
              className={`category-btn ${activeUnitType === u ? "active" : ""}`}
              onClick={() => setActiveUnitType(u)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "14px 20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: 11.5,
                fontWeight: activeUnitType === u ? 700 : 500,
                color: activeUnitType === u ? "#1a1a1a" : "#6b6b6b",
                whiteSpace: "nowrap",
                letterSpacing: "0.1px",
              }}
            >
              <span style={{ opacity: activeUnitType === u ? 1 : 0.5, transition: "opacity 0.2s" }}>
                {CATEGORY_ICONS[u]}
              </span>
              {u === "All" ? "All homes" : u}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="search-divider" />

        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 16px",
            border: "1px solid #ddd",
            borderRadius: 12,
            background: showFilters ? "#1a1a1a" : "#fff",
            color: showFilters ? "#fff" : "#1a1a1a",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "all 0.2s",
          }}
        >
          <FilterIcon />
          Filters
          {activePriceFilter && (
            <span style={{
              background: showFilters ? "#fff" : "#1a1a1a",
              color: showFilters ? "#1a1a1a" : "#fff",
              borderRadius: 999,
              width: 18, height: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700,
            }}>1</span>
          )}
        </button>
      </div>

      {/* ── PRICE FILTER DROPDOWN ── */}
      {showFilters && (
        <div className="section-enter" style={{
          padding: "16px 40px",
          borderBottom: "1px solid var(--border)",
          background: "#fafafa",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.5px", marginRight: 4 }}>
            Price
          </span>
          {PRICE_FILTERS.map((p) => {
            const active = activePriceFilter?.label === p.label;
            return (
              <button
                key={p.label}
                className="filter-chip"
                onClick={() => setActivePriceFilter(active ? null : p)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: active ? "1.5px solid #1a1a1a" : "1px solid #ddd",
                  background: active ? "#1a1a1a" : "#fff",
                  color: active ? "#fff" : "#1a1a1a",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                {p.label}
              </button>
            );
          })}
          {activePriceFilter && (
            <button
              onClick={() => setActivePriceFilter(null)}
              style={{
                fontSize: 13, color: "#FF385C", fontWeight: 600,
                background: "none", border: "none", cursor: "pointer",
                textDecoration: "underline", fontFamily: "var(--font-body)",
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── RESULTS HEADER ── */}
      <div style={{ padding: "24px 40px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "-0.3px",
          }}>
            {loading ? "Finding homes…" : `${filteredApartments.length} home${filteredApartments.length !== 1 ? "s" : ""} available`}
          </h2>
          {(searchQuery || activePriceFilter || activeUnitType !== "All") && !loading && (
            <p style={{ fontSize: 13, color: "#6b6b6b", marginTop: 3 }}>
              {[
                searchQuery && `"${searchQuery}"`,
                activeUnitType !== "All" && activeUnitType,
                activePriceFilter?.label,
              ].filter(Boolean).join(" · ")}
              {" · "}
              <button
                onClick={() => { setSearchQuery(""); setSearchInput(""); setActivePriceFilter(null); setActiveUnitType("All"); }}
                style={{ color: "#FF385C", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, textDecoration: "underline" }}
              >
                Clear all
              </button>
            </p>
          )}
        </div>
        <button style={{
          fontSize: 13.5, fontWeight: 600, color: "#1a1a1a",
          background: "none", border: "none", cursor: "pointer",
          textDecoration: "underline", fontFamily: "var(--font-body)",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          🗺 Show map
        </button>
      </div>

      {/* ── GRID ── */}
      <div style={{ padding: "20px 40px 60px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
          gap: 28,
        }}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredApartments.length === 0 ? (
            <div style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "80px 0",
              color: "#6b6b6b",
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🏠</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 8, letterSpacing: "-0.3px" }}>
                No homes found
              </h3>
              <p style={{ fontSize: 15, maxWidth: 320, margin: "0 auto" }}>
                Try adjusting your filters or search terms to discover more listings.
              </p>
              <button
                onClick={() => { setSearchQuery(""); setSearchInput(""); setActivePriceFilter(null); setActiveUnitType("All"); }}
                style={{
                  marginTop: 24,
                  padding: "12px 28px",
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "var(--font-display)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredApartments.map((apt, i) => (
              <ApartmentCard
                key={apt._id || i}
                apt={apt}
                index={i}
                onClick={() => openModal(apt)}
                saved={savedIds.has(apt._id)}
                onToggleSave={() => toggleSave(apt._id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        borderTop: "1px solid var(--border)",
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        background: "#fafafa",
      }}>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Sitemap"].map((t) => (
            <button key={t} style={{ fontSize: 13, color: "#6b6b6b", fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "#6b6b6b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
          <Logo />
          <span>© 2025 EasRent. All rights reserved.</span>
        </div>
      </div>

      {/* ── APPLY MODAL ── */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 24,
            fontFamily: "var(--font-body)",
            padding: 0,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          }
        }}
      >
        <DialogContent style={{ padding: 0 }}>
          <div style={{ display: "flex", minHeight: "auto" }}>

            {/* LEFT: Info */}
            <div style={{
              width: "50%",
              padding: 28,
              background: "#fafafa",
              borderRight: "1px solid var(--border)",
              overflowY: "auto",
              maxHeight: "90vh",
              flexShrink: 0,
            }}>
              {selected && (
                <>
                  {/* Main photo */}
                  <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", marginBottom: 16, position: "relative", background: "#f0f0f0" }}>
                    <div
                      style={{
                        display: "flex",
                        height: "100%",
                        transform: `translateX(-${modalPhotoIndex * 100}%)`,
                        transition: "transform 0.35s ease",
                      }}
                    >
                      {modalPhotos.map((url, i) => (
                        <img
                          key={`${selected._id || "photo"}-${i}`}
                          src={url || FALLBACK_IMG}
                          alt={`${selected.title || selected.unitType || "Unit"} view ${i + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", flex: "0 0 100%" }}
                        />
                      ))}
                    </div>

                    {modalPhotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goToPrevModalPhoto}
                          style={{
                            position: "absolute",
                            left: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.6)",
                            background: "rgba(0,0,0,0.35)",
                            color: "#fff",
                            fontSize: 18,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          aria-label="Previous photo"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={goToNextModalPhoto}
                          style={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.6)",
                            background: "rgba(0,0,0,0.35)",
                            color: "#fff",
                            fontSize: 18,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          aria-label="Next photo"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {/* Photo strip */}
                  {modalPhotos.length > 1 && (
                    <div className="photo-strip" style={{ marginBottom: 16 }}>
                      {modalPhotos.map((url, i) => (
                        <button
                          key={`thumb-${i}`}
                          type="button"
                          onClick={() => setModalPhotoIndex(i)}
                          style={{
                            padding: 0,
                            border: i === modalPhotoIndex ? "2px solid #FF385C" : "2px solid transparent",
                            borderRadius: 10,
                            overflow: "hidden",
                            background: "none",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          aria-label={`Open photo ${i + 1}`}
                        >
                          <img src={url || FALLBACK_IMG} alt="" style={{ width: 72, height: 72, objectFit: "cover", display: "block" }} />
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#1a1a1a", marginBottom: 2, letterSpacing: "-0.3px" }}>
                    {selected.title || selected.unitType}
                  </div>
                  <div style={{ fontSize: 13.5, color: "#6b6b6b", marginBottom: 20 }}>
                    {[selected.buildingName, selected.floor && `Floor ${selected.floor}`].filter(Boolean).join(" · ")}
                  </div>

                  {/* Info rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {[
                      ["Unit Number", selected.unitNumber],
                      ["Area", selected.area ? `${selected.area} sqm` : null],
                      ["Unit Type", selected.unitType],
                      ["Bedrooms", selected.bedrooms],
                      ["Bathrooms", selected.bathrooms],
                      ["Furnishing", selected.furnishing],
                      ["Pet Policy", selected.petPolicy],
                      ["Deposit", selected.deposit ? `₱${selected.deposit.toLocaleString()}` : null],
                      ["Advance Payment", selected.advance ? `₱${selected.advance.toLocaleString()}` : null],
                      ["Min. Lease Term", selected.minLeaseTerm],
                      ["Available From", selected.availableFrom ? new Date(selected.availableFrom).toLocaleDateString() : null],
                      ["Amenities", selected.amenities?.join(", ")],
                      ["Utilities Included", selected.utilitiesIncluded?.join(", ")],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderBottom: "1px solid var(--border)",
                        gap: 12,
                      }}>
                        <span style={{ fontSize: 13.5, color: "#6b6b6b", fontWeight: 400 }}>{label}</span>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1a1a1a", textAlign: "right", maxWidth: "55%" }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div style={{
                    marginTop: 20,
                    padding: "16px 20px",
                    background: "#fff0f2",
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                  }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#1a1a1a" }}>
                      ₱{selected.price?.toLocaleString() ?? "N/A"}
                    </span>
                    <span style={{ fontSize: 14, color: "#6b6b6b" }}>/ month</span>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT: Application Form */}
            <div style={{ flex: 1, padding: 28, overflowY: "auto", maxHeight: "90vh" }}>
              {/* Close button */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                <button
                  onClick={closeModal}
                  style={{
                    width: 32, height: 32, borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "#fff", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: 18, color: "#1a1a1a",
                    lineHeight: 1,
                  }}
                >×</button>
              </div>

              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.3px", marginBottom: 4 }}>
                Request to apply
              </div>
              <div style={{ fontSize: 14, color: "#6b6b6b", marginBottom: 28 }}>
                Complete your rental application for this unit
              </div>

              {existingApp ? (
                <>
                  <div style={{
                    padding: "20px 24px",
                    borderRadius: 16,
                    background: existingApp.status === "approved" ? "#f0fdf4" : existingApp.status === "pending" ? "#fffbeb" : "#fef2f2",
                    border: `1.5px solid ${existingApp.status === "approved" ? "#86efac" : existingApp.status === "pending" ? "#fcd34d" : "#fca5a5"}`,
                    fontSize: 15, fontWeight: 600,
                    color: existingApp.status === "approved" ? "#15803d" : existingApp.status === "pending" ? "#d97706" : "#dc2626",
                    marginBottom: 20,
                    lineHeight: 1.5,
                  }}>
                    {existingApp.status === "pending" && "⏳ You have a pending application for this unit."}
                    {existingApp.status === "approved" && "✅ Your application has been approved!"}
                    {existingApp.status === "rejected" && "❌ Your application for this unit was rejected."}
                  </div>
                  <button className="close-btn" onClick={closeModal} style={{
                    width: "100%", padding: "14px", border: "1px solid var(--border)",
                    borderRadius: 14, background: "#fff", fontFamily: "var(--font-body)",
                    fontSize: 15, fontWeight: 600, cursor: "pointer", color: "#1a1a1a",
                  }}>Close</button>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Name */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 7, fontFamily: "var(--font-display)" }}>Full Name</label>
                    <input value={name} readOnly placeholder="Your full name" style={{ width: "100%", padding: "13px 16px", border: "1px solid var(--border)", borderRadius: 12, fontSize: 14.5, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box", background: "#f7f7f7", color: "#6b6b6b" }} />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 7, fontFamily: "var(--font-display)" }}>Email</label>
                    <input value={email} readOnly placeholder="your@email.com" type="email" style={{ width: "100%", padding: "13px 16px", border: "1px solid var(--border)", borderRadius: 12, fontSize: 14.5, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box", background: "#f7f7f7", color: "#6b6b6b" }} />
                  </div>

                  {/* Message */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 7, fontFamily: "var(--font-display)" }}>Message to Landlord</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell the landlord a bit about yourself…" rows={3} style={{ width: "100%", padding: "13px 16px", border: "1px solid var(--border)", borderRadius: 12, fontSize: 14.5, fontFamily: "var(--font-body)", outline: "none", resize: "vertical", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={(e) => e.target.style.borderColor = "#FF385C"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
                  </div>

                  {/* Gov ID */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 7, fontFamily: "var(--font-display)" }}>
                      Government ID <span style={{ color: "#FF385C" }}>*</span>
                    </label>
                    <label style={{
                      display: "block",
                      border: `2px dashed ${idFile ? "#FF385C" : "#ddd"}`,
                      borderRadius: 12, padding: "14px 16px",
                      textAlign: "center", cursor: "pointer",
                      background: idFile ? "#fff0f2" : "#fafafa",
                      fontSize: 13.5, color: idFile ? "#FF385C" : "#6b6b6b",
                      fontWeight: idFile ? 600 : 400,
                      transition: "all 0.2s",
                    }}>
                      {idFile ? `✓ ${idFile.name}` : "📎 Click to upload ID (image or PDF)"}
                      <input type="file" accept="image/*,.pdf" onChange={(e) => setIdFile(e.target.files[0])} style={{ display: "none" }} />
                    </label>
                  </div>

                  {/* Proof of Income */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 7, fontFamily: "var(--font-display)" }}>
                      Proof of Income <span style={{ color: "#FF385C" }}>*</span>
                    </label>
                    <label style={{
                      display: "block",
                      border: `2px dashed ${incomeFile ? "#FF385C" : "#ddd"}`,
                      borderRadius: 12, padding: "14px 16px",
                      textAlign: "center", cursor: "pointer",
                      background: incomeFile ? "#fff0f2" : "#fafafa",
                      fontSize: 13.5, color: incomeFile ? "#FF385C" : "#6b6b6b",
                      fontWeight: incomeFile ? 600 : 400,
                      transition: "all 0.2s",
                    }}>
                      {incomeFile ? `✓ ${incomeFile.name}` : "📎 Click to upload income proof (image or PDF)"}
                      <input type="file" accept="image/*,.pdf" onChange={(e) => setIncomeFile(e.target.files[0])} style={{ display: "none" }} />
                    </label>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />

                  {/* Submit */}
                  <button
                    className="apply-btn"
                    onClick={applyApartment}
                    disabled={submitting}
                    style={{
                      background: "linear-gradient(135deg, #FF385C 0%, #e0174f 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 14,
                      padding: "15px 28px",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: submitting ? "not-allowed" : "pointer",
                      fontFamily: "var(--font-display)",
                      width: "100%",
                      opacity: submitting ? 0.75 : 1,
                      letterSpacing: "-0.1px",
                    }}
                  >
                    {submitting ? "Submitting…" : "Apply for This Unit →"}
                  </button>

                  <p style={{ fontSize: 12, color: "#6b6b6b", textAlign: "center", lineHeight: 1.5 }}>
                    By applying, you agree to our Terms of Service. Your information is kept private and secure.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── APPROVAL SNACKBAR ── */}
      <Snackbar
        open={showApprovalAlert}
        autoHideDuration={6000}
        onClose={() => setShowApprovalAlert(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowApprovalAlert(false)}
          severity="success"
          sx={{
            width: "100%",
            fontFamily: "var(--font-body)",
            borderRadius: "14px !important",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          🎉 Your application has been approved! Head to Payments to complete the process.
        </Alert>
      </Snackbar>
    </div>
  );
}