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
        matricNumber: user.matricNumber,
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

export const getAttendanceLog = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({
      studentId: req.user.userId
    }).sort({ date: -1 });

    const attendanceLog = attendanceRecords.map(record => ({
      id: record._id,
      date: record.date,
      timeMarked: record.timeIn.toISOString(),
      status: 'present'
    }));

    // Calculate stats
    const totalPresent = attendanceRecords.length;
    
    // This month count
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = attendanceRecords.filter(record => {
      const recordDate = new Date(record.timeIn);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).length;

    // Calculate average time
    let averageTime = '9:00 AM';
    if (attendanceRecords.length > 0) {
      const totalMinutes = attendanceRecords.reduce((sum, record) => {
        const time = new Date(record.timeIn);
        return sum + (time.getHours() * 60 + time.getMinutes());
      }, 0);
      const avgMinutes = Math.round(totalMinutes / attendanceRecords.length);
      const avgHours = Math.floor(avgMinutes / 60);
      const avgMins = avgMinutes % 60;
      const period = avgHours >= 12 ? 'PM' : 'AM';
      const displayHour = avgHours > 12 ? avgHours - 12 : (avgHours === 0 ? 12 : avgHours);
      averageTime = `${displayHour}:${avgMins.toString().padStart(2, '0')} ${period}`;
    }

    res.json({
      attendanceLog,
      stats: {
        totalPresent,
        thisMonth,
        averageTime
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};