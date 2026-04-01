import User from '../model/User.js';
import Apartment from '../model/Apartment.js';
import Application from '../model/Application.js';
import Payment from '../model/Payment.js';

// View all landlord registrations (pending approval)
export const getPendingLandlords = async (req, res) => {
  try {
    const landlords = await User.find({ role: 'landlord', approved: { $ne: true } }, '-password');
    res.json(landlords);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Approve or reject landlord registration
export const updateLandlordApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // true or false
    const landlord = await User.findOneAndUpdate(
      { _id: id, role: 'landlord' },
      { approved },
      { new: true }
    );
    if (!landlord) return res.status(404).json({ message: 'Landlord not found.' });
    res.json({ message: `Landlord ${approved ? 'approved' : 'rejected'}.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// View all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// View all apartments
export const getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find().populate('landlord', 'name email');
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// View all applications
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().populate('tenant', 'name email').populate('apartment');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Suspend or deactivate user account
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body; // true or false
    const user = await User.findByIdAndUpdate(id, { active }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: `User ${active ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin dashboard metrics
export const getDashboardMetrics = async (req, res) => {
  try {
    const totalUnits = await Apartment.countDocuments();
    const totalTenants = await User.countDocuments({ role: 'tenant' });
    const totalPayments = await Payment.countDocuments();
    const pendingLandlords = await User.countDocuments({ role: 'landlord', approved: { $ne: true } });
    const recentActivity = {
      users: await User.find({}, '-password').sort({ createdAt: -1 }).limit(5),
      apartments: await Apartment.find().sort({ createdAt: -1 }).limit(5),
      payments: await Payment.find().sort({ createdAt: -1 }).limit(5)
    };
    res.json({ totalUnits, totalTenants, totalPayments, pendingLandlords, recentActivity });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
