import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Snackbar,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TenantHeader from "./header/tenant_header";
import { useNavigate } from "react-router-dom";
import ApplicationStatus from "./User/ApplicationStatus";
import PaymentsTab from "./User/PaymentsTab";
import ProfileTab from "./User/ProfileTab";

const API_URL = "http://localhost:5000/api/apartments/tenant"; // Use the correct endpoint for tenants

function App() {
  const [apartments, setApartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState({ minPrice: '', maxPrice: '', floor: '', unitType: '' });
  const [idFile, setIdFile] = useState(null);
  const [incomeFile, setIncomeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState(0);
  const [userApplications, setUserApplications] = useState([]);
  const [payForApartment, setPayForApartment] = useState(null);
  const [approvedApp, setApprovedApp] = useState(null);
  const [showApprovalAlert, setShowApprovalAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(data => {
        setApartments(Array.isArray(data) ? data : data.apartments || []);
      })
      .catch(() => setApartments([]));
    // Fetch user's applications for duplicate check
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/applications/mine", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUserApplications(Array.isArray(data) ? data : data.applications || []))
        .catch(() => setUserApplications([]));
    }
  }, []);

  // Watch for approved applications
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/applications/mine", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const apps = Array.isArray(data) ? data : data.applications || [];
          const approved = apps.find(app => app.status === "approved");
          if (approved) {
            setApprovedApp(approved.apartment);
            setShowApprovalAlert(true);
          }
        });
    }
  }, []);

  const openModal = (apt) => {
    setSelected(apt);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    setName("");
    setEmail("");
    setMessage("");
  };

  // Helper to upload a file to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET_NAME);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    return data.secure_url;
  };

  const applyApartment = async () => {
    if (!name || !email) {
      alert("Please enter your name and email");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to apply for a unit.");
      navigate("/login");
      return;
    }
    setSubmitting(true);
    let idUrl = "", incomeUrl = "";
    try {
      if (idFile) idUrl = await uploadToCloudinary(idFile);
      if (incomeFile) incomeUrl = await uploadToCloudinary(incomeFile);
      const documents = [];
      if (idUrl) documents.push(idUrl);
      if (incomeUrl) documents.push(incomeUrl);
      if (documents.length === 0) {
        alert("Please upload required documents.");
        setSubmitting(false);
        return;
      }
      const res = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name,
          email,
          message,
          apartmentId: selected._id,
          documents
        })
      });
      if (!res.ok) throw new Error("Failed to submit application");
      // Check if application is approved immediately (if backend supports instant approval)
      const result = await res.json();
      if (result.status === "approved") {
        setPayForApartment(selected);
        setTab(2); // Switch to Payments tab
      } else {
        alert("Application submitted! You can track your status in your dashboard.");
        closeModal();
      }
    } catch (err) {
      alert(err.message);
    }
    setSubmitting(false);
  };

  const filteredApartments = apartments.filter(apt => {
    const minMatch = filter.minPrice ? apt.price >= Number(filter.minPrice) : true;
    const maxMatch = filter.maxPrice ? apt.price <= Number(filter.maxPrice) : true;
    const floorMatch = filter.floor ? (apt.floor || '').toLowerCase().includes(filter.floor.toLowerCase()) : true;
    const unitTypeMatch = filter.unitType ? (apt.unitType || '').toLowerCase().includes(filter.unitType.toLowerCase()) : true;
    return minMatch && maxMatch && floorMatch && unitTypeMatch;
  });

  // Check if user already applied for this apartment (block only if not cancelled)
  const existingApp = selected && userApplications.find(app => app.apartment?._id === selected._id && ['pending', 'approved', 'rejected'].includes(app.status));

  // Allow external modal open by apartment ID
  const openModalById = async (apartmentId) => {
    // If passed an object, extract the _id
    const id = typeof apartmentId === 'object' && apartmentId !== null ? apartmentId._id : apartmentId;
    let apt = apartments.find(a => a._id === id);
    if (!apt) {
      // Fetch from tenant API if not in list
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/apartments/tenant/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      apt = await res.json();
    }
    setSelected(apt);
    setModalOpen(true);
  };

  // Callback to refresh user applications after cancel
  const refreshUserApplications = () => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/applications/mine", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUserApplications(Array.isArray(data) ? data : data.applications || []))
        .catch(() => setUserApplications([]));
    }
  };

  return (
    <Box sx={{ background: "#f4f6f9", minHeight: "100vh" }}>
      <TenantHeader />
      <Box
        sx={{
          height: 320,
          background: "linear-gradient(120deg, #3498db 60%, #2c3e50 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
          Find Your Perfect Apartment
        </Typography>
        <Typography variant="h6">
          Business-friendly, modern, and secure rentals
        </Typography>
      </Box>
      <Container sx={{ py: 6 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4 }}>
          <Tab label="Apartments" />
          <Tab label="Applications" />
          <Tab label="Payments" />
          <Tab label="Profile" />
        </Tabs>
        {tab === 0 && (
          <>
            <Typography variant="h4" sx={{ mb: 4, color: "#2c3e50", fontWeight: "bold" }}>
              Available Apartments
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                select
                label="Min Price"
                value={filter.minPrice}
                onChange={e => setFilter(f => ({ ...f, minPrice: e.target.value }))}
                size="small"
                sx={{ width: 120 }}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="5000">₱5,000</MenuItem>
                <MenuItem value="10000">₱10,000</MenuItem>
                <MenuItem value="15000">₱15,000</MenuItem>
                <MenuItem value="20000">₱20,000</MenuItem>
                <MenuItem value="30000">₱30,000</MenuItem>
              </TextField>
              <TextField
                select
                label="Max Price"
                value={filter.maxPrice}
                onChange={e => setFilter(f => ({ ...f, maxPrice: e.target.value }))}
                size="small"
                sx={{ width: 120 }}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="10000">₱10,000</MenuItem>
                <MenuItem value="15000">₱15,000</MenuItem>
                <MenuItem value="20000">₱20,000</MenuItem>
                <MenuItem value="30000">₱30,000</MenuItem>
                <MenuItem value="50000">₱50,000</MenuItem>
              </TextField>
              <TextField
                label="Floor"
                value={filter.floor}
                onChange={e => setFilter(f => ({ ...f, floor: e.target.value }))}
                size="small"
              />
              <TextField
                label="Unit Type"
                value={filter.unitType}
                onChange={e => setFilter(f => ({ ...f, unitType: e.target.value }))}
                size="small"
              />
            </Box>
            <Grid container spacing={4}>
              {filteredApartments.length === 0 && (
                <Typography variant="body1" sx={{ ml: 2 }}>
                  No apartments available.
                </Typography>
              )}
              {filteredApartments.map((apt, idx) => (
                <Grid item key={idx} xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: 3,
                      cursor: "pointer",
                      transition: "0.3s",
                      "&:hover": { transform: "translateY(-5px)" },
                    }}
                    onClick={() => openModal(apt)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={apt.photos && apt.photos.length > 0 ? apt.photos[0] : "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"}
                      alt={apt.title || apt.unitType}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {apt.title || apt.unitType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {apt.location || apt.floor || ""}
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#27ae60", mt: 1 }}>
                        ₱{apt.price ? apt.price.toLocaleString() : "N/A"}/month
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => openModal(apt)}>
                        Apply
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        {tab === 1 && <ApplicationStatus openApartmentModal={openModalById} onCancel={refreshUserApplications} />}
        {tab === 2 && <PaymentsTab payForApartment={approvedApp} />}
        {tab === 3 && <ProfileTab />}
      </Container>

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {selected && (selected.title || selected.unitType)}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Apartment Info (Left) */}
          <Box sx={{ flex: 1, minWidth: 260 }}>
            {selected && (
              <>
                <CardMedia
                  component="img"
                  height="220"
                  image={selected.photos && selected.photos.length > 0 ? selected.photos[0] : "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"}
                  alt={selected.title || selected.unitType}
                  sx={{ borderRadius: 2, mb: 2 }}
                />
                <Typography variant="h6" sx={{ mb: 1 }}>{selected.title || selected.unitType}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Unit Number:</b> {selected.unitNumber || "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Building Name:</b> {selected.buildingName || "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Area:</b> {selected.area ? `${selected.area} sqm` : "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Floor:</b> {selected.floor || "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Unit Type:</b> {selected.unitType || "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Bedrooms:</b> {selected.bedrooms || (selected.unitType && selected.unitType.toLowerCase() === 'studio' ? 1 : "-")}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Bathrooms:</b> {selected.bathrooms || "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Furnishing:</b> {selected.furnishing || "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Amenities:</b> {selected.amenities && selected.amenities.length ? selected.amenities.join(', ') : "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Pet Policy:</b> {selected.petPolicy || "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Deposit Amount:</b> {selected.deposit ? `₱${selected.deposit.toLocaleString()}` : "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Advance Payment:</b> {selected.advance ? `₱${selected.advance.toLocaleString()}` : "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Minimum Lease Term:</b> {selected.minLeaseTerm || "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Available From:</b> {selected.availableFrom ? new Date(selected.availableFrom).toLocaleDateString() : "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Utilities Included:</b> {selected.utilitiesIncluded && selected.utilitiesIncluded.length ? selected.utilitiesIncluded.join(', ') : "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Description:</b> {selected.description || "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Special Notes:</b> {selected.specialNotes || "-"}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}><b>Landlord:</b> {selected.landlord?.name || "-"} ({selected.landlord?.email || "-"})</Typography>
                {selected.photos && selected.photos.length > 1 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {selected.photos.slice(1).map((url, idx) => (
                      <img key={idx} src={url} alt={`Photo ${idx+2}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
                    ))}
                  </Box>
                )}
              </>
            )}
          </Box>
          {/* Application Form (Right) */}
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Rental Application</Typography>
            {existingApp ? (
              <Box sx={{ color: existingApp.status === "pending" ? "#f39c12" : existingApp.status === "approved" ? "#27ae60" : "#e74c3c", mb: 2 }}>
                {existingApp.status === "pending" && "You have a pending application for this unit."}
                {existingApp.status === "approved" && "Your application for this unit is approved."}
                {existingApp.status === "rejected" && "Your application for this unit was rejected."}
              </Box>
            ) : (
              <>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={name}
                  onChange={e => setName(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Email"
                  fullWidth
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Message to landlord"
                  fullWidth
                  multiline
                  minRows={2}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Upload ID (required):</Typography>
                  <input type="file" accept="image/*,.pdf" onChange={e => setIdFile(e.target.files[0])} />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Upload Proof of Income (required):</Typography>
                  <input type="file" accept="image/*,.pdf" onChange={e => setIncomeFile(e.target.files[0])} />
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={applyApartment} variant="contained" disabled={submitting || !!existingApp}>
            {submitting ? "Submitting..." : "Apply for Unit"}
          </Button>
          <Button onClick={closeModal}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showApprovalAlert} autoHideDuration={6000} onClose={() => setShowApprovalAlert(false)}>
        <Alert onClose={() => setShowApprovalAlert(false)} severity="success" sx={{ width: '100%' }}>
          Your application has been approved! Please proceed to the Payments tab to review your contract and submit payment.
        </Alert>
      </Snackbar>

      <Box
        sx={{
          background: "#2c3e50",
          color: "#fff",
          textAlign: "center",
          py: 3,
          mt: 6,
        }}
        component="footer"
      >
        <Typography>© 2026 Soleia Apartment Rentals</Typography>
      </Box>
    </Box>
  );
}

export default App;