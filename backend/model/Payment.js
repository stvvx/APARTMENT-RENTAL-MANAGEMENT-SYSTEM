import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  status: { type: String, enum: ['paid', 'unpaid', 'pending', 'late', 'partial'], default: 'unpaid' },

  // Manual payment method (for receipt-based verification)
  method: { type: String, enum: ['gcash', 'paymaya', 'bank transfer', 'cash'] },

  // distinguish reservation fee vs regular rent payments
  paymentType: { type: String, enum: ['rent', 'reservation'], default: 'rent', index: true },

  // Receipt upload (manual transactions)
  receiptUrl: { type: String },
  receiptOriginalName: { type: String },
  receiptMimeType: { type: String },
  receiptUploadedAt: { type: Date },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', paymentSchema);
