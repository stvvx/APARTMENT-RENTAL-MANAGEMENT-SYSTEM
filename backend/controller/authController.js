import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let landlordId = undefined;
    if (role === 'landlord') {
      landlordId = `LL-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    }
    const user = new User({ name, email, password: hashedPassword, role, landlordId });
    await user.save();
    const token = jwt.sign(
      { userId: user._id, role: user.role, landlordId: user.landlordId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        landlordId: user.landlordId,
        profilePicture: user.profilePicture || ''
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role, landlordId: user.landlordId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        landlordId: user.landlordId,
        profilePicture: user.profilePicture || ''
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
