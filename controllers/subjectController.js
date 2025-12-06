import Subject from '../models/Subject.js';
import AttendanceSession from '../models/AttendanceSession.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

export const createSubject = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: 'Name and code are required' });
    }

    const subject = new Subject({
      name,
      code: code.toUpperCase(),
      departmentId: req.user.departmentId
    });

    await subject.save();

    res.status(201).json({
      message: 'Subject created successfully',
      subject: {
        id: subject._id,
        name: subject.name,
        code: subject.code
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject code already exists in this department' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ departmentId: req.user.departmentId })
      .sort({ name: 1 });

    res.json(subjects.map(subject => ({
      id: subject._id,
      name: subject.name,
      code: subject.code,
      createdAt: subject.createdAt
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createAttendanceSession = async (req, res) => {
  try {
    const { subjectId, startTime, endTime } = req.body;

    if (!subjectId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Subject, start time, and end time are required' });
    }

    // Verify subject exists and admin has access
    const subject = await Subject.findOne({
      _id: subjectId,
      departmentId: req.user.departmentId
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    const nigeriaTime = new Date(new Date().getTime() + (1 * 60 * 60 * 1000));
    const today = nigeriaTime.toISOString().split('T')[0];

    // Validate times
    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    if (endDateTime <= nigeriaTime) {
      return res.status(400).json({ message: 'End time must be in the future' });
    }

    const session = new AttendanceSession({
      subjectId,
      date: today,
      startTime: startDateTime,
      endTime: endDateTime,
      createdBy: req.user.userId
    });

    await session.save();

    res.status(201).json({
      message: 'Attendance session created successfully',
      session: {
        id: session._id,
        subjectName: subject.name,
        subjectCode: subject.code,
        startTime: session.startTime,
        endTime: session.endTime,
        isActive: session.isActive
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance session already exists for this subject today' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAttendanceSessions = async (req, res) => {
  try {
    const sessions = await AttendanceSession.find({
      createdBy: req.user.userId
    })
    .populate('subjectId', 'name code')
    .sort({ createdAt: -1 });

    const formattedSessions = sessions.map(session => ({
      id: session._id,
      subjectName: session.subjectId.name,
      subjectCode: session.subjectId.code,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      isActive: session.isActive,
      createdAt: session.createdAt
    }));

    res.json(formattedSessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    // Convert to Nigeria time (WAT - UTC+1)
    const now = new Date();
    const nigeriaTime = new Date(now.getTime() + (1 * 60 * 60 * 1000)); // Add 1 hour for WAT
    const today = nigeriaTime.toISOString().split('T')[0];

    // Get all sessions for today that are active
    const allSessions = await AttendanceSession.find({
      date: today,
      isActive: true
    })
    .populate('subjectId', 'name code departmentId')
    .sort({ startTime: 1 });

    // Filter sessions by department (show all sessions for today that haven't ended)
    const validSessions = allSessions.filter(session => {
      return session.subjectId && 
             session.subjectId.departmentId.toString() === req.user.departmentId.toString() &&
             session.endTime >= nigeriaTime;
    });

    const sessionsWithStatus = await Promise.all(
      validSessions.map(async (session) => {
        // Fix attendance lookup - ensure proper ObjectId comparison
        const hasAttended = await Attendance.findOne({
          studentId: req.user.userId,
          sessionId: session._id
        });

        console.log('Attendance lookup debug:', {
          studentId: req.user.userId,
          sessionId: session._id,
          studentIdType: typeof req.user.userId,
          sessionIdType: typeof session._id,
          queryResult: !!hasAttended,
          attendanceRecord: hasAttended
        });

        const finalAttended = hasAttended;

        console.log('Active sessions attendance check:', {
          studentId: req.user.userId,
          sessionId: session._id.toString(),
          subjectName: session.subjectId.name,
          hasAttended: !!hasAttended,
          finalResult: !!finalAttended,
          attendanceId: finalAttended?._id
        });

        return {
          id: session._id,
          subjectName: session.subjectId.name,
          subjectCode: session.subjectId.code,
          startTime: session.startTime,
          endTime: session.endTime,
          hasAttended: !!finalAttended,
          timeRemaining: Math.max(0, Math.floor((session.endTime - nigeriaTime) / 1000 / 60)) // minutes
        };
      })
    );

    res.json(sessionsWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const debugSessions = async (req, res) => {
  try {
    const now = new Date();
    const nigeriaTime = new Date(now.getTime() + (1 * 60 * 60 * 1000)); // Add 1 hour for WAT
    const today = nigeriaTime.toISOString().split('T')[0];

    const allSessions = await AttendanceSession.find({})
      .populate('subjectId', 'name code departmentId')
      .sort({ createdAt: -1 });

    const debugInfo = {
      currentTimeUTC: now,
      currentTimeNigeria: nigeriaTime,
      today: today,
      userDepartmentId: req.user.departmentId,
      totalSessions: allSessions.length,
      sessions: allSessions.map(session => ({
        id: session._id,
        subjectName: session.subjectId?.name || 'No Subject',
        subjectDepartmentId: session.subjectId?.departmentId || 'No Department',
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        isActive: session.isActive,
        isToday: session.date === today,
        isTimeValid: session.startTime <= nigeriaTime && session.endTime >= nigeriaTime,
        isDepartmentMatch: session.subjectId?.departmentId?.toString() === req.user.departmentId.toString()
      }))
    };

    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const nigeriaTime = new Date(new Date().getTime() + (1 * 60 * 60 * 1000));
    const today = nigeriaTime.toISOString().split('T')[0];

    const attendanceRecords = await Attendance.find({
      studentId: req.user.userId,
      date: today
    })
    .populate('subjectId', 'name code')
    .populate('sessionId', 'startTime endTime')
    .sort({ timeIn: -1 });

    const formattedRecords = attendanceRecords.map(record => ({
      id: record._id,
      subjectName: record.subjectId?.name || 'Unknown Subject',
      subjectCode: record.subjectId?.code || 'N/A',
      matricNumber: record.matricNumber,
      timeIn: record.timeIn,
      status: record.status,
      date: record.date
    }));

    res.json(formattedRecords);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const debugAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Check if attendance record exists
    const existingAttendance = await Attendance.findOne({
      studentId: req.user.userId,
      sessionId: sessionId
    });

    // Get all attendance records for this student
    const allAttendance = await Attendance.find({
      studentId: req.user.userId
    }).populate('sessionId', 'startTime endTime').sort({ createdAt: -1 });

    const debugInfo = {
      sessionId: sessionId,
      studentId: req.user.userId,
      hasAttendanceForThisSession: !!existingAttendance,
      existingAttendanceRecord: existingAttendance,
      totalAttendanceRecords: allAttendance.length,
      allAttendanceRecords: allAttendance.map(record => ({
        id: record._id,
        sessionId: record.sessionId._id,
        date: record.date,
        timeIn: record.timeIn,
        createdAt: record.createdAt
      }))
    };

    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAdminTodayAttendance = async (req, res) => {
  try {
    const nigeriaTime = new Date(new Date().getTime() + (1 * 60 * 60 * 1000));
    const today = nigeriaTime.toISOString().split('T')[0];

    // Get all sessions for today in admin's department (not just created by this admin)
    const departmentSessions = await AttendanceSession.find({
      date: today
    }).populate({
      path: 'subjectId',
      match: { departmentId: req.user.departmentId },
      select: 'name code departmentId'
    });

    // Filter out sessions where subject is not in admin's department
    const validSessions = departmentSessions.filter(session => session.subjectId);

    // Get all attendance records for these sessions
    const sessionIds = validSessions.map(session => session._id);
    const attendanceRecords = await Attendance.find({
      sessionId: { $in: sessionIds }
    }).populate('sessionId', 'startTime endTime')
      .populate('subjectId', 'name code')
      .sort({ timeIn: -1 });

    // Group attendance by session
    const attendanceBySession = {};
    attendanceRecords.forEach(record => {
      const sessionId = record.sessionId._id.toString();
      if (!attendanceBySession[sessionId]) {
        attendanceBySession[sessionId] = [];
      }
      attendanceBySession[sessionId].push({
        id: record._id,
        studentName: record.name,
        matricNumber: record.matricNumber,
        timeIn: record.timeIn,
        status: record.status,
        signatureImage: record.signatureImage
      });
    });

    // Format response with session details and attendance
    const formattedData = validSessions.map(session => ({
      sessionId: session._id,
      subjectName: session.subjectId.name,
      subjectCode: session.subjectId.code,
      startTime: session.startTime,
      endTime: session.endTime,
      isActive: session.isActive,
      attendanceCount: attendanceBySession[session._id.toString()]?.length || 0,
      attendanceRecords: attendanceBySession[session._id.toString()] || []
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const deletedAttendance = await Attendance.findOneAndDelete({
      studentId: req.user.userId,
      sessionId: sessionId
    });

    if (!deletedAttendance) {
      return res.status(404).json({ message: 'No attendance record found for this session' });
    }

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const clearAllAttendance = async (req, res) => {
  try {
    const deletedRecords = await Attendance.deleteMany({
      studentId: req.user.userId
    });

    res.json({ 
      message: `Cleared ${deletedRecords.deletedCount} attendance records`,
      deletedCount: deletedRecords.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const now = new Date();
    const nigeriaTime = new Date(now.getTime() + (1 * 60 * 60 * 1000));

    // Get session details
    const session = await AttendanceSession.findById(sessionId)
      .populate('subjectId', 'name code departmentId');

    if (!session) {
      return res.status(404).json({ message: 'Attendance session not found' });
    }

    // Verify session is for user's department
    if (session.subjectId.departmentId.toString() !== req.user.departmentId.toString()) {
      return res.status(403).json({ message: 'Access denied to this session' });
    }

    // Check if session is active and within time limits
    if (!session.isActive) {
      return res.status(400).json({ message: 'Attendance session is not active' });
    }

    if (nigeriaTime < session.startTime) {
      return res.status(400).json({ message: 'Attendance session has not started yet' });
    }

    if (nigeriaTime > session.endTime) {
      return res.status(400).json({ message: 'Attendance session has ended' });
    }

    // Check if already attended (session-specific check only)
    const existingAttendance = await Attendance.findOne({
      studentId: req.user.userId,
      sessionId: session._id
    });

    console.log('Attendance check:', {
      studentId: req.user.userId,
      sessionId: session._id.toString(),
      existingAttendance: !!existingAttendance,
      attendanceId: existingAttendance?._id
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'You have already marked attendance for this session' });
    }

    // Get student details
    const student = await User.findById(req.user.userId);
    if (!student.profileCompleted || !student.signatureImage) {
      return res.status(400).json({ 
        message: 'Please complete your profile by adding your signature first',
        requiresSignature: true
      });
    }

    // Create attendance record
    const attendance = new Attendance({
      studentId: req.user.userId,
      sessionId: session._id,
      subjectId: session.subjectId._id,
      name: `${student.firstName} ${student.lastName}`,
      matricNumber: student.matricNumber,
      signatureImage: student.signatureImage,
      date: session.date,
      timeIn: nigeriaTime,
      status: 'present'
    });

    await attendance.save();

    res.status(201).json({
      message: 'Attendance marked successfully!',
      attendance: {
        subjectName: session.subjectId.name,
        subjectCode: session.subjectId.code,
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
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already marked attendance for this session' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};