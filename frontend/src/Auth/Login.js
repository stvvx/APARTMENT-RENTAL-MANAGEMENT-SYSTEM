import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TenantHeader from "../header/tenant_header";

const API_URL = "http://localhost:5000/api/auth/login";

export default function Login() {
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
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setSuccess("Login successful!");
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      setTimeout(() => {
        if (data.user.role === "landlord") {
          navigate("/landlord/dashboard");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <TenantHeader />
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f9" }}>
        <Paper sx={{ p: 4, width: 350 }} elevation={4}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>Login</Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Email" type="email" fullWidth sx={{ mb: 2 }} value={email} onChange={e => setEmail(e.target.value)} required />
            <TextField label="Password" type="password" fullWidth sx={{ mb: 2 }} value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
            {success && <Typography color="success.main" sx={{ mb: 1 }}>{success}</Typography>}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>Login</Button>
          </form>
        </Paper>
      </Box>
    </>
  );
}
