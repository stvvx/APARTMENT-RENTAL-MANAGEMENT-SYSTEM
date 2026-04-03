import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

export default function TenantManagement() {
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState({});
  const [tenantProfile, setTenantProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch applications for landlord's apartments
  useEffect(() => {
    fetch("http://localhost:5000/api/applications/landlord", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setApplications(Array.isArray(data) ? data : data.applications || []));
  }, [token]);

  // Fetch payments for landlord
  useEffect(() => {
    fetch("http://localhost:5000/api/payments/landlord", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const paymentsByApartment = {};
          data.forEach(payment => {
            const apartmentId = payment.apartment?._id || payment.apartment;
            if (!paymentsByApartment[apartmentId]) {
              paymentsByApartment[apartmentId] = [];
            }
            paymentsByApartment[apartmentId].push(payment);
          });
          setPayments(paymentsByApartment);
        }
      })
      .catch(err => console.error('Error fetching payments:', err));
  }, [token]);

  // Approve or reject application
  const handleStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/applications/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    // Refresh applications
    fetch("http://localhost:5000/api/applications/landlord", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setApplications(Array.isArray(data) ? data : data.applications || []));
  };

  // View tenant profile/history
  const handleViewProfile = async (tenant) => {
    // Fetch tenant profile (replace endpoint as needed)
    const res = await fetch(`http://localhost:5000/api/users/${tenant._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setTenantProfile(data);
    setProfileOpen(true);
  };

  // Remove/end contract (set status to ended or remove tenant from unit)
  const handleEndContract = async (applicationId) => {
    if (!window.confirm("Are you sure you want to end this lease contract? The apartment will become available for new applications.")) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "ended" })
      });
      if (!res.ok) {
        const errData = await res.json();
        alert("Error ending contract: " + (errData.message || "Unknown error"));
        return;
      }
      // Refresh applications
      const res2 = await fetch("http://localhost:5000/api/applications/landlord", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res2.json();
      setApplications(Array.isArray(data) ? data : data.applications || []);
      alert("Contract ended successfully!");
    } catch (err) {
      console.error("Error ending contract:", err);
      alert("Error ending contract: " + err.message);
    }
  };

  // View application details
  const handleViewApplication = (app) => {
    setSelectedApplication(app);
    setApplicationOpen(true);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#2c3e50", fontWeight: "bold" }}>
        Tenant Management
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Applicant</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Monthly Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app, idx) => {
              const apartmentId = app.apartment?._id;
              const apartmentPayments = payments[apartmentId] || [];
              const latestPayment = apartmentPayments.length > 0 ? apartmentPayments[apartmentPayments.length - 1] : null;
              
              return (
                <TableRow key={idx}>
                  <TableCell>{app.tenant?.name || "-"}</TableCell>
                  <TableCell>{app.apartment?.title || app.apartment?.unitType || "-"}</TableCell>
                  <TableCell>
                    {app.status === "pending" && <Typography color="warning.main" sx={{ fontWeight: "bold" }}>Pending</Typography>}
                    {app.status === "approved" && <Typography color="success.main" sx={{ fontWeight: "bold" }}>Approved</Typography>}
                    {app.status === "rejected" && <Typography color="error" sx={{ fontWeight: "bold" }}>Rejected</Typography>}
                    {app.status === "ended" && <Typography sx={{ color: "#616161", fontWeight: "bold" }}>Contract Ended</Typography>}
                    {app.status === "cancelled" && <Typography sx={{ color: "#9e9e9e", fontWeight: "bold" }}>Cancelled</Typography>}
                  </TableCell>
                  <TableCell>
                    {app.status === "approved" ? (
                      latestPayment ? (
                        <Box>
                          <Typography variant="body2">
                            {latestPayment.status === "paid" && <span style={{ color: "#27ae60", fontWeight: "bold" }}>✓ Paid</span>}
                            {latestPayment.status === "unpaid" && <span style={{ color: "#e74c3c", fontWeight: "bold" }}>⚠ Unpaid</span>}
                            {latestPayment.status === "partial" && <span style={{ color: "#f39c12", fontWeight: "bold" }}>⚠ Partial</span>}
                            {latestPayment.status === "late" && <span style={{ color: "#c0392b", fontWeight: "bold" }}>✕ Late</span>}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "gray" }}>
                            ₱{latestPayment.amount?.toLocaleString() || 0} due {new Date(latestPayment.dueDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: "gray" }}>- No payment yet</Typography>
                      )
                    ) : (
                      <Typography variant="body2" sx={{ color: "gray" }}>-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleViewApplication(app)} sx={{ mr: 1 }}>View </Button>
                    {app.status === "pending" && (
                      <>
                        <Button size="small" color="success" onClick={() => handleStatus(app._id, "approved")}>Approve</Button>
                        <Button size="small" color="error" onClick={() => handleStatus(app._id, "rejected")}>Reject</Button>
                      </>
                    )}
                    {app.status === "approved" && (
                      <>
                        <Button size="small" onClick={() => handleViewProfile(app.tenant)}>Profile</Button>
                        <Button size="small" color="warning" onClick={() => handleEndContract(app._id)}>End Lease</Button>
                      </>
                    )}
                    {app.status === "rejected" && <Typography variant="caption" color="error">Rejected</Typography>}
                    {app.status === "ended" && <Typography variant="caption" sx={{ color: "#616161" }}>Lease Ended</Typography>}
                    {app.status === "cancelled" && <Typography variant="caption" sx={{ color: "#9e9e9e" }}>Cancelled</Typography>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Tenant Profile Dialog */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tenant Profile</DialogTitle>
        <DialogContent>
          {tenantProfile ? (
            <>
              <Typography><b>Name:</b> {tenantProfile.name}</Typography>
              <Typography><b>Email:</b> {tenantProfile.email}</Typography>
              {/* Add more profile/history info as needed */}
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Application Details Dialog */}
      <Dialog open={applicationOpen} onClose={() => setApplicationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          {selectedApplication ? (
            <>
              <Typography><b>Applicant:</b> {selectedApplication.tenant?.name || "-"}</Typography>
              <Typography><b>Email:</b> {selectedApplication.tenant?.email || "-"}</Typography>
              <Typography><b>Apartment:</b> {selectedApplication.apartment?.title || selectedApplication.apartment?.unitType || "-"}</Typography>
              <Typography><b>Status:</b> {selectedApplication.status}</Typography>
              {selectedApplication.message && (
                <Typography sx={{ mt: 1 }}><b>Message:</b> {selectedApplication.message}</Typography>
              )}
              {/* Document Previews */}
              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ mb: 1 }}><b>Documents:</b></Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {selectedApplication.documents.map((doc, idx) => (
                      doc.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                          key={idx}
                          src={doc}
                          alt={`Document ${idx+1}`}
                          style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6, border: '1px solid #ccc' }}
                        />
                      ) : (
                        <a key={idx} href={doc} target="_blank" rel="noopener noreferrer">
                          View Document {idx+1}
                        </a>
                      )
                    ))}
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplicationOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
