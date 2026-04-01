import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, CardMedia, Button, CircularProgress, Container } from "@mui/material";

export default function ApartmentDetails() {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchApartment() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/apartments/${id}`);
        const data = await res.json();
        setApartment(data);
      } catch {
        setApartment(null);
      }
      setLoading(false);
    }
    fetchApartment();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (!apartment) return <Typography sx={{ mt: 6, textAlign: 'center' }}>Apartment not found.</Typography>;

  return (
    <Container sx={{ py: 6 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
      <CardMedia
        component="img"
        height="300"
        image={apartment.photos && apartment.photos.length > 0 ? apartment.photos[0] : "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"}
        alt={apartment.title || apartment.unitType}
        sx={{ borderRadius: 2, mb: 2 }}
      />
      <Typography variant="h4" sx={{ mb: 2 }}>{apartment.title || apartment.unitType}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Unit Number:</b> {apartment.unitNumber || "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Building Name:</b> {apartment.buildingName || "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Area:</b> {apartment.area ? `${apartment.area} sqm` : "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Floor:</b> {apartment.floor || "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Unit Type:</b> {apartment.unitType || "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Bedrooms:</b> {apartment.bedrooms || (apartment.unitType && apartment.unitType.toLowerCase() === 'studio' ? 1 : "-")}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Bathrooms:</b> {apartment.bathrooms || "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Furnishing:</b> {apartment.furnishing || "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Amenities:</b> {apartment.amenities && apartment.amenities.length ? apartment.amenities.join(', ') : "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Pet Policy:</b> {apartment.petPolicy || "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Deposit Amount:</b> {apartment.deposit ? `₱${apartment.deposit.toLocaleString()}` : "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Advance Payment:</b> {apartment.advance ? `₱${apartment.advance.toLocaleString()}` : "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Minimum Lease Term:</b> {apartment.minLeaseTerm || "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Available From:</b> {apartment.availableFrom ? new Date(apartment.availableFrom).toLocaleDateString() : "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Utilities Included:</b> {apartment.utilitiesIncluded && apartment.utilitiesIncluded.length ? apartment.utilitiesIncluded.join(', ') : "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Description:</b> {apartment.description || "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Special Notes:</b> {apartment.specialNotes || "-"}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}><b>Landlord:</b> {apartment.landlord?.name || "-"} ({apartment.landlord?.email || "-"})</Typography>
      {apartment.photos && apartment.photos.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          {apartment.photos.slice(1).map((url, idx) => (
            <img key={idx} src={url} alt={`Photo ${idx+2}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
          ))}
        </Box>
      )}
    </Container>
  );
}
