import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'landlord', 'tenant'],
    required: true
  },
  landlordId: { type: String }, // Only for landlords
  approved: { type: Boolean, default: false }, // Only for landlords
  active: { type: Boolean, default: true }, // For account suspension
  profilePicture: { type: String, default: '' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Apartment' }], // Wishlist of apartment IDs
  landlordApplication: {
    name: String,
    email: String,
    idDocumentURL: String,
    idDocumentMimeType: String,
    idDocumentOriginalName: String,
    appliedAt: Date,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
