import Payment from '../model/Payment.js';
import Apartment from '../model/Apartment.js';
import User from '../model/User.js';

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
    // Find all unpaid or partially paid payments for this tenant
    const payments = await Payment.find({ tenant: req.user.userId, status: { $in: ["unpaid", "partial"] } })
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
