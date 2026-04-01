import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";

export default function TenantHeader() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "#2c3e50", cursor: "pointer" }} onClick={() => navigate("/")}>
          Soleia Stays
        </Typography>
        <Button color="inherit" startIcon={<HomeIcon />} onClick={() => navigate("/")}>Home</Button>
        <Button color="inherit" startIcon={<ApartmentIcon />} onClick={() => navigate("/")}>Apartments</Button>
        <Button color="inherit" startIcon={<ContactMailIcon />} onClick={() => navigate("/")}>Contact</Button>
        {!token ? (
          <>
            <Button color="inherit" startIcon={<LoginIcon />} onClick={() => navigate("/login")}>Login</Button>
            <Button color="inherit" startIcon={<PersonAddIcon />} onClick={() => navigate("/register")}>Register</Button>
          </>
        ) : (
          <Box display="flex" alignItems="center">
            <Typography variant="body1" sx={{ mr: 2 }}>
              {user?.name || user?.email || "User"}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
