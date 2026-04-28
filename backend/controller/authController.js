import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import { sendEmail } from '../utils/mailer.js';

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'otp-secret';
  return crypto.createHmac('sha256', secret).update(otp).digest('hex');
}

function buildAuthPayload(user) {
  const token = jwt.sign(
    { userId: user._id, role: user.role, landlordId: user.landlordId },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      landlordId: user.landlordId,
      profilePicture: user.profilePicture || ''
    }
  };
}

async function sendVerificationOtpEmail({ email, name, otp }) {
  const subject = 'Your OTP for email verification';
  const text = `Hi${name ? ` ${name}` : ''},\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn’t create an account, you can ignore this email.`;

  await sendEmail({
    to: email,
    subject,
    text,
    html: `<p>Hi${name ? ` ${name}` : ''},</p><p>Your verification code is:</p><h2 style="letter-spacing:2px">${otp}</h2><p>This code expires in <b>10 minutes</b>.</p><p>If you didn’t create an account, you can ignore this email.</p>`
  });
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Registration always creates a tenant account.
    // Landlord access is obtained only via the Apply-as-Landlord flow + admin approval.
    const role = 'tenant';
    const landlordId = undefined;
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      landlordId,
      emailVerified: false,
      emailVerificationOtpHash: otpHash,
      emailVerificationOtpExpiresAt: otpExpiresAt
    });

    await user.save();

    try {
      await sendVerificationOtpEmail({ email: user.email, name: user.name, otp });
    } catch (mailErr) {
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: 'Could not send OTP email. Please try again.' });
    }

    res.status(201).json({
      message: 'Registration successful. Please verify your email using the OTP sent to your email address.',
      email: user.email
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

    if (user.emailVerified === false) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        needsEmailVerification: true,
        email: user.email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    res.json(buildAuthPayload(user));
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.emailVerified !== false) {
      return res.json({ message: 'Email already verified.', ...buildAuthPayload(user) });
    }

    if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpiresAt) {
      return res.status(400).json({ message: 'No OTP found. Please request a new OTP.' });
    }

    if (user.emailVerificationOtpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    const submittedHash = hashOtp(String(otp).trim());
    if (submittedHash !== user.emailVerificationOtpHash) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationOtpHash = undefined;
    user.emailVerificationOtpExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully.', ...buildAuthPayload(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.emailVerified !== false) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    const otp = generateOtp();
    user.emailVerificationOtpHash = hashOtp(otp);
    user.emailVerificationOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationOtpEmail({ email: user.email, name: user.name, otp });
    res.json({ message: 'A new OTP has been sent to your email address.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
