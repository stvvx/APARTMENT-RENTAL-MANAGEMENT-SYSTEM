import React, { useEffect, useState } from "react";
import {
  Box, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Switch, CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import cloudinaryConfig from "../cloudinaryConfig";
import LandlordHeader from "../header/landlord_header";
import TenantManagement from "./TenantManagement";

const API_URL = "http://localhost:5000/api/apartments";

/* ─── Theme ─────────────────────────────────────────────────────── */
const theme = createTheme({
  palette: {
    primary: { main: "#FF385C", contrastText: "#fff" },
    background: { default: "#F7F7F7", paper: "#FFFFFF" },
    success: { main: "#00A699" },
    text: { primary: "#222222", secondary: "#717171" },
  },
  typography: { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  shape: { borderRadius: 8 },
});

/* ─── Design Tokens ─────────────────────────────────────────────── */
const T = {
  coral:       "#FF385C",
  coralDark:   "#E31C5F",
  coralMuted:  "#FF385C12",
  coralBg:     "#FFF1F3",
  coralBorder: "#FFD6DB",
  teal:        "#00A699",
  tealBg:      "#F0FAFA",
  tealBorder:  "#B2E0DD",
  charcoal:    "#222222",
  warm:        "#484848",
  silver:      "#717171",
  muted:       "#B0B0B0",
  border:      "#EBEBEB",
  borderHover: "#DDDDDD",
  surface:     "#F7F7F7",
  white:       "#FFFFFF",
};

const EMPTY_FORM = {
  title: "", price: "", floor: "", unitType: "", photos: [],
  isAvailable: true, unitNumber: "", buildingName: "", area: "",
  bedrooms: "", bathrooms: "", furnishing: "", amenities: "",
  petPolicy: "", deposit: "", advance: "", minLeaseTerm: "",
  availableFrom: "", utilitiesIncluded: "", specialNotes: "",
};

/* ─── Primitives ─────────────────────────────────────────────────── */

/** Consistent tab button */
const TabButton = ({ active, onClick, children }) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      px: 3, py: 1.5,
      border: "none",
      borderBottom: active ? `2px solid ${T.coral}` : "2px solid transparent",
      background: "none",
      fontFamily: "inherit",
      fontSize: 13.5,
      fontWeight: active ? 700 : 500,
      color: active ? T.charcoal : T.silver,
      cursor: "pointer",
      transition: "all 0.15s",
      letterSpacing: "0.1px",
      "&:hover": { color: T.charcoal },
    }}
  >
    {children}
  </Box>
);

/** Primary CTA button */
const PrimaryButton = ({ onClick, children, type = "button", disabled }) => (
  <Box
    component="button"
    type={type}
    onClick={onClick}
    disabled={disabled}
    sx={{
      display: "inline-flex", alignItems: "center", gap: 1,
      px: 3, py: "10px",
      borderRadius: "6px",
      fontSize: 13.5, fontWeight: 600, fontFamily: "inherit",
      border: "none",
      background: disabled ? T.surface : T.coral,
      color: disabled ? T.muted : T.white,
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 2px 10px rgba(255,56,92,0.28)",
      transition: "all 0.15s",
      "&:hover": disabled ? {} : {
        background: T.coralDark,
        boxShadow: "0 4px 14px rgba(255,56,92,0.35)",
        transform: "translateY(-1px)",
      },
    }}
  >
    {children}
  </Box>
);

/** Ghost / outline button */
const OutlineButton = ({ onClick, children, type = "button", danger = false, disabled }) => (
  <Box
    component="button"
    type={type}
    onClick={onClick}
    disabled={disabled}
    sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 2.25, py: "7px",
      borderRadius: "6px",
      fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
      border: danger ? `1px solid ${T.coralBorder}` : `1px solid ${T.borderHover}`,
      background: danger ? T.coralBg : T.white,
      color: danger ? T.coral : T.charcoal,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.15s",
      "&:hover": disabled ? {} : {
        borderColor: danger ? T.coral : T.charcoal,
        background: danger ? "#FFE0E5" : T.surface,
        transform: "translateY(-1px)",
      },
    }}
  >
    {children}
  </Box>
);

/** Form field label */
const FieldLabel = ({ children, required }) => (
  <Typography sx={{
    fontSize: 10, fontWeight: 700, color: T.silver,
    textTransform: "uppercase", letterSpacing: "1px", mb: 0.75,
  }}>
    {children}{required && <Box component="span" sx={{ color: T.coral, ml: 0.5 }}>*</Box>}
  </Typography>
);

/** Styled text / number input */
const StyledInput = ({ name, value, onChange, type = "text", placeholder, disabled, required }) => (
  <Box
    component="input"
    name={name}
    value={value}
    onChange={onChange}
    type={type}
    placeholder={placeholder}
    disabled={disabled}
    required={required}
    sx={{
      width: "100%", px: "12px", py: "9px",
      fontSize: 13.5, fontFamily: "inherit",
      color: disabled ? T.muted : T.charcoal,
      background: disabled ? T.surface : T.white,
      border: `1px solid #D1D5DB`,
      borderRadius: "6px",
      boxSizing: "border-box",
      outline: "none",
      cursor: disabled ? "not-allowed" : "text",
      transition: "border-color 0.15s, box-shadow 0.15s",
      "&:focus": { borderColor: T.coral, boxShadow: `0 0 0 3px ${T.coralMuted}` },
      "&::placeholder": { color: T.muted },
    }}
  />
);

/** Styled textarea */
const StyledTextarea = ({ name, value, onChange, placeholder, rows = 3 }) => (
  <Box
    component="textarea"
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    sx={{
      width: "100%", px: "12px", py: "9px",
      fontSize: 13.5, fontFamily: "inherit",
      color: T.charcoal,
      background: T.white,
      border: `1px solid #D1D5DB`,
      borderRadius: "6px",
      boxSizing: "border-box",
      outline: "none",
      resize: "vertical",
      transition: "border-color 0.15s, box-shadow 0.15s",
      "&:focus": { borderColor: T.coral, boxShadow: `0 0 0 3px ${T.coralMuted}` },
      "&::placeholder": { color: T.muted },
    }}
  />
);

/** Form section divider */
const FormSection = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: T.silver, textTransform: "uppercase", letterSpacing: "0.9px", whiteSpace: "nowrap" }}>
        {title}
      </Typography>
      <Box sx={{ flex: 1, height: 1, background: T.border }} />
    </Box>
    {children}
  </Box>
);

/** Two-column form row */
const FormRow = ({ children }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
    {children}
  </Box>
);

/** Availability toggle */
const AvailabilityToggle = ({ checked, onChange }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 2.5,
      py: 1.75,
      borderRadius: "6px",
      background: checked ? T.tealBg : T.surface,
      border: `1px solid ${checked ? T.tealBorder : T.border}`,
      transition: "all 0.2s",
    }}
  >
    <Box>
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: checked ? T.teal : T.silver }}>
        {checked ? "Available for rent" : "Not available"}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: T.muted, mt: 0.25 }}>
        {checked ? "Listing is visible to tenants" : "Listing is hidden from tenants"}
      </Typography>
    </Box>
    <Switch
      checked={checked}
      onChange={onChange}
      name="isAvailable"
      sx={{
        "& .MuiSwitch-switchBase.Mui-checked": { color: T.teal },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: T.teal },
      }}
    />
  </Box>
);

/** Empty state */
const EmptyState = ({ icon, title, subtitle }) => (
  <Box sx={{ textAlign: "center", py: 8, px: 4, background: T.white, borderRadius: "8px", border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.border}` }}>
    <Typography sx={{ fontSize: 44, mb: 2 }}>{icon}</Typography>
    <Typography sx={{ fontWeight: 700, color: T.charcoal, mb: 0.75, fontSize: 16 }}>{title}</Typography>
    <Typography sx={{ color: T.silver, fontSize: 13.5, maxWidth: 320, mx: "auto", lineHeight: 1.6 }}>{subtitle}</Typography>
  </Box>
);

/** Apartment listing card */
const ApartmentCard = ({ apt, onEdit, onDelete }) => {
  const isAvailable = apt.isAvailable !== false;
  return (
    <Box
      sx={{
        background: T.white,
        borderRadius: "8px",
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${isAvailable ? T.teal : T.muted}`,
        boxShadow: "0 1px 3px rgba(34,34,34,0.05), 0 4px 16px rgba(34,34,34,0.04)",
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": { boxShadow: "0 4px 20px rgba(34,34,34,0.10)", transform: "translateY(-1px)" },
      }}
    >
      {/* Photo */}
      <Box
        sx={{
          width: "100%",
          height: 180,
          overflow: "hidden",
          position: "relative",
          background: T.surface,
        }}
      >
        <Box
          component="img"
          src={apt.photos?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80"}
          alt={apt.title || apt.unitType}
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s", "&:hover": { transform: "scale(1.03)" } }}
        />
        {/* Availability badge */}
        <Box
          sx={{
            position: "absolute", top: 10, right: 10,
            px: 1.5, py: 0.4,
            borderRadius: "4px",
            background: isAvailable ? T.teal : T.warm,
            color: T.white,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.6px",
            textTransform: "uppercase",
          }}
        >
          {isAvailable ? "Available" : "Unavailable"}
        </Box>
        {/* Photo count badge */}
        {apt.photos?.length > 1 && (
          <Box
            sx={{
              position: "absolute", bottom: 10, right: 10,
              px: 1.5, py: 0.4,
              borderRadius: "4px",
              background: "rgba(34,34,34,0.65)",
              color: T.white, fontSize: 10, fontWeight: 600,
            }}
          >
            +{apt.photos.length - 1} photos
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, color: T.charcoal, mb: 0.4, lineHeight: 1.25 }}>
          {apt.title || apt.unitType || "Untitled Unit"}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: T.silver, mb: 1.5 }}>
          {[apt.buildingName, apt.floor && `Floor ${apt.floor}`, apt.unitNumber && `Unit ${apt.unitNumber}`].filter(Boolean).join(" · ") || "—"}
        </Typography>

        {/* Price + type chips */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: T.teal }}>
              ₱{apt.price ? Number(apt.price).toLocaleString() : "N/A"}
            </Typography>
            <Typography sx={{ fontSize: 11, color: T.silver }}>/mo</Typography>
          </Box>
          {apt.unitType && (
            <Box sx={{ px: 1.5, py: 0.3, borderRadius: "4px", background: T.coralMuted, color: T.coral, fontSize: 11, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
              {apt.unitType}
            </Box>
          )}
        </Box>

        {/* Meta row */}
        {(apt.bedrooms || apt.bathrooms || apt.area) && (
          <Box sx={{ display: "flex", gap: 2, mb: 2.5, pb: 2.5, borderBottom: `1px solid ${T.border}` }}>
            {apt.bedrooms && (
              <Typography sx={{ fontSize: 12.5, color: T.silver }}>🛏 {apt.bedrooms} bed</Typography>
            )}
            {apt.bathrooms && (
              <Typography sx={{ fontSize: 12.5, color: T.silver }}>🚿 {apt.bathrooms} bath</Typography>
            )}
            {apt.area && (
              <Typography sx={{ fontSize: 12.5, color: T.silver }}>📐 {apt.area} sqm</Typography>
            )}
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <OutlineButton onClick={() => onEdit(apt)}>✏️ Edit</OutlineButton>
          <OutlineButton danger onClick={() => onDelete(apt._id)}>🗑 Delete</OutlineButton>
        </Box>
      </Box>
    </Box>
  );
};

/* ─── Main Component ─────────────────────────────────────────────── */
export default function LandlordDashboard() {
  const [apartments, setApartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedId, setSelectedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState(0);
  const token = localStorage.getItem("token");

  const fetchApartments = () => {
    fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setApartments(Array.isArray(data) ? data : data.apartments || []));
  };

  useEffect(() => { fetchApartments(); }, []);

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setEditMode(false);
    setSelectedId(null);
    setModalOpen(true);
  };

  const openEditModal = (apt) => {
    const isStudio = apt.unitType?.toLowerCase() === "studio";
    setForm({
      title: apt.title || "",
      price: apt.price || "",
      floor: apt.floor || "",
      unitType: apt.unitType || "",
      photos: apt.photos || [],
      isAvailable: typeof apt.isAvailable === "boolean" ? apt.isAvailable : true,
      unitNumber: apt.unitNumber || "",
      buildingName: apt.buildingName || "",
      area: apt.area || "",
      bedrooms: isStudio ? 1 : (apt.bedrooms || ""),
      bathrooms: apt.bathrooms || "",
      furnishing: apt.furnishing || "",
      amenities: apt.amenities ? apt.amenities.join(", ") : "",
      petPolicy: apt.petPolicy || "",
      deposit: apt.deposit || "",
      advance: apt.advance || "",
      minLeaseTerm: apt.minLeaseTerm || "",
      availableFrom: apt.availableFrom ? apt.availableFrom.split("T")[0] : "",
      utilitiesIncluded: apt.utilitiesIncluded ? apt.utilitiesIncluded.join(", ") : "",
      specialNotes: apt.specialNotes || "",
    });
    setEditMode(true);
    setSelectedId(apt._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setSelectedId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "unitType") {
      const val = value.trim().toLowerCase();
      if (val === "studio") {
        setForm((f) => ({ ...f, unitType: value, bedrooms: 0 }));
        return;
      } else if (val === "1br") {
        setForm((f) => ({ ...f, unitType: value, bedrooms: 1 }));
        return;
      } else if (val === "2br") {
        setForm((f) => ({ ...f, unitType: value, bedrooms: 2 }));
        return;
      } else if (val === "3br") {
        setForm((f) => ({ ...f, unitType: value, bedrooms: 3 }));
        return;
      }
    }
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", cloudinaryConfig.CLOUDINARY_PRESET_NAME);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.secure_url) urls.push(data.secure_url);
    }
    setForm((f) => ({ ...f, photos: urls }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `${API_URL}/${selectedId}` : API_URL;
    const payload = {
      ...form,
      amenities: form.amenities ? form.amenities.split(",").map((a) => a.trim()).filter(Boolean) : [],
      utilitiesIncluded: form.utilitiesIncluded ? form.utilitiesIncluded.split(",").map((u) => u.trim()).filter(Boolean) : [],
    };
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    fetchApartments();
    closeModal();
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this apartment? This cannot be undone.")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchApartments();
  };

  const isStudio = form.unitType?.toLowerCase() === "studio";

  return (
    <ThemeProvider theme={theme}>
      <LandlordHeader />

      <Box sx={{ background: T.surface, minHeight: "100vh", pt: { xs: 3, md: 5 }, pb: 10 }}>
        <Box sx={{ maxWidth: 1080, mx: "auto", px: { xs: 2, md: 4 } }}>

          {/* ── Page title bar ── */}
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: 4, pb: 3, borderBottom: `1px solid ${T.border}` }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: 26, md: 32 }, color: T.charcoal, letterSpacing: "-0.5px", lineHeight: 1.15, mb: 0.5 }}>
                Landlord Dashboard
              </Typography>
              <Typography sx={{ color: T.muted, fontSize: 13, letterSpacing: "0.2px" }}>
                Manage your listings and tenants
              </Typography>
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, flexShrink: 0 }}>
              <Box sx={{ width: 32, height: 2, background: T.coral, borderRadius: 1 }} />
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: T.coral }} />
            </Box>
          </Box>

          {/* ── Tabs ── */}
          <Box sx={{ display: "flex", borderBottom: `1px solid ${T.border}`, mb: 4, background: T.white, borderRadius: "8px 8px 0 0", px: 1 }}>
            <TabButton active={tab === 0} onClick={() => setTab(0)}>
              My Apartments {apartments.length > 0 && `(${apartments.length})`}
            </TabButton>
            <TabButton active={tab === 1} onClick={() => setTab(1)}>
              Tenant Management
            </TabButton>
          </Box>

          {/* ── Tab 0: Apartments ── */}
          {tab === 0 && (
            <>
              {/* Toolbar */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: T.charcoal }}>
                  {apartments.length} {apartments.length === 1 ? "listing" : "listings"}
                </Typography>
                <PrimaryButton onClick={openAddModal}>
                  ＋ Add Apartment
                </PrimaryButton>
              </Box>

              {apartments.length === 0 ? (
                <EmptyState
                  icon="🏢"
                  title="No apartments yet"
                  subtitle="Add your first listing to start receiving tenant applications."
                />
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                    gap: 2.5,
                  }}
                >
                  {apartments.map((apt, idx) => (
                    <ApartmentCard
                      key={apt._id || idx}
                      apt={apt}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  ))}
                </Box>
              )}
            </>
          )}

          {/* ── Tab 1: Tenant Management ── */}
          {tab === 1 && <TenantManagement />}

        </Box>
      </Box>

      {/* ══════════════════════════════════════
          Add / Edit Apartment Modal
      ══════════════════════════════════════ */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "10px",
            border: `1px solid ${T.border}`,
            borderTop: `3px solid ${T.coral}`,
            boxShadow: "0 8px 40px rgba(34,34,34,0.15)",
          },
        }}
      >
        {/* Modal header */}
        <DialogTitle sx={{ px: 3.5, pt: 3, pb: 2, borderBottom: `1px solid ${T.border}` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "7px", background: T.coralMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
              {editMode ? "✏️" : "🏠"}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 17, color: T.charcoal, lineHeight: 1.2 }}>
                {editMode ? "Edit Apartment" : "Add New Apartment"}
              </Typography>
              <Typography sx={{ fontSize: 12, color: T.muted, mt: 0.2 }}>
                {editMode ? "Update listing details" : "Fill in the details for your new listing"}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ px: 3.5, py: 3 }}>

            {/* ── Basic Info ── */}
            <FormSection title="Basic Info">
              <Box sx={{ mb: 2 }}>
                <FieldLabel required>Title</FieldLabel>
                <StyledInput name="title" value={form.title} onChange={handleChange} placeholder="e.g. Cozy Studio in Makati" required />
              </Box>
              <FormRow>
                <Box>
                  <FieldLabel>Unit Number</FieldLabel>
                  <StyledInput name="unitNumber" value={form.unitNumber} onChange={handleChange} placeholder="e.g. 4B" />
                </Box>
                <Box>
                  <FieldLabel>Building Name</FieldLabel>
                  <StyledInput name="buildingName" value={form.buildingName} onChange={handleChange} placeholder="e.g. Alphaland Tower" />
                </Box>
              </FormRow>
              <FormRow>
                <Box>
                  <FieldLabel>Floor</FieldLabel>
                  <StyledInput name="floor" value={form.floor} onChange={handleChange} placeholder="e.g. 12th" />
                </Box>
                <Box>
                  <FieldLabel>Unit Type</FieldLabel>
                  <StyledInput name="unitType" value={form.unitType} onChange={handleChange} placeholder="e.g. Studio, 1BR, 2BR" />
                </Box>
              </FormRow>
            </FormSection>

            {/* ── Pricing ── */}
            <FormSection title="Pricing & Terms">
              <FormRow>
                <Box>
                  <FieldLabel required>Monthly Price (₱)</FieldLabel>
                  <StyledInput name="price" value={form.price} onChange={handleChange} type="number" placeholder="0" required />
                </Box>
                <Box>
                  <FieldLabel>Area (sqm)</FieldLabel>
                  <StyledInput name="area" value={form.area} onChange={handleChange} type="number" placeholder="0" />
                </Box>
              </FormRow>
              <FormRow>
                <Box>
                  <FieldLabel>Security Deposit (₱)</FieldLabel>
                  <StyledInput name="deposit" value={form.deposit} onChange={handleChange} type="number" placeholder="0" />
                </Box>
                <Box>
                  <FieldLabel>Advance Payment (₱)</FieldLabel>
                  <StyledInput name="advance" value={form.advance} onChange={handleChange} type="number" placeholder="0" />
                </Box>
              </FormRow>
              <FormRow>
                <Box>
                  <FieldLabel>Minimum Lease Term</FieldLabel>
                  <StyledInput name="minLeaseTerm" value={form.minLeaseTerm} onChange={handleChange} placeholder="e.g. 6 months" />
                </Box>
                <Box>
                  <FieldLabel>Available From</FieldLabel>
                  <StyledInput name="availableFrom" value={form.availableFrom} onChange={handleChange} type="date" />
                </Box>
              </FormRow>
            </FormSection>

            {/* ── Details ── */}
            <FormSection title="Unit Details">
              <FormRow>
                <Box>
                  <FieldLabel>Bedrooms</FieldLabel>
                  <StyledInput
                    name="bedrooms"
                    value={form.unitType.trim().toLowerCase() === "studio" ? 0 : form.bedrooms}
                    onChange={handleChange}
                    type="number"
                    placeholder="0"
                    disabled={["studio", "1br", "2br", "3br"].includes(form.unitType.trim().toLowerCase())}
                  />
                  {form.unitType.trim().toLowerCase() === "studio" && (
                    <Typography sx={{ fontSize: 11, color: T.muted, mt: 0.5 }}>Studios have no separate bedrooms</Typography>
                  )}
                  {["1br", "2br", "3br"].includes(form.unitType.trim().toLowerCase()) && (
                    <Typography sx={{ fontSize: 11, color: T.muted, mt: 0.5 }}>Bedrooms auto-set by unit type</Typography>
                  )}
                </Box>
                <Box>
                  <FieldLabel>Bathrooms</FieldLabel>
                  <StyledInput name="bathrooms" value={form.bathrooms} onChange={handleChange} type="number" placeholder="0" />
                </Box>
              </FormRow>
              <FormRow>
                <Box>
                  <FieldLabel>Furnishing</FieldLabel>
                  <StyledInput name="furnishing" value={form.furnishing} onChange={handleChange} placeholder="e.g. Fully furnished" />
                </Box>
                <Box>
                  <FieldLabel>Pet Policy</FieldLabel>
                  <StyledInput name="petPolicy" value={form.petPolicy} onChange={handleChange} placeholder="e.g. No pets" />
                </Box>
              </FormRow>
              <Box sx={{ mb: 2 }}>
                <FieldLabel>Amenities</FieldLabel>
                <StyledInput name="amenities" value={form.amenities} onChange={handleChange} placeholder="e.g. Pool, Gym, Parking (comma-separated)" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <FieldLabel>Utilities Included</FieldLabel>
                <StyledInput name="utilitiesIncluded" value={form.utilitiesIncluded} onChange={handleChange} placeholder="e.g. Water, Internet (comma-separated)" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <FieldLabel>Special Notes</FieldLabel>
                <StyledTextarea name="specialNotes" value={form.specialNotes} onChange={handleChange} placeholder="Any additional notes for tenants…" rows={3} />
              </Box>
            </FormSection>

            {/* ── Availability ── */}
            <FormSection title="Availability">
              <AvailabilityToggle
                checked={form.isAvailable}
                onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
              />
            </FormSection>

            {/* ── Photos ── */}
            <FormSection title="Photos">
              <Box
                component="label"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  py: 3,
                  borderRadius: "6px",
                  border: `2px dashed ${uploading ? T.coral : T.borderHover}`,
                  background: uploading ? T.coralMuted : T.surface,
                  cursor: uploading ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  "&:hover": uploading ? {} : { borderColor: T.coral, background: T.coralMuted },
                }}
              >
                {uploading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CircularProgress size={18} sx={{ color: T.coral }} />
                    <Typography sx={{ fontSize: 13.5, color: T.coral, fontWeight: 600 }}>Uploading…</Typography>
                  </Box>
                ) : (
                  <>
                    <Typography sx={{ fontSize: 24 }}>📷</Typography>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: T.charcoal }}>
                      {form.photos.length > 0 ? "Change photos" : "Upload photos"}
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, color: T.muted }}>JPG, PNG or WEBP · Multiple files supported</Typography>
                  </>
                )}
                <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} disabled={uploading} />
              </Box>

              {form.photos.length > 0 && (
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2 }}>
                  {form.photos.map((url, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 80, height: 80,
                        borderRadius: "6px",
                        overflow: "hidden",
                        border: `1px solid ${T.border}`,
                        position: "relative",
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt={`Preview ${i + 1}`}
                        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      {i === 0 && (
                        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(34,34,34,0.65)", color: "#fff", fontSize: 9, fontWeight: 700, textAlign: "center", py: 0.4, letterSpacing: "0.5px" }}>
                          COVER
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </FormSection>

          </DialogContent>

          {/* Modal footer */}
          <DialogActions sx={{ px: 3.5, py: 2.5, borderTop: `1px solid ${T.border}`, gap: 1.5, justifyContent: "flex-end" }}>
            <OutlineButton type="button" onClick={closeModal}>Cancel</OutlineButton>
            <PrimaryButton type="submit" disabled={submitting || uploading}>
              {submitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={13} sx={{ color: T.muted }} />
                  {editMode ? "Updating…" : "Adding…"}
                </Box>
              ) : (editMode ? "Update Listing" : "Add Listing")}
            </PrimaryButton>
          </DialogActions>
        </Box>
      </Dialog>
    </ThemeProvider>
  );
}