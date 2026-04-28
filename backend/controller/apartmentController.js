import Apartment from '../model/Apartment.js';

// Create new apartment listing
export const createApartment = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      floor,
      unitType,
      photos,
      unitNumber,
      buildingName,
      location,
      area,
      bedrooms,
      bathrooms,
      furnishing,
      amenities,
      petPolicy,
      deposit,
      advance,
      minLeaseTerm,
      availableFrom,
      utilitiesIncluded,
      specialNotes
    } = req.body;

    // If studio, force bedrooms to 1
    const finalBedrooms = unitType && unitType.toLowerCase() === 'studio' ? 1 : bedrooms;

    const apartment = new Apartment({
      landlord: req.user.userId,
      title,
      description,
      price,
      floor,
      unitType,
      photos,
      unitNumber,
      buildingName,
      location: {
        street: location?.street || '',
        barangay: location?.barangay || '',
        city: location?.city || '',
      },
      area,
      bedrooms: finalBedrooms,
      bathrooms,
      furnishing,
      amenities,
      petPolicy,
      deposit,
      advance,
      minLeaseTerm,
      availableFrom,
      utilitiesIncluded,
      specialNotes
    });
    await apartment.save();
    res.status(201).json(apartment);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all apartments for landlord
export const getMyApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ landlord: req.user.userId });
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update apartment
export const updateApartment = async (req, res) => {
  try {
    const { id } = req.params;
    const apartment = await Apartment.findOneAndUpdate(
      { _id: id, landlord: req.user.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!apartment) return res.status(404).json({ message: 'Apartment not found.' });
    res.json(apartment);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete apartment
export const deleteApartment = async (req, res) => {
  try {
    const { id } = req.params;
    const apartment = await Apartment.findOneAndDelete({ _id: id, landlord: req.user.userId });
    if (!apartment) return res.status(404).json({ message: 'Apartment not found.' });
    res.json({ message: 'Apartment deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
