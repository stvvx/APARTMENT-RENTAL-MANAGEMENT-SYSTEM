import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  message: { type: String },
  documents: [String], // URLs or file references
  createdAt: { type: Date, default: Date.now },
  isPaid: { type: Boolean, default: false }
});

// Virtual for tenant photo (when populated)
applicationSchema.virtual('tenantPhoto').get(function() {
  return this.tenant && this.tenant.photo ? this.tenant.photo : null;
});

// Ensure virtuals are included in JSON output
applicationSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Application', applicationSchema);
