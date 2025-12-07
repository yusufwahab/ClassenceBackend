import Subject from '../models/Subject.js';
import AttendanceSession from '../models/AttendanceSession.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

export const createSubjectSession = async (req, res) => {
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

    console.log('Received startTime:', startTime);
    console.log('Received endTime:', endTime);
    
    // Frontend sends times with Nigeria timezone offset, store as-is
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    const today = new Date().toISOString().split('T')[0];

    console.log('Stored startDateTime:', startDateTime.toISOString());
    console.log('Stored endDateTime:', endDateTime.toISOString());
    console.log('Today (UTC):', today);

    // Validate times
    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: 'Start time must be before end time' });
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
      message: 'Subject attendance session created successfully',
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSubjectSessions = async (req, res) => {
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

export const getSubjectAttendanceToday = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all sessions for today in admin's department
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

export const fixAttendanceIndexes = async (req, res) => {
  try {
    // Drop the old problematic index that prevents multiple subjects per day
    try {
      await Attendance.collection.dropIndex({ studentId: 1, date: 1 });
      console.log('✅ Dropped old studentId_1_date_1 index');
    } catch (error) {
      console.log('Old index may not exist:', error.message);
    }

    // Ensure the correct index exists (studentId + sessionId)
    try {
      await Attendance.collection.createIndex({ studentId: 1, sessionId: 1 }, { unique: true });
      console.log('✅ Created correct studentId_1_sessionId_1 index');
    } catch (error) {
      console.log('Correct index may already exist:', error.message);
    }

    // Drop unique index from AttendanceSession to allow multiple sessions per subject per day
    try {
      await AttendanceSession.collection.dropIndex({ subjectId: 1, date: 1 });
      console.log('✅ Dropped unique subjectId_1_date_1 index from AttendanceSession');
    } catch (error) {
      console.log('Session index may not exist:', error.message);
    }

    // Create non-unique index for performance
    try {
      await AttendanceSession.collection.createIndex({ subjectId: 1, date: 1 });
      console.log('✅ Created non-unique subjectId_1_date_1 index');
    } catch (error) {
      console.log('Non-unique index may already exist:', error.message);
    }

    res.json({ 
      message: 'Database indexes fixed! You can now create multiple sessions per subject per day.',
      details: 'Fixed both Attendance and AttendanceSession indexes'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markSubjectAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const currentTime = new Date();

    console.log('=== SUBJECT ATTENDANCE MARKING ===');
    console.log('Student ID:', req.user.userId);
    console.log('Session ID:', sessionId);
    console.log('Current Time:', currentTime.toISOString());

    // Get session details
    const session = await AttendanceSession.findById(sessionId)
      .populate('subjectId', 'name code departmentId');

    if (!session) {
      return res.status(404).json({ message: 'Subject attendance session not found' });
    }

    console.log('Session found:', session.subjectId.name);
    console.log('Session Start Time:', session.startTime.toISOString());
    console.log('Session End Time:', session.endTime.toISOString());
    console.log('Is Active:', session.isActive);
    console.log('Time check: Current >= Start?', currentTime >= session.startTime);
    console.log('Time check: Current <= End?', currentTime <= session.endTime);

    // Verify session is for user's department
    if (session.subjectId.departmentId.toString() !== req.user.departmentId.toString()) {
      return res.status(403).json({ message: 'Access denied to this session' });
    }

    // Check if session is active
    if (!session.isActive) {
      return res.status(400).json({ message: 'Subject attendance session is not active' });
    }

    // Check if session has ended
    if (currentTime > session.endTime) {
      return res.status(400).json({ message: 'Subject attendance session has ended' });
    }

    // Check if already attended THIS SPECIFIC SESSION ONLY
    const existingAttendance = await Attendance.findOne({
      studentId: req.user.userId,
      sessionId: sessionId
    });

    console.log('Existing attendance check:', {
      found: !!existingAttendance,
      attendanceId: existingAttendance?._id
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'You have already marked attendance for this subject session' });
    }

    // Get student details
    const student = await User.findById(req.user.userId);
    if (!student.profileCompleted || !student.signatureImage) {
      return res.status(400).json({ 
        message: 'Please complete your profile by adding your signature first',
        requiresSignature: true
      });
    }

    console.log('Creating new attendance record...');

    // Create attendance record - ONLY checks (studentId + sessionId) uniqueness
    const attendance = new Attendance({
      studentId: req.user.userId,
      sessionId: sessionId,
      subjectId: session.subjectId._id,
      name: student.middleName ? 
        `${student.firstName} ${student.middleName} ${student.lastName}` : 
        `${student.firstName} ${student.lastName}`,
      matricNumber: student.matricNumber,
      signatureImage: student.signatureImage,
      date: session.date,
      timeIn: currentTime,
      status: 'present'
    });

    await attendance.save();

    console.log('✅ Attendance marked successfully for:', session.subjectId.name);

    res.status(201).json({
      message: 'Subject attendance marked successfully!',
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
    console.log('❌ Error marking attendance:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already marked attendance for this subject session' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getActiveSubjectSessions = async (req, res) => {
  try {
    const currentTime = new Date();
    const today = currentTime.toISOString().split('T')[0];

    // Get all sessions for today that are active
    const allSessions = await AttendanceSession.find({
      date: today,
      isActive: true
    })
    .populate('subjectId', 'name code departmentId')
    .sort({ startTime: 1 });

    // Filter sessions by department
    const validSessions = allSessions.filter(session => {
      return session.subjectId && 
             session.subjectId.departmentId.toString() === req.user.departmentId.toString() &&
             session.endTime >= currentTime;
    });

    const sessionsWithStatus = await Promise.all(
      validSessions.map(async (session) => {
        const hasAttended = await Attendance.findOne({
          studentId: req.user.userId,
          sessionId: session._id
        });

        console.log(`Session ${session.subjectId.name}: hasAttended = ${!!hasAttended}`);

        return {
          id: session._id,
          subjectName: session.subjectId.name,
          subjectCode: session.subjectId.code,
          startTime: session.startTime,
          endTime: session.endTime,
          hasAttended: !!hasAttended,
          timeRemaining: Math.max(0, Math.floor((session.endTime - currentTime) / 1000 / 60))
        };
      })
    );

    res.json(sessionsWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const editSubjectSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { startTime, endTime } = req.body;

    const session = await AttendanceSession.findOne({
      _id: sessionId,
      createdBy: req.user.userId
    }).populate('subjectId', 'departmentId');

    if (!session) {
      return res.status(404).json({ message: 'Session not found or unauthorized' });
    }

    if (session.subjectId.departmentId.toString() !== req.user.departmentId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (startDateTime >= endDateTime) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    session.startTime = startDateTime;
    session.endTime = endDateTime;
    await session.save();

    res.json({ message: 'Session updated successfully', session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const endSubjectSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await AttendanceSession.findOne({
      _id: sessionId,
      createdBy: req.user.userId
    }).populate('subjectId', 'departmentId');

    if (!session) {
      return res.status(404).json({ message: 'Session not found or unauthorized' });
    }

    if (session.subjectId.departmentId.toString() !== req.user.departmentId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: 'Session ended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteSubjectSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await AttendanceSession.findOne({
      _id: sessionId,
      createdBy: req.user.userId
    }).populate('subjectId', 'departmentId');

    if (!session) {
      return res.status(404).json({ message: 'Session not found or unauthorized' });
    }

    if (session.subjectId.departmentId.toString() !== req.user.departmentId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete all attendance records for this session
    await Attendance.deleteMany({ sessionId: sessionId });
    
    // Delete the session
    await AttendanceSession.findByIdAndDelete(sessionId);

    res.json({ message: 'Session and all related attendance records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};