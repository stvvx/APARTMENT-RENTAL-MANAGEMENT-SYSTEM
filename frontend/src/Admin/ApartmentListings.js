import React, { useState, useEffect, useCallback } from "react";
import AdminHeader from "../header/admin_header";

// Google Fonts
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap";
document.head.appendChild(fontLink);

// ── GLOBAL CSS INJECTION ─────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("admin-apartment-styles")) return;
  const style = document.createElement("style");
  style.id = "admin-apartment-styles";
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --coral: #FF385C;
      --coral-dark: #D90B3C;
      --ink: #1a1a1a;
      --ink-muted: #6b6b6b;
      --border: #e8e8e8;
      --surface: #f9f9f9;
      --white: #ffffff;
      --radius-card: 20px;
      --radius-chip: 999px;
      --shadow-card: 0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04);
      --shadow-card-hover: 0 8px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
      --font-display: 'Sora', sans-serif;
      --font-body: 'DM Sans', sans-serif;
      --transition: 0.25s cubic-bezier(0.4,0,0.2,1);
    }

    body { font-family: var(--font-body); }

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

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .card-animate {
      animation: fadeUp 0.45s cubic-bezier(0.4,0,0.2,1) both;
    }

    @keyframes shimmer {
      0% { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
      border-radius: 12px;
    }
  `;
  document.head.appendChild(style);
};
injectStyles();

const FALLBACK_IMG = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80";

export default function ApartmentListings() {
  const [apartments, setApartments] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");

  const formatLocation = useCallback((loc) => {
    if (!loc) return "";
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object') {
      const parts = [loc.street, loc.barangay, loc.city]
        .map((p) => String(p || '').trim())
        .filter(Boolean);
      return parts.length ? parts.join(', ') : '';
    }
    return String(loc);
  }, []);

  const fetchApartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/apartments", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch apartments: ${response.statusText}`);
      }

      const data = await response.json();
      setApartments(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching apartments:", err);
      setError(err.message);
      setApartments([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const filterAndSortApartments = useCallback(() => {
    let result = [...apartments];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((apt) => {
        const name = String(apt.name || "").toLowerCase();
        const loc = formatLocation(apt.location).toLowerCase();
        const district = String(apt.district || "").toLowerCase();
        return name.includes(term) || loc.includes(term) || district.includes(term);
      });
    }

    // Sort
    switch (sortBy) {
      case "name":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "price-low":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "latest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredApartments(result);
    setCurrentPage(1);
  }, [apartments, searchTerm, sortBy, formatLocation]);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  useEffect(() => {
    filterAndSortApartments();
  }, [filterAndSortApartments]);

  // Format helpers
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }, []);

  // Pagination
  const itemsPerPageValue = 12;
  const indexOfLastItem = currentPage * itemsPerPageValue;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageValue;
  const currentApartments = filteredApartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApartments.length / itemsPerPageValue);

  // Skeleton Card
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

  // Apartment Card
  function ApartmentCard({ apt, index }) {
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
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            aspectRatio: "1 / 1",
            background: "#f0f0f0",
          }}
        >
          <img
            src={apt.photos?.[0] || FALLBACK_IMG}
            alt={apt.name || apt.unitType}
            className="card-img"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading="lazy"
          />

          {/* Badge */}
          {(isGuestFav || isNew) && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "#fff",
                borderRadius: 8,
                padding: "5px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "var(--font-display)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
                letterSpacing: "-0.1px",
              }}
            >
              {isNew ? "✨ New" : "⭐ Featured"}
            </div>
          )}

          {/* Status Badge */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              background: apt.isAvailable ? "#d4f5e8" : "#fde2e4",
              color: apt.isAvailable ? "#047857" : "#d91c1c",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
            }}
          >
            {apt.isAvailable ? "Available" : "Booked"}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "16px 12px" }}>
          {/* Name */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#1a1a1a",
              fontFamily: "var(--font-display)",
              marginBottom: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {apt.name}
          </div>

          {/* Location */}
          <div
            style={{
              fontSize: 13,
              color: "#6b6b6b",
              marginBottom: 10,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {formatLocation(apt.location) || apt.district}
          </div>

          {/* Specs */}
          <div
            style={{
              fontSize: 12,
              color: "#6b6b6b",
              marginBottom: 10,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {apt.bedrooms > 0 && <span>{apt.bedrooms} bed</span>}
            {apt.bathrooms > 0 && <span>•</span>}
            {apt.bathrooms > 0 && <span>{apt.bathrooms} bath</span>}
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#FF385C",
              fontFamily: "var(--font-display)",
              marginBottom: 8,
            }}
          >
            {formatPrice(apt.price)}
          </div>

          {/* Landlord */}
          <div
            style={{
              fontSize: 12,
              color: "#6b6b6b",
              paddingTop: 8,
              borderTop: "1px solid #e8e8e8",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            By: {apt.landlord?.name || "Unknown Landlord"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      <AdminHeader />
      <div style={{ padding: "40px 24px", maxWidth: "1600px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#1a1a1a",
              margin: "0 0 8px 0",
              fontFamily: "var(--font-display)",
            }}
          >
            All Apartment Listings
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#6b6b6b",
              margin: 0,
              fontWeight: 400,
            }}
          >
            View-only access. {filteredApartments.length} apartment
            {filteredApartments.length !== 1 ? "s" : ""} found.
          </p>
        </div>

        {/* Search & Filter */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 30,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search by name, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: 250,
              padding: "12px 16px",
              border: "1px solid #e8e8e8",
              borderRadius: 32,
              fontSize: 14,
              fontFamily: "var(--font-body)",
              outline: "none",
              transition: "var(--transition)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#FF385C";
              e.target.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e8e8e8";
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "12px 16px",
              border: "1px solid #e8e8e8",
              borderRadius: 32,
              fontSize: 14,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              outline: "none",
              transition: "var(--transition)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              background: "#fff",
              color: "#1a1a1a",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#FF385C";
              e.target.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e8e8e8";
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
            }}
          >
            <option value="name">Name ↑</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="latest">Latest Added</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            style={{
              background: "#fde2e4",
              color: "#d91c1c",
              padding: 20,
              borderRadius: 12,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            ⚠️ Error: {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredApartments.length === 0 && !error && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "#6b6b6b",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏠</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#1a1a1a",
                marginBottom: 8,
                fontFamily: "var(--font-display)",
              }}
            >
              No apartments found
            </div>
            <div style={{ fontSize: 14 }}>
              Try adjusting your search or filters
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && currentApartments.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 24,
              marginBottom: 30,
            }}
          >
            {currentApartments.map((apt, idx) => (
              <ApartmentCard key={apt._id} apt={apt} index={idx} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              alignItems: "center",
              marginTop: 40,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "10px 16px",
                border: "1px solid #e8e8e8",
                borderRadius: 8,
                background: currentPage === 1 ? "#f9f9f9" : "#fff",
                color: currentPage === 1 ? "#ccc" : "#1a1a1a",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
                transition: "var(--transition)",
                fontFamily: "var(--font-body)",
              }}
            >
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: "10px 12px",
                  minWidth: 40,
                  border: currentPage === page ? "1px solid #FF385C" : "1px solid #e8e8e8",
                  borderRadius: 8,
                  background: currentPage === page ? "#FF385C" : "#fff",
                  color: currentPage === page ? "#fff" : "#1a1a1a",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "var(--transition)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "10px 16px",
                border: "1px solid #e8e8e8",
                borderRadius: 8,
                background: currentPage === totalPages ? "#f9f9f9" : "#fff",
                color: currentPage === totalPages ? "#ccc" : "#1a1a1a",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
                transition: "var(--transition)",
                fontFamily: "var(--font-body)",
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Results Info */}
        {!loading && filteredApartments.length > 0 && (
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "#6b6b6b",
              marginTop: 20,
            }}
          >
            Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredApartments.length)} of{" "}
            {filteredApartments.length} apartment
            {filteredApartments.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
