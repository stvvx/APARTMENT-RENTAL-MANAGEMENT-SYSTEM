import Payment from '../model/Payment.js';
import Apartment from '../model/Apartment.js';
import Application from '../model/Application.js';
import fs from 'fs';
import path from 'path';

const getNextMonthDueDate = () => {
  const dueDate = new Date();
  dueDate.setDate(1);
  dueDate.setMonth(dueDate.getMonth() + 1);
  return dueDate;
};

const detectCardType = (cardNumber) => {
  const digits = String(cardNumber || '').replace(/\D/g, '');
  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(digits)) return 'visa';
  if (/^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7[01]\d{12}|720\d{12}))$/.test(digits)) return 'mastercard';
  return null;
};

const isFutureExpiry = (expiry) => {
  if (!/^\d{2}\/\d{2}$/.test(expiry || '')) return false;
  const [mmStr, yyStr] = expiry.split('/');
  const mm = Number(mmStr);
  const yy = Number(yyStr);
  if (mm < 1 || mm > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (yy > currentYear) return true;
  if (yy === currentYear && mm >= currentMonth) return true;
  return false;
};

const ensurePaymentsForApprovedApplications = async (tenantId) => {
  const approvedApplications = await Application.find({ tenant: tenantId, status: 'approved', isPaid: true })
    .populate('apartment', '_id price landlord');

  if (!approvedApplications.length) return;

  const apartmentIds = approvedApplications
    .map((app) => app.apartment?._id)
    .filter(Boolean);

  if (!apartmentIds.length) return;

  const existingPayments = await Payment.find({
    tenant: tenantId,
    apartment: { $in: apartmentIds }
  }).select('apartment');

  const apartmentsWithPayments = new Set(existingPayments.map((p) => String(p.apartment)));

  const missingPayments = approvedApplications
    .filter((app) => app.apartment && !apartmentsWithPayments.has(String(app.apartment._id)))
    .map((app) => ({
      tenant: tenantId,
      apartment: app.apartment._id,
      landlord: app.apartment.landlord,
      amount: app.apartment.price,
      dueDate: getNextMonthDueDate(),
      status: 'unpaid'
    }));

  if (missingPayments.length) {
    await Payment.insertMany(missingPayments);
  }
};

// Landlord: record manual payment
export const recordPayment = async (req, res) => {
  try {
    const { tenant, apartment, amount, dueDate, paidDate, status, method } = req.body;
    // Ensure landlord owns the apartment
    const apt = await Apartment.findOne({ _id: apartment, landlord: req.user.userId });
    if (!apt) return res.status(403).json({ message: 'Not authorized for this apartment.' });
    const payment = new Payment({
      tenant,
      apartment,
      landlord: req.user.userId,
      amount,
      dueDate,
      paidDate,
      status,
      method
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Landlord: view payments for their apartments
export const getPaymentsForLandlord = async (req, res) => {
  try {
    const payments = await Payment.find({ landlord: req.user.userId })
      .populate('tenant', 'name email')
      .populate('apartment');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: view my payment history
export const getPaymentsForTenant = async (req, res) => {
  try {
    await ensurePaymentsForApprovedApplications(req.user.userId);
    const payments = await Payment.find({ tenant: req.user.userId })
      .populate('apartment')
      .populate('landlord', 'name email');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: get current outstanding balance
export const getOutstandingBalance = async (req, res) => {
  try {
    await ensurePaymentsForApprovedApplications(req.user.userId);
    // Find all unpaid or partially paid payments for this tenant
    const payments = await Payment.find({ tenant: req.user.userId, status: { $in: ["unpaid", "partial", "late"] } })
      .populate('apartment');
    // Sum the outstanding amounts
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    res.json({ outstanding: total, details: payments });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: get payment receipts (paid payments)
export const getPaymentReceipts = async (req, res) => {
  try {
    const payments = await Payment.find({ tenant: req.user.userId, status: "paid" })
      .populate('apartment')
      .populate('landlord', 'name email');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: get payment due notifications (upcoming or overdue payments)
export const getPaymentNotifications = async (req, res) => {
  try {
    await ensurePaymentsForApprovedApplications(req.user.userId);
    const now = new Date();
    // Payments due in the next 7 days or overdue
    const payments = await Payment.find({
      tenant: req.user.userId,
      status: { $in: ["unpaid", "partial"] },
      dueDate: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
    }).populate('apartment');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: submit payment for an outstanding bill
export const submitTenantPayment = async (req, res) => {
  try {
    const { paymentId, apartmentId, method } = req.body;

    if (!paymentId || !method) {
      return res.status(400).json({ message: 'paymentId and method are required.' });
    }

    // Receipt-only payment methods
    const allowedMethods = ['cash', 'bank transfer', 'gcash', 'paymaya'];
    if (!allowedMethods.includes(method)) {
      return res.status(400).json({ message: 'Invalid payment method.' });
    }

    let payment = null;

    if (String(paymentId).startsWith('fallback-')) {
      if (!apartmentId) {
        return res.status(400).json({ message: 'apartmentId is required for fallback balances.' });
      }

      payment = await Payment.findOne({
        tenant: req.user.userId,
        apartment: apartmentId,
        status: { $in: ['unpaid', 'partial', 'late', 'pending'] },
        paymentType: 'rent'
      });

      if (!payment) {
        const approvedApp = await Application.findOne({
          tenant: req.user.userId,
          apartment: apartmentId,
          status: 'approved',
          isPaid: true
        }).populate('apartment', '_id price landlord');

        if (!approvedApp || !approvedApp.apartment) {
          return res.status(404).json({ message: 'No approved + paid reservation found for this balance.' });
        }

        payment = await Payment.create({
          tenant: req.user.userId,
          apartment: approvedApp.apartment._id,
          landlord: approvedApp.apartment.landlord,
          amount: approvedApp.apartment.price,
          dueDate: getNextMonthDueDate(),
          status: 'unpaid',
          paymentType: 'rent'
        });
      }
    } else {
      payment = await Payment.findOne({ _id: paymentId, tenant: req.user.userId });
    }

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({ message: 'This payment is already marked as paid.' });
    }

    // IMPORTANT: receipt-only flow => tenant method selection just marks it pending.
    // Receipt upload + (admin/landlord) approval will complete the payment.
    payment.method = method;
    payment.status = 'pending';
    payment.paidDate = undefined;
    await payment.save();

    return res.json({
      message: 'Payment method selected. Please upload your receipt for verification.',
      payment
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ----------------------------
// Reservation fee flow
// ----------------------------

const RESERVATION_FEE_AMOUNT = 500;

export const createReservationFeePayment = async (req, res) => {
  try {
    const { apartmentId } = req.body;

    if (!apartmentId) {
      return res.status(400).json({ message: 'apartmentId is required.' });
    }

    const apartment = await Apartment.findById(apartmentId).select('_id landlord isAvailable');
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found.' });
    }

    // Ensure tenant has an approved application for this apartment
    const application = await Application.findOne({
      tenant: req.user.userId,
      apartment: apartmentId,
      status: 'approved'
    });

    if (!application) {
      return res.status(403).json({ message: 'You need an approved application to pay the reservation fee.' });
    }

    if (application.isPaid) {
      return res.status(400).json({ message: 'Reservation fee is already paid for this apartment.' });
    }

    // If there is already an unpaid/pending reservation payment, return it
    const existing = await Payment.findOne({
      tenant: req.user.userId,
      apartment: apartmentId,
      paymentType: 'reservation',
      status: { $in: ['unpaid', 'pending', 'partial', 'late'] }
    });

    if (existing) {
      return res.status(200).json({ payment: existing });
    }

    const payment = await Payment.create({
      tenant: req.user.userId,
      apartment: apartmentId,
      landlord: apartment.landlord,
      amount: RESERVATION_FEE_AMOUNT,
      dueDate: new Date(),
      status: 'unpaid',
      paymentType: 'reservation'
    });

    return res.status(201).json({ payment });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const getLandlordContactForApartment = async (req, res) => {
  try {
    const { apartmentId } = req.params;

    // Must have paid reservation fee (application.isPaid) to view contact info
    const application = await Application.findOne({
      tenant: req.user.userId,
      apartment: apartmentId,
      status: 'approved'
    });

    if (!application || !application.isPaid) {
      return res.status(403).json({ message: 'Pay the reservation fee to view landlord contact info.' });
    }

    const apartment = await Apartment.findById(apartmentId).populate('landlord', 'name email');
    if (!apartment || !apartment.landlord) {
      return res.status(404).json({ message: 'Apartment not found.' });
    }

    return res.json({
      landlord: {
        name: apartment.landlord.name,
        email: apartment.landlord.email
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ----------------------------
// Manual receipt upload + review flow
// ----------------------------

export const uploadReservationReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({
      _id: paymentId,
      tenant: req.user.userId,
      paymentType: 'reservation'
    });

    if (!payment) return res.status(404).json({ message: 'Reservation payment not found.' });

    if (!req.file) return res.status(400).json({ message: 'Receipt file is required.' });

    // store relative URL served by /uploads
    payment.receiptUrl = `/uploads/${req.file.filename}`;
    payment.receiptOriginalName = req.file.originalname;
    payment.receiptMimeType = req.file.mimetype;
    payment.receiptUploadedAt = new Date();

    // after receipt upload, wait for admin verification
    payment.status = 'pending';
    payment.paidDate = undefined;

    // IMPORTANT: do not override tenant-selected method.
    // If tenant didn't pick a method yet, default to bank transfer.
    payment.method = payment.method || 'bank transfer';

    await payment.save();
    return res.json({ message: 'Receipt uploaded. Waiting for admin verification.', payment });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const adminListReservationReceipts = async (req, res) => {
  try {
    const payments = await Payment.find({ paymentType: 'reservation' })
      .populate('tenant', 'name email')
      .populate('apartment', 'title location')
      .sort({ receiptUploadedAt: -1, createdAt: -1 });

    return res.json(payments);
  } catch {
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const adminReviewReservationReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "action must be 'approve' or 'reject'." });
    }

    const payment = await Payment.findOne({ _id: paymentId, paymentType: 'reservation' });
    if (!payment) return res.status(404).json({ message: 'Reservation payment not found.' });

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending receipts can be reviewed.' });
    }

    if (action === 'reject') {
      // keep receipt url for records, but mark unpaid again
      payment.status = 'unpaid';
      payment.paidDate = undefined;
      await payment.save();
      return res.json({ message: 'Reservation receipt rejected.', payment });
    }

    // approve
    payment.status = 'paid';
    payment.paidDate = new Date();
    await payment.save();

    // unlock: mark application as paid
    await Application.updateOne(
      { tenant: payment.tenant, apartment: payment.apartment },
      { $set: { isPaid: true } }
    );

    return res.json({ message: 'Reservation receipt approved.', payment });
  } catch {
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const landlordReviewRentReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "action must be 'approve' or 'reject'." });
    }

    // landlord can only review rent payments that belong to them
    const payment = await Payment.findOne({ _id: paymentId, paymentType: 'rent', landlord: req.user.userId });
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending payments can be reviewed.' });
    }

    if (action === 'reject') {
      payment.status = 'unpaid';
      payment.paidDate = undefined;
      await payment.save();
      return res.json({ message: 'Payment rejected.', payment });
    }

    payment.status = 'paid';
    payment.paidDate = new Date();
    await payment.save();

    return res.json({ message: 'Payment approved.', payment });
  } catch {
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const uploadRentReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({
      _id: paymentId,
      tenant: req.user.userId,
      paymentType: 'rent'
    });

    if (!payment) return res.status(404).json({ message: 'Rent payment not found.' });

    if (!req.file) return res.status(400).json({ message: 'Receipt file is required.' });

    payment.receiptUrl = `/uploads/${req.file.filename}`;
    payment.receiptOriginalName = req.file.originalname;
    payment.receiptMimeType = req.file.mimetype;
    payment.receiptUploadedAt = new Date();

    // after receipt upload, wait for landlord verification
    payment.status = 'pending';
    payment.paidDate = undefined;
    payment.method = payment.method || 'bank transfer';

    await payment.save();
    return res.json({ message: 'Receipt uploaded. Waiting for landlord verification.', payment });
  } catch {
    return res.status(500).json({ message: 'Server error.' });
  }
};
