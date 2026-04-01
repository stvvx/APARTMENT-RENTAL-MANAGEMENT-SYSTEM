import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import LandlordDashboard from "./Landlord/Landlord_dashboard";
import TenantDashboard from "./User/Tenant_dashboard";
import ApartmentDetails from "./ApartmentDetails";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        <Route path="/apartment/:id" element={<ApartmentDetails />} />
      </Routes>
    </Router>
  );
}
