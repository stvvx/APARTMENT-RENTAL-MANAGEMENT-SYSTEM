import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from "@mui/material";

export default function PaymentsTab({ payForApartment }) {
  const [balance, setBalance] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      try {
        const [balRes, recRes, notifRes] = await Promise.all([
          fetch("http://localhost:5000/api/payments/tenant/balance", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/payments/tenant/receipts", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/payments/tenant/notifications", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const balData = await balRes.json();
        const recData = await recRes.json();
        const notifData = await notifRes.json();
        setBalance(balData);
        setReceipts(Array.isArray(recData) ? recData : []);
        setNotifications(Array.isArray(notifData) ? notifData : []);
      } catch {
        setBalance(null);
        setReceipts([]);
        setNotifications([]);
      }
      setLoading(false);
    }
    fetchPayments();
  }, [token]);

  if (payForApartment) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2, color: "#2c3e50", fontWeight: "bold" }}>
          Contract & Payment for {payForApartment.title || payForApartment.unitType}
        </Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Contract Rules</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please review your contract and payment rules carefully. Minimum lease term: {payForApartment.minLeaseTerm || "-"}. Deposit: ₱{payForApartment.deposit?.toLocaleString() || 0}. Advance: ₱{payForApartment.advance?.toLocaleString() || 0}. Other rules may apply as per landlord.
          </Typography>
          {/* Add more contract details as needed */}
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Submit Payment</Typography>
          {/* Payment form UI goes here */}
          <Typography variant="body2">(Payment form coming soon...)</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, color: "#2c3e50", fontWeight: "bold" }}>
        Payment & Billing
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Alert severity={balance && balance.outstanding > 0 ? "warning" : "success"} sx={{ mb: 2 }}>
            {balance ? `Outstanding Balance: ₱${balance.outstanding?.toLocaleString() || 0}` : "No balance info."}
          </Alert>
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Upcoming/Overdue Payments</Typography>
          {notifications.length === 0 ? <Typography>No upcoming or overdue payments.</Typography> : (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Apartment</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{p.apartment?.title || p.apartment?.unitType || "-"}</TableCell>
                      <TableCell>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>₱{p.amount?.toLocaleString() || 0}</TableCell>
                      <TableCell>{p.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Payment History & Receipts</Typography>
          {receipts.length === 0 ? <Typography>No payment history found.</Typography> : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Apartment</TableCell>
                    <TableCell>Paid Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Landlord</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receipts.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{p.apartment?.title || p.apartment?.unitType || "-"}</TableCell>
                      <TableCell>{p.paidDate ? new Date(p.paidDate).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>₱{p.amount?.toLocaleString() || 0}</TableCell>
                      <TableCell>{p.method || "-"}</TableCell>
                      <TableCell>{p.landlord?.name || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
}
