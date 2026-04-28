import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import LandlordDashboard from "./Landlord/Landlord_dashboard";
import TenantDashboard from "./User/Tenant_dashboard";
import AdminDashboard from "./Admin/Admin_dashboard";
import AdminUsers from "./Admin/Users";
import ApartmentListings from "./Admin/ApartmentListings";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ApartmentDetails from "./ApartmentDetails";
import Wishlist from "./User/Wishlist";
import ProfileTab from "./User/ProfileTab";
import ApplicationStatus from "./User/ApplicationStatus";
import PaymentsTab from "./User/PaymentsTab";
import Contact from "./User/Contact";
import Footer from "./components/Footer";
import AdminReservation from "./Admin/Admin_reservation";
import ReservationFeePage from "./User/ReservationFeePage";

export default function App() {
  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/apartments"
              element={
                <ProtectedAdminRoute>
                  <ApartmentListings />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedAdminRoute>
                  <AdminUsers />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/reservations"
              element={
                <ProtectedAdminRoute>
                  <AdminReservation />
                </ProtectedAdminRoute>
              }
            />
            <Route path="/apartment/:id" element={<ApartmentDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<ProfileTab />} />
            <Route path="/applications" element={<ApplicationStatus />} />
            <Route path="/payments" element={<PaymentsTab />} />
            <Route path="/reservation-fee/:paymentId" element={<ReservationFeePage />} />
            <Route path="/reservation-fee" element={<ReservationFeePage />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
