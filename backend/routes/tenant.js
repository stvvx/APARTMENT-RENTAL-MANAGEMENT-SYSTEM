import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { getTenantLeaseInfo, updateTenantProfile } from '../controller/tenantController.js';

const router = express.Router();

// Tenant: Get current unit assignment and lease terms
router.get('/lease', authenticateToken, authorizeRoles('tenant'), getTenantLeaseInfo);
// Tenant: Update personal profile information
router.put('/profile', authenticateToken, authorizeRoles('tenant'), updateTenantProfile);

export default router;
