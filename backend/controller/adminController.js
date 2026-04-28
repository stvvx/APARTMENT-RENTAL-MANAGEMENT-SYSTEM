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
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
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

// Admin: Get all landlord applications
export const getLandlordApplications = async (req, res) => {
  try {
    const applications = await User.find({
      'landlordApplication': { $exists: true, $ne: null }
    }).select('-password').sort({ 'landlordApplication.appliedAt': -1 });
    res.json(applications);
  } catch (err) {
    console.error('Get landlord applications error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin: Approve landlord application
export const approveLandlord = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.landlordApplication) {
      return res.status(400).json({ message: 'No landlord application found.' });
    }

    // Update user role to landlord and mark application as approved
    user.role = 'landlord';
    user.approved = true;
    if (!user.landlordId) {
      user.landlordId = `LL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    if (user.landlordApplication) {
      user.landlordApplication.status = 'approved';
    }

    if (!user.contactNumber && user.landlordApplication?.contactNumber) {
      user.contactNumber = user.landlordApplication.contactNumber;
    }

    // Create the applicant's first apartment listing (required)
    try {
      const firstListing = user.landlordApplication?.firstListing;
      const hasListingFields = firstListing?.title && typeof firstListing?.price === 'number';

      if (hasListingFields && !user.landlordApplication.firstListingApartmentId) {
        const unitType = firstListing.unitType || '';
        const bedroomsVal = typeof firstListing.bedrooms === 'number' ? firstListing.bedrooms : undefined;
        const finalBedrooms = unitType && String(unitType).toLowerCase() === 'studio' ? 1 : bedroomsVal;

        const apartment = new Apartment({
          landlord: user._id,
          title: firstListing.title,
          description: firstListing.description || '',
          price: firstListing.price,
          floor: firstListing.floor || '',
          unitType,
          photos: Array.isArray(firstListing.photos) ? firstListing.photos : [],
          isAvailable: firstListing.isAvailable !== false,
          unitNumber: firstListing.unitNumber || '',
          buildingName: firstListing.buildingName || '',
          location: {
            street: firstListing.location?.street || user.landlordApplication.apartmentAddress || '',
            barangay: firstListing.location?.barangay || '',
            city: firstListing.location?.city || ''
          },
          area: firstListing.area,
          bedrooms: finalBedrooms,
          bathrooms: firstListing.bathrooms,
          furnishing: firstListing.furnishing,
          amenities: Array.isArray(firstListing.amenities) ? firstListing.amenities : [],
          petPolicy: firstListing.petPolicy,
          deposit: firstListing.deposit,
          advance: firstListing.advance,
          minLeaseTerm: firstListing.minLeaseTerm,
          availableFrom: firstListing.availableFrom,
          utilitiesIncluded: Array.isArray(firstListing.utilitiesIncluded) ? firstListing.utilitiesIncluded : [],
          specialNotes: firstListing.specialNotes
        });

        await apartment.save();
        user.landlordApplication.firstListingApartmentId = apartment._id;
      }
    } catch (listingErr) {
      console.error('Approve landlord: failed creating first listing:', listingErr);
    }

    await user.save();
    res.json({ message: 'Landlord application approved.', user });
  } catch (err) {
    console.error('Approve landlord error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin: Reject landlord application
export const rejectLandlord = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.landlordApplication) {
      return res.status(400).json({ message: 'No landlord application found.' });
    }

    // Mark application as rejected
    if (user.landlordApplication) {
      user.landlordApplication.status = 'rejected';
    }

    await user.save();
    res.json({ message: 'Landlord application rejected.', user });
  } catch (err) {
    console.error('Reject landlord error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin: Toggle user active status (deactivate/activate)
export const toggleUserActive = async (req, res) => {
  try {
    const { userId } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: 'Invalid active value.' });
    }

    // Prevent admins from deactivating their own account.
    if (userId === req.user._id.toString() && active === false) {
      return res.status(400).json({ message: 'Cannot deactivate your own account.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { active },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      message: `User ${active ? 'activated' : 'deactivated'} successfully.`,
      user
    });
  } catch (err) {
    console.error('Toggle user active error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin: Change user role
export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['tenant', 'landlord', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    // Prevent accidental self-demotion from admin access.
    if (userId === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot change your own admin role.' });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = role;

    // Keep role-related fields in sync for downstream flows.
    if (role === 'landlord') {
      user.approved = true;
      if (!user.landlordId) {
        user.landlordId = `LL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
      if (user.landlordApplication) {
        user.landlordApplication.status = 'approved';
      }
    } else {
      user.approved = false;
      if (user.landlordApplication && user.landlordApplication.status === 'approved') {
        user.landlordApplication.status = 'rejected';
      }
    }

    await user.save();

    res.json({
      message: `User role changed to ${role} successfully.`,
      user
    });
  } catch (err) {
    console.error('Change user role error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin: Get chart data - Apartments by District
export const getApartmentsByDistrict = async (req, res) => {
  try {
    const apartments = await Apartment.find().select('location');
    
    // Group by location
    const grouped = {};
    apartments.forEach(apt => {
      const location = apt.location || 'Unknown';
      grouped[location] = (grouped[location] || 0) + 1;
    });

    const data = Object.entries(grouped).map(([district, count]) => ({
      district,
      count
    }));

    res.json(data);
  } catch (err) {
    console.error('Get apartments by district error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin: Get chart data - Unit Type Distribution
export const getUnitTypeDistribution = async (req, res) => {
  try {
    const apartments = await Apartment.find().select('unitType');
    
    // Count by unit type
    const unitTypes = {};
    apartments.forEach(apt => {
      const type = apt.unitType || 'Unknown';
      unitTypes[type] = (unitTypes[type] || 0) + 1;
    });

    const colors = ['#FF385C', '#FF6B6B', '#FFA07A', '#FF9999', '#FFB6B6'];
    const data = Object.entries(unitTypes).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));

    res.json(data);
  } catch (err) {
    console.error('Get unit type distribution error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin: Get chart data - Bookings and Applications Trend
export const getBookingsTrend = async (req, res) => {
  try {
    const applications = await Application.find().select('createdAt status');
    
    // Group by month
    const monthData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize months
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const month = months[date.getMonth()];
      monthData[month] = { bookings: 0, applications: 0 };
    }

    // Count applications by month
    applications.forEach(app => {
      const date = new Date(app.createdAt);
      const month = months[date.getMonth()];
      if (monthData[month]) {
        monthData[month].applications++;
        if (app.status === 'approved') {
          monthData[month].bookings++;
        }
      }
    });

    const data = Object.entries(monthData).map(([month, counts]) => ({
      month,
      bookings: counts.bookings,
      applications: counts.applications
    }));

    res.json(data);
  } catch (err) {
    console.error('Get bookings trend error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin: Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalApartments = await Apartment.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'tenant' });
    const approvedApplications = await Application.countDocuments({ status: 'approved' });
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalApartments,
      totalBookings: approvedApplications,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
