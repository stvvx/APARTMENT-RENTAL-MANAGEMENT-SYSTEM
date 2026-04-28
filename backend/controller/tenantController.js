import Apartment from '../model/Apartment.js';
import Application from '../model/Application.js';
import User from '../model/User.js';

// Tenant: Get current unit assignment and lease terms
export const getTenantLeaseInfo = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    // Find approved application for this tenant
    const application = await Application.findOne({ tenant: userId, status: 'approved' })
      .populate('apartment');
    if (!application) return res.status(404).json({ message: 'No active lease found.' });
    // Optionally, lease terms could be stored in Application or Apartment
    res.json({
      apartment: application.apartment,
      leaseStart: application.leaseStart || application.createdAt,
      leaseEnd: application.leaseEnd || null, // If you store leaseEnd
      terms: application.terms || null // If you store terms
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: Update personal profile information
export const updateTenantProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.profilePicture !== undefined) updates.profilePicture = req.body.profilePicture;
    // Add more fields as needed
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture || ''
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const user = await User.findById(userId).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: Add apartment to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { apartmentId } = req.body;
    if (!apartmentId) return res.status(400).json({ message: 'Apartment ID required.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Check if apartment exists
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) return res.status(404).json({ message: 'Apartment not found.' });

    // Add to wishlist if not already present
    if (!user.wishlist.includes(apartmentId)) {
      user.wishlist.push(apartmentId);
      await user.save();
    }

    res.json({ message: 'Added to wishlist.', wishlist: user.wishlist });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: Remove apartment from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { apartmentId } = req.body;
    if (!apartmentId) return res.status(400).json({ message: 'Apartment ID required.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Remove from wishlist
    user.wishlist = user.wishlist.filter((id) => id.toString() !== apartmentId.toString());
    await user.save();

    res.json({ message: 'Removed from wishlist.', wishlist: user.wishlist });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: Apply as Landlord
export const applyAsLandlord = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Store landlord application data (no ID upload required)
    user.landlordApplication = {
      name,
      email,
      idDocumentURL: undefined,
      idDocumentMimeType: undefined,
      idDocumentOriginalName: undefined,
      appliedAt: new Date(),
      status: 'pending'
    };

    await user.save();

    res.json({
      message: 'Your landlord application has been submitted successfully!',
      application: user.landlordApplication
    });
  } catch (err) {
    console.error('Apply as landlord error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
