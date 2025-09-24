import express from 'express';
import User from '../models/user.js';                  // ✅ correct
import { protect } from '../models/middleware/auth.js' // ✅ correct
import jwt from 'jsonwebtoken';                        // ❌ you forgot to import jwt

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, phone, organization, location, agreeTerms } = req.body;
  try {
    if (!email || !password || !firstName || !lastName || !phone || !organization || !location || agreeTerms === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({email, password, firstName, lastName, phone, organization, location, agreeTerms });
    const token = generateToken(user._id);

    if (user) {
      res.status(201).json({
        id: user._id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization,
        location: user.location,
        agreeTerms: user.agreeTerms,
        token,
        createdAt: user.createdAt
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone, 
      organization: user.organization,
      // confirmPassword: user.confirmPassword,
      location: user.location,
      agreeTerms: user.agreeTerms,
      email: user.email,
      token,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected route
router.get('/me', protect, async (req, res) => {
  res.status(200).json(req.user);
});

export default router;
