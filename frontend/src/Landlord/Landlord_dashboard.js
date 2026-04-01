import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Container, Grid, Card, CardMedia, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch, Tabs, Tab
} from "@mui/material";
import cloudinaryConfig from "../cloudinaryConfig";
import LandlordHeader from "../header/landlord_header";
import TenantManagement from "./TenantManagement";

const API_URL = "http://localhost:5000/api/apartments";

export default function LandlordDashboard() {
  const [apartments, setApartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    title: "",
    price: "",
    floor: "",
    unitType: "",
    photos: [],
    isAvailable: true,
    unitNumber: "",
    buildingName: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    furnishing: "",
    amenities: "",
    petPolicy: "",
    deposit: "",
    advance: "",
    minLeaseTerm: "",
    availableFrom: "",
    utilitiesIncluded: "",
    specialNotes: ""
  });
  const [selectedId, setSelectedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState(0);
  const token = localStorage.getItem("token");

  const fetchApartments = () => {
    fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setApartments(Array.isArray(data) ? data : data.apartments || []));
  };

  useEffect(() => { fetchApartments(); }, []);

  const openAddModal = () => {
    setForm({
      title: "",
      price: "",
      floor: "",
      unitType: "",
      photos: [],
      isAvailable: true,
      unitNumber: "",
      buildingName: "",
      area: "",
      bedrooms: "",
      bathrooms: "",
      furnishing: "",
      amenities: "",
      petPolicy: "",
      deposit: "",
      advance: "",
      minLeaseTerm: "",
      availableFrom: "",
      utilitiesIncluded: "",
      specialNotes: ""
    });
    setEditMode(false);
    setModalOpen(true);
    setSelectedId(null);
  };

  const openEditModal = (apt) => {
    const isStudio = apt.unitType && apt.unitType.toLowerCase() === 'studio';
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
      amenities: apt.amenities ? apt.amenities.join(', ') : "",
      petPolicy: apt.petPolicy || "",
      deposit: apt.deposit || "",
      advance: apt.advance || "",
      minLeaseTerm: apt.minLeaseTerm || "",
      availableFrom: apt.availableFrom ? apt.availableFrom.split('T')[0] : "",
      utilitiesIncluded: apt.utilitiesIncluded ? apt.utilitiesIncluded.join(', ') : "",
      specialNotes: apt.specialNotes || ""
    });
    setEditMode(true);
    setModalOpen(true);
    setSelectedId(apt._id);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({
      title: "",
      price: "",
      floor: "",
      unitType: "",
      photos: [],
      isAvailable: true,
      unitNumber: "",
      buildingName: "",
      area: "",
      bedrooms: "",
      bathrooms: "",
      furnishing: "",
      amenities: "",
      petPolicy: "",
      deposit: "",
      advance: "",
      minLeaseTerm: "",
      availableFrom: "",
      utilitiesIncluded: "",
      specialNotes: ""
    });
    setSelectedId(null);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    // If unitType is studio, force bedrooms to 1
    if (name === "unitType" && value.toLowerCase() === "studio") {
      setForm({ ...form, unitType: value, bedrooms: 1 });
      return;
    }
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Cloudinary multi-image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploadedUrls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", cloudinaryConfig.CLOUDINARY_PRESET_NAME); // Use config
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      uploadedUrls.push(data.secure_url);
    }
    setForm(f => ({ ...f, photos: uploadedUrls }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `${API_URL}/${selectedId}` : API_URL;
    // Convert amenities and utilitiesIncluded to arrays
    const payload = {
      ...form,
      photos: form.photos,
      amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
      utilitiesIncluded: form.utilitiesIncluded ? form.utilitiesIncluded.split(',').map(u => u.trim()).filter(Boolean) : []
    };
    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    fetchApartments();
    closeModal();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchApartments();
  };

  return (
    <>
      <LandlordHeader />
      <Box sx={{ background: "#f4f6f9", minHeight: "100vh" }}>
        <Container sx={{ py: 6 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4 }}>
            <Tab label="My Apartments" />
            <Tab label="Tenant Management" />
          </Tabs>
          {tab === 0 && (
            <>
              <Typography variant="h4" sx={{ mb: 4, color: "#2c3e50", fontWeight: "bold" }}>
                My Apartments
              </Typography>
              <Button variant="contained" sx={{ mb: 3 }} onClick={openAddModal}>Add Apartment</Button>
              <Grid container spacing={4}>
                {apartments.length === 0 && (
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    No apartments found.
                  </Typography>
                )}
                {apartments.map((apt, idx) => (
                  <Grid item key={idx} xs={12} sm={6} md={4}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={apt.photos && apt.photos[0] ? apt.photos[0] : "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"}
                        alt={apt.title || apt.unitType}
                      />
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{apt.title || apt.unitType}</Typography>
                        <Typography variant="body2" color="text.secondary">{apt.floor}</Typography>
                        <Typography variant="h6" sx={{ color: "#27ae60", mt: 1 }}>
                          ₱{apt.price ? apt.price.toLocaleString() : "N/A"}/month
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => openEditModal(apt)}>Edit</Button>
                        <Button size="small" color="error" onClick={() => handleDelete(apt._id)}>Delete</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Dialog open={modalOpen} onClose={closeModal}>
                <DialogTitle>{editMode ? "Edit Apartment" : "Add Apartment"}</DialogTitle>
                <form onSubmit={handleSubmit}>
                  <DialogContent>
                    <TextField label="Title" name="title" fullWidth sx={{ mb: 2 }} value={form.title} onChange={handleChange} required />
                    <TextField label="Unit Number" name="unitNumber" fullWidth sx={{ mb: 2 }} value={form.unitNumber} onChange={handleChange} />
                    <TextField label="Building Name" name="buildingName" fullWidth sx={{ mb: 2 }} value={form.buildingName} onChange={handleChange} />
                    <TextField label="Area (sqm)" name="area" type="number" fullWidth sx={{ mb: 2 }} value={form.area} onChange={handleChange} />
                    <TextField label="Price" name="price" type="number" fullWidth sx={{ mb: 2 }} value={form.price} onChange={handleChange} required />
                    <TextField label="Floor" name="floor" fullWidth sx={{ mb: 2 }} value={form.floor} onChange={handleChange} />
                    <TextField label="Unit Type" name="unitType" fullWidth sx={{ mb: 2 }} value={form.unitType} onChange={handleChange} />
                    <TextField label="Bedrooms" name="bedrooms" type="number" fullWidth sx={{ mb: 2 }} value={form.unitType.toLowerCase() === 'studio' ? 1 : form.bedrooms} onChange={handleChange} disabled={form.unitType.toLowerCase() === 'studio'} />
                    <TextField label="Bathrooms" name="bathrooms" type="number" fullWidth sx={{ mb: 2 }} value={form.bathrooms} onChange={handleChange} />
                    <TextField label="Furnishing" name="furnishing" fullWidth sx={{ mb: 2 }} value={form.furnishing} onChange={handleChange} />
                    <TextField label="Amenities (comma separated)" name="amenities" fullWidth sx={{ mb: 2 }} value={form.amenities} onChange={handleChange} />
                    <TextField label="Pet Policy" name="petPolicy" fullWidth sx={{ mb: 2 }} value={form.petPolicy} onChange={handleChange} />
                    <TextField label="Deposit Amount" name="deposit" type="number" fullWidth sx={{ mb: 2 }} value={form.deposit} onChange={handleChange} />
                    <TextField label="Advance Payment" name="advance" type="number" fullWidth sx={{ mb: 2 }} value={form.advance} onChange={handleChange} />
                    <TextField label="Minimum Lease Term" name="minLeaseTerm" fullWidth sx={{ mb: 2 }} value={form.minLeaseTerm} onChange={handleChange} />
                    <TextField label="Available From" name="availableFrom" type="date" fullWidth sx={{ mb: 2 }} value={form.availableFrom} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                    <TextField label="Utilities Included (comma separated)" name="utilitiesIncluded" fullWidth sx={{ mb: 2 }} value={form.utilitiesIncluded} onChange={handleChange} />
                    <TextField label="Special Notes" name="specialNotes" fullWidth sx={{ mb: 2 }} value={form.specialNotes} onChange={handleChange} />
                    <FormControlLabel
                      control={<Switch checked={form.isAvailable} onChange={handleChange} name="isAvailable" color="primary" />}
                      label={form.isAvailable ? "Available" : "Not Available"}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ mb: 2 }}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : form.photos && form.photos.length ? "Change Photos" : "Upload Photos"}
                      <input type="file" accept="image/*" hidden multiple onChange={handleImageUpload} />
                    </Button>
                    {form.photos && form.photos.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {form.photos.map((url, idx) => (
                          <img key={idx} src={url} alt={`Preview ${idx+1}`} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 6 }} />
                        ))}
                      </Box>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button type="submit" variant="contained">{editMode ? "Update" : "Add"}</Button>
                    <Button onClick={closeModal}>Cancel</Button>
                  </DialogActions>
                </form>
              </Dialog>
            </>
          )}
          {tab === 1 && <TenantManagement />}
        </Container>
      </Box>
    </>
  );
}
