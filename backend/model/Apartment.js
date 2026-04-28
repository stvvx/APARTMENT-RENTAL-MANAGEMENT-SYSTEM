import mongoose from 'mongoose';

const apartmentSchema = new mongoose.Schema({
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  floor: { type: String },
  unitType: { type: String },
  photos: [String],
  isAvailable: { type: Boolean, default: true },
  // --- Additional fields ---
  unitNumber: { type: String },
  buildingName: { type: String },
  // NEW: structured location
  location: {
    street: { type: String, default: '' },
    barangay: { type: String, default: '' },
    city: { type: String, default: '' },
  },
  area: { type: Number }, // in sqm
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  furnishing: { type: String }, // e.g., Unfurnished, Semi-furnished, Fully furnished
  amenities: [{ type: String }],
  petPolicy: { type: String },
  deposit: { type: Number },
  advance: { type: Number },
  minLeaseTerm: { type: String },
  availableFrom: { type: Date },
  utilitiesIncluded: [{ type: String }],
  specialNotes: { type: String },
  // --- End additional fields ---
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Apartment', apartmentSchema);
