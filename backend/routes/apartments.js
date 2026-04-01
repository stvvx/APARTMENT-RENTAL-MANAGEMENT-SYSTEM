import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  createApartment,
  getMyApartments,
  updateApartment,
  deleteApartment
} from '../controller/apartmentController.js';
import Apartment from '../model/Apartment.js';

const router = express.Router();

// Public: Get all available apartments
router.get('/public', async (req, res) => {
  try {
    const apartments = await Apartment.find({ isAvailable: true }).populate('landlord', 'name email');
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Tenant: Get all available apartments (for tenant view)
router.get('/tenant', async (req, res) => {
  try {
    const apartments = await Apartment.find({ isAvailable: true }).populate('landlord', 'name email');
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Tenant: Get apartment details by ID if tenant has approved application
router.get('/tenant/:id', authenticateToken, authorizeRoles('tenant'), async (req, res) => {
  try {
    const apartmentId = req.params.id;
    // Debug log
    console.log('Tenant request:', { apartmentId, userId: req.user._id });
    // Find an approved application for this tenant and apartment
    const Application = (await import('../model/Application.js')).default;
    const application = await Application.findOne({
      apartment: apartmentId,
      tenant: req.user._id,
      status: { $in: ['approved', 'rejected'] }
    });
    console.log('Found application:', application);
    if (!application) {
      return res.status(403).json({ message: 'You do not have access to this apartment.' });
    }
    const apartment = await Apartment.findById(apartmentId).populate('landlord', 'name email');
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found.' });
    }
    res.json(apartment);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// All routes below require landlord authentication
router.use(authenticateToken, authorizeRoles('landlord'));

// Create apartment
router.post('/', createApartment);
// Get all apartments for landlord
router.get('/', getMyApartments);
// Update apartment
router.put('/:id', updateApartment);
// Delete apartment
router.delete('/:id', deleteApartment);

export default router;
