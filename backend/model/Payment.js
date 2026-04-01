import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  status: { type: String, enum: ['paid', 'pending', 'late'], default: 'pending' },
  method: { type: String }, // e.g., cash, bank transfer
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', paymentSchema);
