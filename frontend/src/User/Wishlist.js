import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TenantHeader from "../header/tenant_header";

const styles = {
  root: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#fff",
    minHeight: "100vh",
    color: "#222",
    paddingBottom: 80,
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "40px",
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "#222",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#717171",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 24,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    background: "#fff",
    border: "1px solid #f0f0f0",
  },
  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },
  cardImageWrap: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: "1 / 1",
    background: "#f0f0f0",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  cardHeart: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "#fff",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    transition: "all 0.2s",
  },
  cardBody: {
    padding: "12px",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#222",
    marginBottom: 6,
    lineHeight: 1.3,
  },
  cardSub: {
    fontSize: 13,
    color: "#717171",
    marginBottom: 8,
  },
  cardPrice: {
    fontSize: 15,
    color: "#222",
    fontWeight: 700,
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 0",
    color: "#717171",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 600,
    color: "#222",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#717171",
    marginBottom: 20,
  },
  browseBtn: {
    background: "#FF385C",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    borderRadius: 8,
    transition: "all 0.2s",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
};

const HeartIcon = ({ filled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#FF385C" : "none"} stroke={filled ? "#FF385C" : "#717171"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch wishlist from backend
    fetch("http://localhost:5000/api/tenant/wishlist", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setWishlist(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        setWishlist([]);
        setLoading(false);
      });
  }, [navigate]);

  const handleRemoveFromWishlist = async (apartmentId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;

    setRemoving(apartmentId);
    try {
      const res = await fetch("http://localhost:5000/api/tenant/wishlist/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apartmentId }),
      });

      if (res.ok) {
        setWishlist((prev) => prev.filter((apt) => apt._id !== apartmentId));
      }
    } catch (err) {
      console.error(err);
    }
    setRemoving(null);
  };

  const handleCardClick = (apartment) => {
    navigate(`/apartment/${apartment._id}`, { state: { apartment } });
  };

  const buildLocationLine = (apt) => {
    const parts = [];
    if (apt.buildingName) parts.push(apt.buildingName);
    if (apt.floor) parts.push(`Floor ${apt.floor}`);
    if (!parts.length && apt.unitNumber) parts.push(`Unit ${apt.unitNumber}`);
    return parts.join(" • ") || "Location details not available";
  };

  const buildSpecsLine = (apt) => {
    const parts = [];
    if (apt.unitType) parts.push(apt.unitType);
    if (apt.bedrooms !== undefined && apt.bedrooms !== null) parts.push(`${apt.bedrooms} bed`);
    if (apt.bathrooms !== undefined && apt.bathrooms !== null) parts.push(`${apt.bathrooms} bath`);
    return parts.join(" • ") || "Property details not available";
  };

  if (loading) {
    return (
      <div style={styles.root}>
        <TenantHeader />
        <div style={styles.container}>
          <div style={styles.emptyState}>
            <div style={styles.emptyText}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div style={styles.root}>
        <TenantHeader />
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Your Wishlist</h1>
            <p style={styles.subtitle}>Save your favorite apartments to view them later</p>
          </div>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>♥</div>
            <div style={styles.emptyText}>No items in wishlist</div>
            <div style={styles.emptySubText}>Start adding apartments to your wishlist by clicking the heart icon</div>
            <button
              onClick={() => navigate("/")}
              style={styles.browseBtn}
              onMouseEnter={(e) => (e.target.style.background = "#dc3545")}
              onMouseLeave={(e) => (e.target.style.background = "#FF385C")}
            >
              Browse Apartments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <TenantHeader />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Your Wishlist</h1>
          <p style={styles.subtitle}>{wishlist.length} apartment{wishlist.length !== 1 ? "s" : ""} saved</p>
        </div>

        <div style={styles.grid}>
          {wishlist.map((apt) => (
            <div
              key={apt._id}
              style={styles.card}
              onClick={() => handleCardClick(apt)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = styles.cardHover.transform;
                e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={styles.cardImageWrap}>
                <img
                  src={apt.photos?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop"}
                  alt={apt.title || apt.unitType}
                  style={styles.cardImage}
                />
                <button
                  style={styles.cardHeart}
                  onClick={(e) => handleRemoveFromWishlist(apt._id, e)}
                  disabled={removing === apt._id}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
                  }}
                >
                  <HeartIcon filled={true} />
                </button>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.cardTitle}>{apt.title || apt.unitType || "Apartment"}</div>
                <div style={styles.cardSub}>{buildLocationLine(apt)}</div>
                <div style={styles.cardSub}>{buildSpecsLine(apt)}</div>
                <div style={styles.cardPrice}>
                  ₱{apt.price?.toLocaleString() ?? "N/A"}
                  <span style={{ color: "#717171", fontWeight: 400, fontSize: 13 }}> / month</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
