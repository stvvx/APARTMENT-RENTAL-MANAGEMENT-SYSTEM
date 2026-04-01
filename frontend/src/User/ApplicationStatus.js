import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Button, Tabs, Tab } from "@mui/material";
import { jwtDecode } from "jwt-decode";

export default function ApplicationStatus({ openApartmentModal, onCancel }) {
  const [applications, setApplications] = useState([]);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [tab, setTab] = useState(0);
  const token = localStorage.getItem("token");
  let currentUserId = null;
  try {
    if (token) {
      const decoded = jwtDecode(token);
      currentUserId = decoded.userId || decoded.id || decoded._id;
    }
  } catch {}

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/applications/mine", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : data.applications || []);
      } catch {
        setApplications([]);
      }
      setLoading(false);
    }
    async function fetchApprovedApplications() {
      try {
        const res = await fetch("http://localhost:5000/api/applications/approved", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setApprovedApplications(Array.isArray(data) ? data : data.applications || []);
      } catch {
        setApprovedApplications([]);
      }
    }
    fetchApplications();
    fetchApprovedApplications();
  }, [token]);

  // Cancel application handler
  const handleCancel = async (appId) => {
    if (!window.confirm("Are you sure you want to cancel this application?")) return;
    setCancellingId(appId);
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "cancelled" })
      });
      if (!res.ok) {
        let msg = "Failed to cancel application.";
        try {
          const errData = await res.json();
          if (errData && errData.message) msg = errData.message;
        } catch {}
        alert(msg);
        setCancellingId(null);
        return;
      }
      // Refresh applications
      const res2 = await fetch("http://localhost:5000/api/applications/mine", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res2.json();
      setApplications(Array.isArray(data) ? data : data.applications || []);
      if (onCancel) onCancel();
    } catch (err) {
      alert("Error cancelling application.");
    }
    setCancellingId(null);
  };

  // Helper for viewing approved apartment details
  const handleViewApprovedApartment = async (apartmentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/apartments/tenant/${apartmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Unable to fetch apartment details.');
      const data = await res.json();
      openApartmentModal(data); // Pass full apartment object to modal
    } catch (err) {
      alert('Could not load apartment details.');
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, color: "#2c3e50", fontWeight: "bold" }}>
        My Rental Applications
      </Typography>
      {currentUserId && (
        <Typography variant="body2" sx={{ mb: 2, color: 'gray' }}>
          <b>Current User ID:</b> {currentUserId}
        </Typography>
      )}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="All Applications" />
        <Tab label="My Rentals (Approved)" />
      </Tabs>
      {tab === 0 && (
        loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : applications.length === 0 ? (
          <Typography>No applications found.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Apartment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Tenant ID (debug)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{app.apartment?.title || app.apartment?.unitType || "-"}</Typography>
                        {['approved', 'rejected'].includes(app.status) ? (
                          <Button size="small" onClick={() => handleViewApprovedApartment(app.apartment._id)} sx={{ mt: 1 }}>
                            View Apartment
                          </Button>
                        ) : (
                          <Button size="small" onClick={() => openApartmentModal(app.apartment._id)} sx={{ mt: 1 }}>
                            View Apartment
                          </Button>
                        )}
                        {(app.status === "pending" || app.status === "approved") && (
                          <Button size="small" color="error" sx={{ mt: 1, ml: 1 }} onClick={() => handleCancel(app._id)} disabled={cancellingId === app._id}>
                            {cancellingId === app._id ? "Cancelling..." : "Cancel"}
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {app.status === "pending" && <Typography color="warning.main">Pending</Typography>}
                      {app.status === "approved" && <Typography color="success.main">Approved</Typography>}
                      {app.status === "rejected" && <Typography color="error">Rejected</Typography>}
                    </TableCell>
                    <TableCell>{app.createdAt ? new Date(app.createdAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>{app.message || "-"}</TableCell>
                    <TableCell>{app.tenant ? app.tenant : (app.tenant?._id || "-")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Apartment</TableCell>
                <TableCell>Landlord</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Lease Start</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amenities</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {approvedApplications.map((app, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Typography variant="subtitle2">{app.apartment?.title || app.apartment?.unitType || "-"}</Typography>
                  </TableCell>
                  <TableCell>{app.apartment?.landlord?.name || "-"} ({app.apartment?.landlord?.email || "-"})</TableCell>
                  <TableCell>₱{app.apartment?.price ? app.apartment.price.toLocaleString() : "-"}/month</TableCell>
                  <TableCell>{app.apartment?.availableFrom ? new Date(app.apartment.availableFrom).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{app.apartment?.address || "-"}</TableCell>
                  <TableCell>{app.apartment?.description || "-"}</TableCell>
                  <TableCell>{Array.isArray(app.apartment?.amenities) ? app.apartment.amenities.join(", ") : (app.apartment?.amenities || "-")}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleViewApprovedApartment(app.apartment._id)} sx={{ mt: 1 }}>
                      View Apartment
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
