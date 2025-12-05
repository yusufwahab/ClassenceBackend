import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Update from '../models/Update.js';

export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('departmentId', 'name');
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.findOne({
      studentId: req.user.userId,
      date: today
    });

    const recentUpdates = await Update.find({ departmentId: req.user.departmentId })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        departmentName: user.departmentId.name
      },
      todayAttendance: {
        marked: !!todayAttendance,
        time: todayAttendance ? todayAttendance.timeIn.toLocaleTimeString('en-US') : null
      },
      recentUpdates
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already marked today
    const existingAttendance = await Attendance.findOne({
      studentId: req.user.userId,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'You have already marked attendance today',
        markedAt: existingAttendance.timeIn
      });
    }

    // Get student details
    const student = await User.findById(req.user.userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if profile is completed (has signature)
    if (!student.profileCompleted || !student.signatureImage) {
      return res.status(400).json({ 
        message: 'Please complete your profile by adding your signature first',
        requiresSignature: true
      });
    }

    const currentTime = new Date();
    
    // Create attendance record with all student details
    const attendance = new Attendance({
      studentId: req.user.userId,
      name: `${student.firstName} ${student.lastName}`,
      matricNumber: student.matricNumber,
      signatureImage: student.signatureImage,
      date: today,
      timeIn: currentTime,
      status: 'present'
    });

    await attendance.save();

    res.status(201).json({
      message: 'Attendance marked successfully!',
      attendance: {
        name: attendance.name,
        matricNumber: attendance.matricNumber,
        date: attendance.date,
        timeIn: attendance.timeIn.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        status: attendance.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUpdates = async (req, res) => {
  try {
    const updates = await Update.find({ departmentId: req.user.departmentId })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};