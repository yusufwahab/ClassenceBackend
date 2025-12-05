import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, matricNumber, password, departmentId } = req.body;

    if (!firstName || !lastName || !email || !matricNumber || !password || !departmentId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ 
      $or: [{ email }, { matricNumber }]
    });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Matric number already exists'
      });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(400).json({ message: 'Invalid department' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      matricNumber,
      password: hashedPassword,
      role: 'student',
      departmentId,
      profileCompleted: false
    });

    await user.save();

    res.status(201).json({ 
      message: 'Student registered successfully. Please complete your profile.',
      userId: user._id,
      requiresSignature: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, newDepartmentName, adminCode } = req.body;

    if (!firstName || !lastName || !email || !password || !newDepartmentName || !adminCode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (adminCode !== process.env.ADMIN_CODE) {
      return res.status(403).json({ message: 'Invalid admin code' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const existingDepartment = await Department.findOne({ name: newDepartmentName });
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user first with temporary department
    const admin = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'admin',
      departmentId: new mongoose.Types.ObjectId() // Temporary ID
    });

    const savedAdmin = await admin.save();

    // Create department with admin ID
    const department = new Department({
      name: newDepartmentName,
      adminId: savedAdmin._id
    });

    const savedDepartment = await department.save();

    // Update admin with correct department ID
    savedAdmin.departmentId = savedDepartment._id;
    await savedAdmin.save();

    res.status(201).json({
      message: 'Admin registered successfully',
      departmentId: savedDepartment._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).populate('departmentId', 'name');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        departmentId: user.departmentId._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        departmentId: user.departmentId._id,
        departmentName: user.departmentId.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};