import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: String, default: '' },
  role: {
    type: String,
    enum: ['admin', 'landlord', 'tenant'],
    required: true
  },
  // Email verification (OTP)
  // Default true so existing DB users aren't locked out after this change.
  emailVerified: { type: Boolean, default: true },
  emailVerifiedAt: { type: Date },
  emailVerificationOtpHash: { type: String },
  emailVerificationOtpExpiresAt: { type: Date },
  landlordId: { type: String }, // Only for landlords
  approved: { type: Boolean, default: false }, // Only for landlords
  active: { type: Boolean, default: true }, // For account suspension
  profilePicture: { type: String, default: '' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Apartment' }], // Wishlist of apartment IDs
  landlordApplication: {
    name: String,
    email: String,
    contactNumber: String,
    apartmentAddress: String,
    firstListing: {
      title: String,
      description: String,
      price: Number,
      floor: String,
      unitType: String,
      photos: [String],
      isAvailable: { type: Boolean, default: true },
      unitNumber: String,
      buildingName: String,
      location: {
        street: { type: String, default: '' },
        barangay: { type: String, default: '' },
        city: { type: String, default: '' },
      },
      area: Number,
      bedrooms: Number,
      bathrooms: Number,
      furnishing: String,
      amenities: [String],
      petPolicy: String,
      deposit: Number,
      advance: Number,
      minLeaseTerm: String,
      availableFrom: Date,
      utilitiesIncluded: [String],
      specialNotes: String
    },
    firstListingApartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment' },
    idDocumentURL: String,
    idDocumentMimeType: String,
    idDocumentOriginalName: String,
    appliedAt: Date,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
