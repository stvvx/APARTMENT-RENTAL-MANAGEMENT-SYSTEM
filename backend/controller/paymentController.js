import Payment from '../model/Payment.js';
import Apartment from '../model/Apartment.js';
import Application from '../model/Application.js';

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
  const approvedApplications = await Application.find({ tenant: tenantId, status: 'approved' })
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
    const { paymentId, apartmentId, method, cardNumber, cvv, expiryDate } = req.body;

    if (!paymentId || !method) {
      return res.status(400).json({ message: 'paymentId and method are required.' });
    }

    const allowedMethods = ['cash', 'bank transfer'];
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
        status: { $in: ['unpaid', 'partial', 'late', 'pending'] }
      });

      if (!payment) {
        const approvedApp = await Application.findOne({
          tenant: req.user.userId,
          apartment: apartmentId,
          status: 'approved'
        }).populate('apartment', '_id price landlord');

        if (!approvedApp || !approvedApp.apartment) {
          return res.status(404).json({ message: 'No approved application found for this balance.' });
        }

        payment = await Payment.create({
          tenant: req.user.userId,
          apartment: approvedApp.apartment._id,
          landlord: approvedApp.apartment.landlord,
          amount: approvedApp.apartment.price,
          dueDate: getNextMonthDueDate(),
          status: 'unpaid'
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

    payment.method = method;

    if (method === 'cash') {
      payment.status = 'pending';
      payment.paidDate = undefined;
      payment.cardType = undefined;
      payment.cardLast4 = undefined;
      await payment.save();
      return res.json({
        message: 'Cash payment submitted and is pending landlord approval.',
        payment
      });
    }

    if (method === 'bank transfer') {
      if (!cardNumber || !cvv || !expiryDate) {
        return res.status(400).json({ message: 'Card number, CSV, and expiry date are required for bank transfer.' });
      }

      const digits = String(cardNumber).replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 19) {
        return res.status(400).json({ message: 'Invalid card number.' });
      }

      const cardType = detectCardType(digits);
      if (!cardType) {
        return res.status(400).json({ message: 'Only Visa or Mastercard are supported.' });
      }

      if (!/^\d{3,4}$/.test(String(cvv))) {
        return res.status(400).json({ message: 'Invalid CSV.' });
      }

      if (!isFutureExpiry(expiryDate)) {
        return res.status(400).json({ message: 'Invalid or expired card date. Use MM/YY.' });
      }

      payment.cardType = cardType;
      payment.cardLast4 = digits.slice(-4);
    }

    payment.status = 'paid';
    payment.paidDate = new Date();
    await payment.save();

    return res.json({
      message: `${method} payment submitted successfully.`,
      payment
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};
