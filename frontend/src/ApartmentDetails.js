import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button, CircularProgress } from "@mui/material";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;500;600;700&display=swap";
document.head.appendChild(fontLink);

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

  // Reservation status for this apartment (server-truth)
  const [reservationPaid, setReservationPaid] = useState(false);
  const [reservationStatusLoading, setReservationStatusLoading] = useState(false);

  // Landlord approval gate: tenant must have an APPROVED application before they can reserve
  const [applicationApproved, setApplicationApproved] = useState(false);
  const [applicationStatusLoading, setApplicationStatusLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchApartment() {
      if (routedApartment) {
        setApartment(routedApartment);
      } else {
        setLoading(true);
      }

      try {
        const res = await fetch(`http://localhost:5000/api/apartments/${id}`);
        const data = await res.json();
        if (!res.ok || !data?._id) {
          if (!routedApartment) {
            setApartment(null);
          }
        } else {
          setApartment(data);
        }
      } catch {
        if (!routedApartment) {
          setApartment(null);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchApartment();
  }, [id, routedApartment]);

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [id, apartment?._id]);

  const styles = {
    container: {
      background: "#fff",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      padding: "20px 40px",
      borderBottom: "1px solid #eee",
      display: "flex",
      alignItems: "center",
      gap: 16,
    },
    backBtn: {
      background: "none",
      border: "1px solid #ddd",
      padding: "10px 16px",
      borderRadius: 12,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 600,
      color: "#222",
      transition: "all 0.2s",
    },
    content: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "40px",
    },
    imageGallery: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 40,
    },
    mainPhotoWrap: {
      borderRadius: 16,
      overflow: "hidden",
      background: "#f3f3f3",
      aspectRatio: "16 / 9",
    },
    mainImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },
    thumbRail: {
      display: "flex",
      gap: 10,
      overflowX: "auto",
      paddingBottom: 2,
    },
    thumbButton: {
      borderRadius: 10,
      overflow: "hidden",
      border: "2px solid transparent",
      padding: 0,
      background: "none",
      cursor: "pointer",
      flexShrink: 0,
      width: 110,
      height: 76,
    },
    activeThumbButton: {
      border: "2px solid #FF385C",
    },
    thumbImage: {
      width: "110px",
      height: "76px",
      objectFit: "cover",
      display: "block",
    },
    titleSection: {
      marginBottom: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: 700,
      color: "#222",
      marginBottom: 12,
      letterSpacing: "-0.5px",
    },
    subtitle: {
      fontSize: 16,
      color: "#717171",
      marginBottom: 20,
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: 40,
      marginBottom: 40,
    },
    infoCard: {
      background: "#f9f9f9",
      padding: 32,
      borderRadius: 16,
      border: "1px solid #f0f0f0",
    },
    section: {
      marginBottom: 32,
      paddingBottom: 32,
      borderBottom: "1px solid #ebebeb",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: "#222",
      marginBottom: 16,
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20,
      marginBottom: 20,
    },
    infoItem: {
      display: "flex",
      flexDirection: "column",
    },
    infoLabel: {
      fontSize: 12,
      fontWeight: 700,
      color: "#717171",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: 6,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: 600,
      color: "#222",
    },
    priceCard: {
      background: "#fff",
      padding: 32,
      borderRadius: 16,
      border: "1px solid #f0f0f0",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      position: "sticky",
      top: 20,
    },
    price: {
      fontSize: 36,
      fontWeight: 800,
      color: "#222",
      marginBottom: 8,
    },
    priceSubtext: {
      fontSize: 14,
      color: "#717171",
    },
    cta: {
      background: "#FF385C",
      color: "#fff",
      border: "none",
      padding: "16px 24px",
      fontSize: 16,
      fontWeight: 600,
      borderRadius: 12,
      cursor: "pointer",
      transition: "all 0.2s",
    },
    amenitiesList: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
    },
    amenityItem: {
      fontSize: 14,
      color: "#222",
      padding: "8px 0",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    loading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
    },
    notFound: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#717171",
    },
  };

  const formatLocation = (loc) => {
    if (!loc) return "—";
    const parts = [loc.street, loc.barangay, loc.city].map((p) => String(p || "").trim()).filter(Boolean);
    return parts.length ? parts.join(", ") : "—";
  };

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const fetchReservationPaidStatus = async () => {
    if (!token) {
      setReservationPaid(false);
      return;
    }
    setReservationStatusLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/tenant", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return;
      const list = Array.isArray(data) ? data : [];
      const hasPaid = list.some(
        (p) =>
          String(p?.paymentType || "").toLowerCase() === "reservation" &&
          String(p?.status || "").toLowerCase() === "paid" &&
          String(p?.apartment?._id || p?.apartment) === String(id)
      );
      setReservationPaid(hasPaid);
    } catch {
      // ignore
    } finally {
      setReservationStatusLoading(false);
    }
  };

  const fetchApplicationApprovalStatus = async () => {
    if (!token) {
      setApplicationApproved(false);
      return;
    }

    setApplicationStatusLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/applications/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.applications)
          ? data.applications
          : [];

      const app = list.find((a) => String(a?.apartment?._id || a?.apartment) === String(id));
      setApplicationApproved(String(app?.status || "").toLowerCase() === "approved");
    } catch {
      // ignore
    } finally {
      setApplicationStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchReservationPaidStatus();
    fetchApplicationApprovalStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  if (loading) {
    return (
      <Box style={styles.container}>
        <div style={styles.loading}>
          <CircularProgress />
        </div>
      </Box>
    );
  }

  if (!apartment) {
    return (
      <Box style={styles.container}>
        <div style={styles.header}>
          <button
            onClick={() => navigate(-1)}
            style={styles.backBtn}
            onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            ← Back
          </button>
        </div>
        <div style={styles.notFound}>
          <Typography variant="h5" sx={{ mb: 1 }}>Apartment not found</Typography>
          <Typography variant="body1" sx={{ color: "#717171" }}>
            This listing may have been removed or is no longer available.
          </Typography>
        </div>
      </Box>
    );
  }

  const photos = apartment.photos?.length
    ? apartment.photos
    : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"];
  const currentPhoto = photos[activePhotoIndex] || photos[0];

  const handleReserveNow = async () => {
    setReserveError("");

    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/apartment/${id}` } });
      return;
    }

    setReserving(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/tenant/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apartmentId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReserveError(data?.message || "Failed to start reservation fee payment.");
        return;
      }

      // Go to dedicated Reservation Fee page
      navigate(`/reservation-fee/${data?.payment?._id}`, {
        state: {
          reservation: {
            apartmentId: id,
            paymentId: data?.payment?._id,
            amount: data?.payment?.amount,
            apartmentTitle: apartment?.title || apartment?.unitType,
            apartmentLocation: apartment?.location,
          },
        },
      });
    } catch {
      setReserveError("Failed to start reservation fee payment.");
    } finally {
      setReserving(false);
    }
  };

  const handleRevealContact = async () => {
    setContactError("");
    setContact(null);

    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/apartment/${id}` } });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/payments/tenant/apartment/${id}/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setContactError(data?.message || "Unable to fetch contact info.");
        return;
      }
      setContact(data?.landlord || null);
    } catch {
      setContactError("Unable to fetch contact info.");
    }
  };

  return (
    <Box sx={styles.container}>
      <div style={styles.header}>
        <button
          onClick={() => navigate(-1)}
          style={styles.backBtn}
          onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
          onMouseLeave={(e) => (e.target.style.background = "none")}
        >
          ← Back
        </button>
      </div>

      <div style={styles.content}>
        {/* Image Gallery */}
        {photos.length > 0 && (
          <div style={styles.imageGallery}>
            <div style={styles.mainPhotoWrap}>
              <img src={currentPhoto} alt={apartment.title || apartment.unitType} style={styles.mainImage} />
            </div>
            {photos.length > 1 && (
              <div style={styles.thumbRail}>
                {photos.map((photo, idx) => (
                  <button
                    key={`${photo}-${idx}`}
                    type="button"
                    style={{
                      ...styles.thumbButton,
                      ...(idx === activePhotoIndex ? styles.activeThumbButton : {}),
                    }}
                    onClick={() => setActivePhotoIndex(idx)}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <img src={photo} alt="" style={styles.thumbImage} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div style={styles.titleSection}>
          <h1 style={styles.title}>{apartment.title || apartment.unitType}</h1>
          <p style={styles.subtitle}>
            {apartment.buildingName && `${apartment.buildingName} • `}
            {apartment.area && `${apartment.area} sqm`}
          </p>
        </div>

        {/* Main Content Grid */}
        <div style={styles.mainGrid}>
          {/* Left Column - Details */}
          <div>
            {/* Key Info */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Apartment Details</div>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Unit Type</span>
                  <span style={styles.infoValue}>{apartment.unitType || "-"}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Bedrooms</span>
                  <span style={styles.infoValue}>
                    {apartment.bedrooms || (apartment.unitType?.toLowerCase() === "studio" ? 1 : "-")}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Bathrooms</span>
                  <span style={styles.infoValue}>{apartment.bathrooms || "-"}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Floor</span>
                  <span style={styles.infoValue}>{apartment.floor || "-"}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Location</span>
                  <span style={styles.infoValue}>{formatLocation(apartment.location)}</span>
                </div>
              </div>
            </div>

            {/* Furnishing & Pet Policy */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Features</div>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Furnishing</span>
                  <span style={styles.infoValue}>{apartment.furnishing || "-"}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Pet Policy</span>
                  <span style={styles.infoValue}>{apartment.petPolicy || "-"}</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {apartment.amenities && apartment.amenities.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Amenities</div>
                <div style={styles.amenitiesList}>
                  {apartment.amenities.map((amenity, idx) => (
                    <div key={idx} style={styles.amenityItem}>
                      <span>✓</span> {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Payment Terms</div>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Deposit</span>
                  <span style={styles.infoValue}>
                    {apartment.deposit ? `₱${apartment.deposit.toLocaleString()}` : "-"}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Advance</span>
                  <span style={styles.infoValue}>
                    {apartment.advance ? `₱${apartment.advance.toLocaleString()}` : "-"}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Min. Lease</span>
                  <span style={styles.infoValue}>{apartment.minLeaseTerm || "-"}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Available From</span>
                  <span style={styles.infoValue}>
                    {apartment.availableFrom ? new Date(apartment.availableFrom).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {apartment.description && (
              <div style={{ marginTop: 32 }}>
                <div style={styles.sectionTitle}>Description</div>
                <Typography variant="body1" sx={{ color: "#717171", lineHeight: 1.6 }}>
                  {apartment.description}
                </Typography>
              </div>
            )}

            {/* Special Notes */}
            {apartment.specialNotes && (
              <div style={{ marginTop: 32 }}>
                <div style={styles.sectionTitle}>Special Notes</div>
                <Typography variant="body1" sx={{ color: "#717171", lineHeight: 1.6 }}>
                  {apartment.specialNotes}
                </Typography>
              </div>
            )}
          </div>

          {/* Right Column - Pricing & CTA */}
          <div style={styles.priceCard}>
            <div>
              <div style={styles.price}>₱{apartment.price?.toLocaleString()}</div>
              <div style={styles.priceSubtext}>per month</div>
            </div>

            <Button
              variant="contained"
              sx={{
                background: "#FF385C",
                color: "#fff",
                padding: "16px 24px",
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": { background: "#dc3545" },
                "&.Mui-disabled": { background: "#f1f1f1", color: "#9aa0a6" },
              }}
              onClick={handleReserveNow}
              disabled={reserving || reservationPaid || reservationStatusLoading || applicationStatusLoading || !applicationApproved}
            >
              {reservationStatusLoading
                ? "Checking reservation…"
                : applicationStatusLoading
                  ? "Checking approval…"
                  : reservationPaid
                    ? "Already Reserved"
                    : reserving
                      ? "Reserving..."
                      : applicationApproved
                        ? "Reserve Now"
                        : "Waiting for landlord approval"}
            </Button>
            {reserveError && (
              <Typography variant="body2" sx={{ color: "#d32f2f", marginTop: 1 }}>
                {reserveError}
              </Typography>
            )}

            {apartment.landlord && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #ebebeb" }}>
                <div style={styles.sectionTitle}>Landlord</div>
                <div style={styles.infoItem}>
                  <span style={styles.infoValue}>{apartment.landlord.name || "Anonymous"}</span>
                  {!contact ? (
                    <span style={styles.infoLabel}>Contact details are hidden</span>
                  ) : (
                    <span style={styles.infoLabel}>Contact unlocked</span>
                  )}
                </div>

                {!contact ? (
                  <div style={{ marginTop: 12 }}>
                    <span style={styles.infoLabel}>How to get contact info</span>
                    <span style={styles.infoValue}>
                      Pay the reservation fee to unlock the landlord’s phone number and email.
                    </span>
                    <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={handleRevealContact}
                        sx={{
                          borderColor: "#ddd",
                          color: "#222",
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                        }}
                      >
                        Reveal contact (after payment)
                      </Button>
                      {contactError && (
                        <Typography variant="body2" sx={{ color: "#d32f2f" }}>
                          {contactError}
                        </Typography>
                      )}
                    </Box>
                  </div>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={styles.infoLabel}>Email</span>
                        <span style={styles.infoValue}>{contact.email || "-"}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={styles.infoLabel}>Contact Number</span>
                        <span style={styles.infoValue}>{contact.contactNumber || "-"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Box>
  );
}
