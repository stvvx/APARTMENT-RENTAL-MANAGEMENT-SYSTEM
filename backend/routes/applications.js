import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  applyForApartment,
  getMyApplications,
  getMyApprovedApplications,
  getApplicationsForMyApartments,
  updateApplicationStatus
} from '../controller/applicationController.js';

const router = express.Router();

// Tenant applies for an apartment
router.post('/', authenticateToken, authorizeRoles('tenant'), applyForApartment);

// Tenant views their applications
router.get('/mine', authenticateToken, authorizeRoles('tenant'), getMyApplications);

// Tenant views their approved applications
router.get('/approved', authenticateToken, authorizeRoles('tenant'), getMyApprovedApplications);

// Landlord views all applications for their apartments
router.get('/landlord', authenticateToken, authorizeRoles('landlord'), getApplicationsForMyApartments);

// Landlord or tenant can update application status (approve/reject/cancel)
router.patch('/:id/status', authenticateToken, authorizeRoles('tenant', 'landlord'), updateApplicationStatus);

export default router;
