import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { getTenantLeaseInfo, updateTenantProfile, getWishlist, addToWishlist, removeFromWishlist, applyAsLandlord } from '../controller/tenantController.js';

const router = express.Router();

// Tenant: Get current unit assignment and lease terms
router.get('/lease', authenticateToken, authorizeRoles('tenant'), getTenantLeaseInfo);
// Tenant: Update personal profile information
router.put('/profile', authenticateToken, authorizeRoles('tenant'), updateTenantProfile);
// Tenant: Wishlist operations
router.get('/wishlist', authenticateToken, authorizeRoles('tenant'), getWishlist);
router.post('/wishlist/add', authenticateToken, authorizeRoles('tenant'), addToWishlist);
router.post('/wishlist/remove', authenticateToken, authorizeRoles('tenant'), removeFromWishlist);
// Tenant: Apply as Landlord (no ID upload)
router.post('/apply-landlord', authenticateToken, authorizeRoles('tenant'), applyAsLandlord);

export default router;
