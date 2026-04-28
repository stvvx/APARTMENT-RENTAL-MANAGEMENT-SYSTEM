import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import multer from 'multer';
import {
  recordPayment,
  getPaymentsForLandlord,
  getPaymentsForTenant,
  getOutstandingBalance,
  getPaymentReceipts,
  getPaymentNotifications,
  submitTenantPayment,
  createReservationFeePayment,
  getLandlordContactForApartment,
  uploadReservationReceipt,
  uploadRentReceipt,
  adminListReservationReceipts,
  adminReviewReservationReceipt,
  landlordReviewRentReceipt
} from '../controller/paymentController.js';

const router = express.Router();

// Keep file extensions so uploaded receipts can be viewed easily in browsers
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const original = file.originalname || '';
      const idx = original.lastIndexOf('.');
      const ext = idx >= 0 ? original.slice(idx) : '';
      const safeExt = String(ext).toLowerCase().replace(/[^.a-z0-9]/g, '');
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${safeExt}`);
    },
  }),
});

// Landlord records payment
router.post('/', authenticateToken, authorizeRoles('landlord'), recordPayment);
// Landlord views all payments
router.get('/landlord', authenticateToken, authorizeRoles('landlord'), getPaymentsForLandlord);
// Tenant views their payments
router.get('/tenant', authenticateToken, authorizeRoles('tenant'), getPaymentsForTenant);
// Tenant submits payment (receipt-only: sets method + pending)
router.post('/tenant/pay', authenticateToken, authorizeRoles('tenant'), submitTenantPayment);
// Tenant: get outstanding balance
router.get('/tenant/balance', authenticateToken, authorizeRoles('tenant'), getOutstandingBalance);
// Tenant: get payment receipts
router.get('/tenant/receipts', authenticateToken, authorizeRoles('tenant'), getPaymentReceipts);
// Tenant: get payment due notifications
router.get('/tenant/notifications', authenticateToken, authorizeRoles('tenant'), getPaymentNotifications);
// Reservation fee: create/get reservation fee payment record
router.post('/tenant/reservation', authenticateToken, authorizeRoles('tenant'), createReservationFeePayment);
// Reservation fee: tenant uploads receipt (manual transaction)
router.post('/tenant/reservation/:paymentId/receipt', authenticateToken, authorizeRoles('tenant'), upload.single('receipt'), uploadReservationReceipt);
// Rent: tenant uploads receipt (manual transaction)
router.post('/tenant/rent/:paymentId/receipt', authenticateToken, authorizeRoles('tenant'), upload.single('receipt'), uploadRentReceipt);
// Reservation fee: reveal landlord contact info (only if reservation is approved/paid)
router.get('/tenant/apartment/:apartmentId/contact', authenticateToken, authorizeRoles('tenant'), getLandlordContactForApartment);
// Admin: list reservation receipts for review
router.get('/admin/reservations', authenticateToken, authorizeRoles('admin'), adminListReservationReceipts);
// Admin: approve/reject reservation receipt
router.patch('/admin/reservations/:paymentId/review', authenticateToken, authorizeRoles('admin'), adminReviewReservationReceipt);
// Landlord: approve/reject rent receipt payments
router.patch('/landlord/rent/:paymentId/review', authenticateToken, authorizeRoles('landlord'), landlordReviewRentReceipt);

export default router;
