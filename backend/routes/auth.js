import express from 'express';
import { register, login } from '../controller/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import User from '../model/User.js';

const router = express.Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ name: user.name, email: user.email, role: user.role });
  } catch {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
