import Application from '../model/Application.js';
import Apartment from '../model/Apartment.js';
import User from '../model/User.js';
import Payment from '../model/Payment.js';

// Tenant applies for an apartment
export const applyForApartment = async (req, res) => {
  try {
    let userId = req.user?.userId;
    let user;
    // If not logged in, register a new user
    if (!userId) {
      const { name, email, password, phone, photo } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
      }
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered.' });
      }
      user = new User({ name, email, password, phone, photo, role: 'tenant' });
      await user.save();
      userId = user._id;
    }
    const { apartmentId, message, documents } = req.body;
    // Check if apartment exists and is available
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment || !apartment.isAvailable) {
      return res.status(404).json({ message: 'Apartment not available.' });
    }
    // Prevent duplicate applications (block only if not cancelled)
    const existing = await Application.findOne({ tenant: userId, apartment: apartmentId, status: { $in: ['pending', 'approved', 'rejected'] } });
    if (existing) {
      return res.status(409).json({ message: 'Already applied for this apartment.' });
    }
    // Require at least one document
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: 'At least one document is required.' });
    }
    const application = new Application({
      tenant: userId,
      apartment: apartmentId,
      message,
      documents
    });
    await application.save();
    res.status(201).json({ message: 'Application submitted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: view my applications
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ tenant: req.user.userId })
      .populate({
        path: 'apartment',
        model: 'Apartment',
        populate: { path: 'landlord', model: 'User', select: 'name email photo' }
      });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: view my approved applications (for 'My Rentals' or similar)
export const getMyApprovedApplications = async (req, res) => {
  try {
    const applications = await Application.find({ tenant: req.user.userId, status: 'approved' })
      .populate({
        path: 'apartment',
        model: 'Apartment',
        populate: { path: 'landlord', model: 'User', select: 'name email photo' }
      });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Landlord: view all applications for their apartments
export const getApplicationsForMyApartments = async (req, res) => {
  try {
    // Find apartments owned by landlord
    const myApartments = await Apartment.find({ landlord: req.user.userId }, '_id');
    const apartmentIds = myApartments.map(a => a._id);
    // Find applications for these apartments
    const applications = await Application.find({ apartment: { $in: apartmentIds } })
      .populate('tenant', 'name email photo') // include photo
      .populate('apartment');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tenant: cancel application
export const cancelApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      console.error(`[CANCEL] Application not found: ${id}`);
      return res.status(404).json({ message: 'Application not found.' });
    }
    // Debug log for tenant and user
    console.log(`[CANCEL DEBUG] req.user._id:`, req.user._id, 'application.tenant:', application.tenant);
    if (!application.tenant.equals(req.user._id)) {
      console.error(`[CANCEL] Not authorized. User: ${req.user._id}, Tenant: ${application.tenant}`);
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (application.status === 'cancelled') {
      console.warn(`[CANCEL] Application already cancelled. AppID: ${id}`);
      return res.status(400).json({ message: 'Application already cancelled.' });
    }
    if (application.status === 'rejected') {
      console.warn(`[CANCEL] Cannot cancel a rejected application. AppID: ${id}`);
      return res.status(400).json({ message: 'Cannot cancel a rejected application.' });
    }
    if (application.status === 'approved' && application.isPaid) {
      console.warn(`[CANCEL] Cannot cancel after payment. AppID: ${id}`);
      return res.status(400).json({ message: 'Cannot cancel after payment.' });
    }
    application.status = 'cancelled';
    // Set apartment back to available if this was an approved application
    if (application.status === 'approved') {
      const apartment = await Apartment.findById(application.apartment);
      if (apartment) {
        apartment.isAvailable = true;
        await apartment.save();
      }
    }
    await application.save();
    console.log(`[CANCEL] Application cancelled successfully. AppID: ${id}`);
    res.json({ message: 'Application cancelled.' });
  } catch (err) {
    console.error(`[CANCEL] Server error:`, err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Landlord: approve or reject application
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved', 'rejected', 'cancelled', or 'ended'
    if (!['approved', 'rejected', 'cancelled', 'ended'].includes(status)) {
      console.error(`[UPDATE STATUS] Invalid status: ${status}`);
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const application = await Application.findById(id).populate('apartment');
    if (!application) {
      console.error(`[UPDATE STATUS] Application not found: ${id}`);
      return res.status(404).json({ message: 'Application not found.' });
    }
    // Debug log for tenant and user (cancel via PATCH)
    if (status === 'cancelled') {
      console.log(`[CANCEL PATCH DEBUG] req.user._id:`, req.user._id, 'req.user.userId:', req.user.userId, 'application.tenant:', application.tenant);
    }
    // If tenant is cancelling their own application
    if (status === 'cancelled' && application.tenant.equals(req.user._id)) {
      if (application.status === 'cancelled') {
        console.warn(`[UPDATE STATUS] Application already cancelled. AppID: ${id}`);
        return res.status(400).json({ message: 'Application already cancelled.' });
      }
      if (application.status === 'rejected') {
        console.warn(`[UPDATE STATUS] Cannot cancel a rejected application. AppID: ${id}`);
        return res.status(400).json({ message: 'Cannot cancel a rejected application.' });
      }
      if (application.status === 'approved' && application.isPaid) {
        console.warn(`[UPDATE STATUS] Cannot cancel after payment. AppID: ${id}`);
        return res.status(400).json({ message: 'Cannot cancel after payment.' });
      }
      application.status = 'cancelled';
      // Set apartment back to available if this was an approved application
      if (application.status === 'approved') {
        const apartment = await Apartment.findById(application.apartment);
        if (apartment) {
          apartment.isAvailable = true;
          await apartment.save();
        }
      }
      await application.save();
      console.log(`[UPDATE STATUS] Application cancelled by tenant. AppID: ${id}`);
      return res.json({ message: 'Application cancelled.' });
    }
    // If landlord is acting
    if (String(application.apartment.landlord) === req.user.userId) {
      if (status === 'cancelled') {
        console.error(`[UPDATE STATUS] Landlord cannot cancel applications. User: ${req.user.userId}`);
        return res.status(403).json({ message: 'Landlord cannot cancel applications.' });
      }
      
      // Landlord can end approved contracts
      if (status === 'ended') {
        if (application.status !== 'approved') {
          console.warn(`[UPDATE STATUS] Can only end approved contracts. Current status: ${application.status}`);
          return res.status(400).json({ message: 'Can only end approved contracts.' });
        }
        application.status = 'ended';
        // Set apartment back to available
        application.apartment.isAvailable = true;
        await application.apartment.save();
        await application.save();
        console.log(`[UPDATE STATUS] Contract ended by landlord. AppID: ${id}`);
        return res.json({ message: 'Contract ended.' });
      }
      
      application.status = status;
      await application.save();
      if (status === 'approved') {
        application.apartment.isAvailable = false;
        await application.apartment.save();
        
        // Create monthly payment record for tenant
        try {
          const dueDate = new Date();
          dueDate.setDate(1); // Set to 1st of next month
          dueDate.setMonth(dueDate.getMonth() + 1);
          
          const payment = new Payment({
            tenant: application.tenant,
            apartment: application.apartment._id,
            landlord: application.apartment.landlord,
            amount: application.apartment.price,
            dueDate: dueDate,
            status: 'unpaid'
          });
          await payment.save();
          console.log(`[UPDATE STATUS] Monthly payment created for tenant. PaymentID: ${payment._id}`);
        } catch (paymentErr) {
          console.error(`[UPDATE STATUS] Error creating payment:`, paymentErr);
          // Don't fail the approval if payment creation fails
        }
      }
      console.log(`[UPDATE STATUS] Application ${status} by landlord. AppID: ${id}`);
      return res.json({ message: `Application ${status}.` });
    }
    // If neither tenant nor landlord
    console.error(`[UPDATE STATUS] Not authorized. User: ${req.user.userId}, Tenant: ${application.tenant}, Landlord: ${application.apartment.landlord}`);
    return res.status(403).json({ message: 'Not authorized.' });
  } catch (err) {
    console.error(`[UPDATE STATUS] Server error:`, err);
    res.status(500).json({ message: 'Server error.' });
  }
};
