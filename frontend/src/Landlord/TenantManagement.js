import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

export default function TenantManagement() {
  const [applications, setApplications] = useState([]);
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
    await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: "ended" })
    });
    // Refresh applications
    fetch("http://localhost:5000/api/applications/landlord", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setApplications(Array.isArray(data) ? data : data.applications || []));
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app, idx) => (
              <TableRow key={idx}>
                <TableCell>{app.tenant?.name || "-"}</TableCell>
                <TableCell>{app.apartment?.title || app.apartment?.unitType || "-"}</TableCell>
                <TableCell>{app.status}</TableCell>
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
                      <Button size="small" onClick={() => handleViewProfile(app.tenant)}>View Profile</Button>
                      <Button size="small" color="warning" onClick={() => handleEndContract(app._id)}>End Contract</Button>
                    </>
                  )}
                  {app.status === "rejected" && <Typography color="error">Rejected</Typography>}
                  {app.status === "ended" && <Typography color="warning.main">Ended</Typography>}
                </TableCell>
              </TableRow>
            ))}
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
