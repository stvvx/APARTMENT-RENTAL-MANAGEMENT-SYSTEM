import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  getPendingLandlords,
  updateLandlordApproval,
  getAllUsers,
  getAllApartments,
  getAllApplications,
  updateUserStatus,
  getDashboardMetrics
} from '../controller/adminController.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateToken, authorizeRoles('admin'));

// View all pending landlord registrations
router.get('/landlords/pending', getPendingLandlords);
// Approve/reject landlord
router.patch('/landlords/:id/approval', updateLandlordApproval);
// View all users
router.get('/users', getAllUsers);
// Suspend/deactivate user
router.patch('/users/:id/status', updateUserStatus);
// View all apartments
router.get('/apartments', getAllApartments);
// View all applications
router.get('/applications', getAllApplications);
// Admin dashboard metrics
router.get('/dashboard/metrics', getDashboardMetrics);

export default router;
