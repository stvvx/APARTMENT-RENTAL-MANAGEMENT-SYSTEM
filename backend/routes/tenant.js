import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { getTenantLeaseInfo, updateTenantProfile, getWishlist, addToWishlist, removeFromWishlist, applyAsLandlord } from '../controller/tenantController.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, 'uploads/');
	},
	filename: (_req, file, cb) => {
		const extension = path.extname(file.originalname || '').toLowerCase();
		cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
	}
});

const upload = multer({
	storage,
	fileFilter: (_req, file, cb) => {
		const allowedMimeTypes = new Set([
			'application/pdf',
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/webp'
		]);

		if (!allowedMimeTypes.has(file.mimetype)) {
			return cb(new Error('Only PDF and image files (JPG/PNG/WEBP) are allowed.'));
		}

		cb(null, true);
	},
	limits: {
		fileSize: 10 * 1024 * 1024,
	}
});

// Tenant: Get current unit assignment and lease terms
router.get('/lease', authenticateToken, authorizeRoles('tenant'), getTenantLeaseInfo);
// Tenant: Update personal profile information
router.put('/profile', authenticateToken, authorizeRoles('tenant'), updateTenantProfile);
// Tenant: Wishlist operations
router.get('/wishlist', authenticateToken, authorizeRoles('tenant'), getWishlist);
router.post('/wishlist/add', authenticateToken, authorizeRoles('tenant'), addToWishlist);
router.post('/wishlist/remove', authenticateToken, authorizeRoles('tenant'), removeFromWishlist);
// Tenant: Apply as Landlord
router.post('/apply-landlord', authenticateToken, authorizeRoles('tenant'), upload.single('idDocument'), applyAsLandlord);

export default router;
