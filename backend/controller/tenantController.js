import Apartment from '../model/Apartment.js';
import Application from '../model/Application.js';
import User from '../model/User.js';

// Tenant: Get current unit assignment and lease terms
export const getTenantLeaseInfo = async (req, res) => {
  try {
    // Find approved application for this tenant
    const application = await Application.findOne({ tenant: req.user.userId, status: 'approved' })
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
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    // Add more fields as needed
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
