import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  getPendingLandlords,
  updateLandlordApproval,
  getAllUsers,
  getAllApartments,
  getAllApplications,
  updateUserStatus,
  getDashboardMetrics,
  getLandlordApplications,
  approveLandlord,
  rejectLandlord,
  toggleUserActive,
  changeUserRole,
  deleteUser,
  getApartmentsByDistrict,
  getUnitTypeDistribution,
  getBookingsTrend,
  getDashboardStats
} from '../controller/adminController.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateToken, authorizeRoles('admin'));

// Dashboard chart data endpoints
router.get('/chart/apartments-by-district', getApartmentsByDistrict);
router.get('/chart/unit-type-distribution', getUnitTypeDistribution);
router.get('/chart/bookings-trend', getBookingsTrend);
router.get('/chart/dashboard-stats', getDashboardStats);

// View all pending landlord registrations
router.get('/landlords/pending', getPendingLandlords);
// Approve/reject landlord
router.patch('/landlords/:id/approval', updateLandlordApproval);
// View all users
router.get('/users', getAllUsers);
// Get all landlord applications
router.get('/landlord-applications', getLandlordApplications);
// Approve landlord application
router.put('/approve-landlord/:userId', approveLandlord);
// Reject landlord application
router.put('/reject-landlord/:userId', rejectLandlord);
// Toggle user active status (deactivate/activate)
router.put('/users/:userId/toggle-active', toggleUserActive);
// Change user role
router.put('/users/:userId/role', changeUserRole);
// Delete user
router.delete('/users/:userId', deleteUser);
// Suspend/deactivate user (legacy)
router.patch('/users/:id/status', updateUserStatus);
// View all apartments
router.get('/apartments', getAllApartments);
// View all applications
router.get('/applications', getAllApplications);
// Admin dashboard metrics
router.get('/dashboard/metrics', getDashboardMetrics);

export default router;
