import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TenantHeader from "../header/tenant_header";

const API_URL = "http://localhost:5000/api/auth/register";

export default function Register() {
  const [role, setRole] = useState("tenant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess("Registration successful! Redirecting to login...");
      setName(""); setEmail(""); setPassword("");
      setTimeout(() => navigate("/login"), 1200); // Redirect to login after 1.2s
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <TenantHeader />
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f9" }}>
        <Paper sx={{ p: 4, width: 350 }} elevation={4}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>Register</Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Full Name" fullWidth sx={{ mb: 2 }} value={name} onChange={e => setName(e.target.value)} required />
            <TextField label="Email" type="email" fullWidth sx={{ mb: 2 }} value={email} onChange={e => setEmail(e.target.value)} required />
            <TextField label="Password" type="password" fullWidth sx={{ mb: 2 }} value={password} onChange={e => setPassword(e.target.value)} required />
            <TextField select label="Role" fullWidth sx={{ mb: 2 }} value={role} onChange={e => setRole(e.target.value)}>
              <MenuItem value="tenant">Tenant</MenuItem>
              <MenuItem value="landlord">Landlord</MenuItem>
            </TextField>
            {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
            {success && <Typography color="success.main" sx={{ mb: 1 }}>{success}</Typography>}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>Register</Button>
          </form>
        </Paper>
      </Box>
    </>
  );
}
