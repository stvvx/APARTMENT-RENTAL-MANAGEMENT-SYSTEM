import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, TextField, Button, CircularProgress, Alert } from "@mui/material";

export default function ProfileTab() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [profileRes, leaseRes] = await Promise.all([
          fetch("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/tenant/lease", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const profileData = await profileRes.json();
        const leaseData = await leaseRes.json();
        setProfile({ name: profileData.name, email: profileData.email });
        setLease(leaseData);
      } catch {
        setError("Failed to load profile or lease info.");
      }
      setLoading(false);
    }
    if (isLoggedIn) fetchData();
    else setLoading(false);
  }, [token, isLoggedIn]);

  const handleChange = e => {
    setProfile(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/tenant/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name })
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setSuccess("Profile updated successfully.");
    } catch {
      setError("Failed to update profile.");
    }
    setSaving(false);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, color: "#2c3e50", fontWeight: "bold" }}>
        My Profile & Lease Info
      </Typography>
      {!isLoggedIn ? (
        <Alert severity="info">Please log in to view and edit your profile.</Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Personal Info</Typography>
            <TextField label="Name" name="name" value={profile.name} onChange={handleChange} sx={{ mb: 2, mr: 2 }} />
            <TextField label="Email" name="email" value={profile.email} InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
            <Button onClick={handleSave} variant="contained" sx={{ ml: 2 }} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Lease Info</Typography>
            {lease && lease.apartment ? (
              <>
                <Typography><b>Unit:</b> {lease.apartment.title || lease.apartment.unitType}</Typography>
                <Typography><b>Lease Start:</b> {lease.leaseStart ? new Date(lease.leaseStart).toLocaleDateString() : "-"}</Typography>
                <Typography><b>Lease End:</b> {lease.leaseEnd ? new Date(lease.leaseEnd).toLocaleDateString() : "-"}</Typography>
                <Typography><b>Terms:</b> {lease.terms || "Standard lease"}</Typography>
              </>
            ) : (
              <Typography>No active lease found.</Typography>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}
