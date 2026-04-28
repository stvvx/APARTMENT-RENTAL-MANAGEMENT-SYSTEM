import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from "@mui/material";

export default function TenantManagement() {
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState({});
  const [reservationPayments, setReservationPayments] = useState({});
  const [tenantProfile, setTenantProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const token = localStorage.getItem("token");

  const formatMoney = (v) => {
    const n = Number(v || 0);
    return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const normalizeStatus = (s) => String(s || "").toLowerCase();

  const statusPill = (status) => {
    const s = normalizeStatus(status);
    if (s === "paid") return <span style={{ color: "#27ae60", fontWeight: "bold" }}>✓ Paid</span>;
    if (s === "pending") return <span style={{ color: "#2980b9", fontWeight: "bold" }}>⌛ Pending</span>;
    if (s === "unpaid") return <span style={{ color: "#e74c3c", fontWeight: "bold" }}>⚠ Unpaid</span>;
    if (s === "partial") return <span style={{ color: "#f39c12", fontWeight: "bold" }}>⚠ Partial</span>;
    if (s === "late") return <span style={{ color: "#c0392b", fontWeight: "bold" }}>✕ Late</span>;
    return <span style={{ color: "#616161", fontWeight: "bold" }}>{String(status || "-")}</span>;
  };

  const paymentSortKey = (p) => {
    // Prefer "proof of payment" timestamps, fallback to dueDate/createdAt.
    const t = p?.receiptUploadedAt || p?.createdAt || p?.dueDate;
    const ms = t ? new Date(t).getTime() : 0;
    return Number.isFinite(ms) ? ms : 0;
  };

  const getLatestPayment = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return [...arr].sort((a, b) => paymentSortKey(b) - paymentSortKey(a))[0];
  };

  const refreshPayments = useCallback(() => {
    fetch("http://localhost:5000/api/payments/landlord", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const paymentsByApartment = {};
          const reservationByApartment = {};

          data.forEach((payment) => {
            const apartmentId = payment.apartment?._id || payment.apartment;
            const pType = String(payment.paymentType || "rent").toLowerCase();

            if (pType === "reservation") {
              // keep the latest reservation payment per apartment
              const existing = reservationByApartment[apartmentId];
              if (!existing || paymentSortKey(payment) >= paymentSortKey(existing)) {
                reservationByApartment[apartmentId] = payment;
              }
              return;
            }

            if (!paymentsByApartment[apartmentId]) paymentsByApartment[apartmentId] = [];
            paymentsByApartment[apartmentId].push(payment);
          });

          setPayments(paymentsByApartment);
          setReservationPayments(reservationByApartment);
        }
      })
      .catch((err) => console.error("Error fetching payments:", err));
  }, [token]);

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
    refreshPayments();
  }, [refreshPayments]);

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

  const handleReviewRentReceipt = async (paymentId, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/payments/landlord/rent/${paymentId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.message || "Failed to review rent receipt.");
        return;
      }

      refreshPayments();
    } catch (err) {
      console.error("Error reviewing rent receipt:", err);
      alert("Error reviewing rent receipt: " + err.message);
    }
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
              <TableCell>Reservation Fee</TableCell>
              <TableCell>Monthly Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app, idx) => {
              const apartmentId = app.apartment?._id;
              const apartmentPayments = payments[apartmentId] || [];
              const latestPayment = getLatestPayment(apartmentPayments);
              const reservationP = reservationPayments[apartmentId] || null;

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

                  {/* Reservation Fee column */}
                  <TableCell>
                    {app.status === "approved" ? (
                      reservationP ? (
                        <Box>
                          <Typography variant="body2">
                            {statusPill(reservationP.status)}
                            <span style={{ color: "#9e9e9e" }}> — ₱{formatMoney(reservationP.amount)}</span>
                          </Typography>
                          <Typography variant="caption" sx={{ color: "gray" }}>
                            Method: {reservationP.method || "-"}
                            {reservationP.receiptUploadedAt ? ` • Uploaded ${new Date(reservationP.receiptUploadedAt).toLocaleString()}` : ""}
                          </Typography>
                          {reservationP.receiptUrl ? (
                            <Typography variant="caption" sx={{ display: "block" }}>
                              <a href={`http://localhost:5000${reservationP.receiptUrl}`} target="_blank" rel="noopener noreferrer">
                                View receipt
                              </a>
                            </Typography>
                          ) : null}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: "gray" }}>
                          - No reservation payment yet
                        </Typography>
                      )
                    ) : (
                      <Typography variant="body2" sx={{ color: "gray" }}>
                        -
                      </Typography>
                    )}
                  </TableCell>

                  {/* Monthly Payment (Apartment Payment) column */}
                  <TableCell>
                    {app.status === "approved" ? (
                      latestPayment ? (
                        <Box>
                          <Typography variant="body2">{statusPill(latestPayment.status)}</Typography>
                          <Typography variant="caption" sx={{ color: "gray", display: "block" }}>
                            ₱{formatMoney(latestPayment.amount)} due {latestPayment.dueDate ? new Date(latestPayment.dueDate).toLocaleDateString() : "-"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "gray", display: "block" }}>
                            Method: {latestPayment.method || "-"}
                            {latestPayment.receiptUploadedAt ? ` • Uploaded ${new Date(latestPayment.receiptUploadedAt).toLocaleString()}` : ""}
                          </Typography>
                          {latestPayment.receiptUrl ? (
                            <Typography variant="caption" sx={{ display: "block" }}>
                              <a href={`http://localhost:5000${latestPayment.receiptUrl}`} target="_blank" rel="noopener noreferrer">
                                View receipt
                              </a>
                            </Typography>
                          ) : null}

                          {normalizeStatus(latestPayment.status) === "pending" && (
                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                              <Button
                                size="small"
                                color="success"
                                variant="contained"
                                onClick={() => handleReviewRentReceipt(latestPayment._id, "approve")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() => handleReviewRentReceipt(latestPayment._id, "reject")}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: "gray" }}>
                          - No rent payment yet
                        </Typography>
                      )
                    ) : (
                      <Typography variant="body2" sx={{ color: "gray" }}>
                        -
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleViewApplication(app)} sx={{ mr: 1 }}>View</Button>
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
      <Dialog open={applicationOpen} onClose={() => setApplicationOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#2c3e50" }}>
            Application Details
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
            Review the tenant application, message, and provided documents.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {selectedApplication ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                  Applicant & Unit
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.25
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Applicant
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {selectedApplication.tenant?.name || "-"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {selectedApplication.tenant?.email || "-"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Unit
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {selectedApplication.apartment?.title || selectedApplication.apartment?.unitType || "-"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Status: <span style={{ fontWeight: 700 }}>{selectedApplication.status}</span>
                    </Typography>
                  </Box>
                </Box>

                {selectedApplication.message ? (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75 }}>
                      Message
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: "#f6f8fb",
                        border: "1px solid #e6eaf0",
                        p: 1.5,
                        borderRadius: 2,
                        whiteSpace: "pre-wrap"
                      }}
                    >
                      {selectedApplication.message}
                    </Typography>
                  </>
                ) : null}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                  Documents
                </Typography>

                {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {selectedApplication.documents.map((doc, idx) => {
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc || "");

                      if (isImage) {
                        return (
                          <a
                            key={idx}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none" }}
                          >
                            <Box
                              sx={{
                                width: 140,
                                borderRadius: 2,
                                overflow: "hidden",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                                transition: "transform 120ms ease"
                              }}
                            >
                              <img
                                src={doc}
                                alt={`Document ${idx + 1}`}
                                style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
                              />
                              <Box sx={{ p: 1 }}>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  Document {idx + 1}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#2c3e50" }}>
                                  View image
                                </Typography>
                              </Box>
                            </Box>
                          </a>
                        );
                      }

                      return (
                        <Paper
                          key={idx}
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            minWidth: 240,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2
                          }}
                        >
                          <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              Document {idx + 1}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              File link
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            component="a"
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open
                          </Button>
                        </Paper>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No documents uploaded.
                  </Typography>
                )}
              </Paper>
            </Box>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApplicationOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
