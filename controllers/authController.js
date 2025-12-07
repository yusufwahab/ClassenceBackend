import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { sendVerificationEmail, generateVerificationCode } from '../utils/emailService.js';

export const register = async (req, res) => {
  try {
    const { firstName, lastName, middleName, email, matricNumber, password, departmentId } = req.body;

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

    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new User({
      firstName,
      lastName,
      middleName: middleName || null,
      email,
      matricNumber,
      password: hashedPassword,
      role: 'student',
      departmentId,
      profileCompleted: false,
      isEmailVerified: false,
      verificationCode,
      verificationCodeExpires: codeExpires
    });

    await user.save();

    // Send verification email
    try {
      console.log(`Sending verification email to ${email} with code ${verificationCode}`);
      await sendVerificationEmail(email, verificationCode, firstName);
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      // Continue registration even if email fails
    }

    res.status(201).json({ 
      message: 'Registration successful! Please check your email for verification code.',
      userId: user._id,
      email: user.email,
      requiresVerification: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, middleName, email, password, newDepartmentName, adminCode } = req.body;

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
      middleName: middleName || null,
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

    // Update admin with correct department ID and add verification
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    savedAdmin.departmentId = savedDepartment._id;
    savedAdmin.isEmailVerified = false;
    savedAdmin.verificationCode = verificationCode;
    savedAdmin.verificationCodeExpires = codeExpires;
    await savedAdmin.save();

    // Send verification email
    try {
      console.log(`Sending admin verification email to ${email} with code ${verificationCode}`);
      await sendVerificationEmail(email, verificationCode, firstName);
      console.log('✅ Admin verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Admin email sending failed:', emailError.message);
    }

    res.status(201).json({
      message: 'Admin registered successfully! Please check your email for verification code.',
      userId: savedAdmin._id,
      email: savedAdmin.email,
      departmentId: savedDepartment._id,
      requiresVerification: true
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

    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        userId: user._id,
        email: user.email
      });
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