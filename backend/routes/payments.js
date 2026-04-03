import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  recordPayment,
  getPaymentsForLandlord,
  getPaymentsForTenant,
  getOutstandingBalance,
  getPaymentReceipts,
  getPaymentNotifications,
  submitTenantPayment
} from '../controller/paymentController.js';

const router = express.Router();

// Landlord records payment
router.post('/', authenticateToken, authorizeRoles('landlord'), recordPayment);
// Landlord views all payments
router.get('/landlord', authenticateToken, authorizeRoles('landlord'), getPaymentsForLandlord);
// Tenant views their payments
router.get('/tenant', authenticateToken, authorizeRoles('tenant'), getPaymentsForTenant);
// Tenant submits payment
router.post('/tenant/pay', authenticateToken, authorizeRoles('tenant'), submitTenantPayment);
// Tenant: get outstanding balance
router.get('/tenant/balance', authenticateToken, authorizeRoles('tenant'), getOutstandingBalance);
// Tenant: get payment receipts
router.get('/tenant/receipts', authenticateToken, authorizeRoles('tenant'), getPaymentReceipts);
// Tenant: get payment due notifications
router.get('/tenant/notifications', authenticateToken, authorizeRoles('tenant'), getPaymentNotifications);

export default router;
