import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Update from '../models/Update.js';
import Department from '../models/Department.js';

export const getDashboard = async (req, res) => {
  try {
    const department = await Department.findById(req.user.departmentId);
    const totalStudents = await User.countDocuments({
      departmentId: req.user.departmentId,
      role: 'student'
    });

    const today = new Date().toISOString().split('T')[0];
    const todayPresent = await Attendance.countDocuments({
      date: today,
      status: 'present'
    });

    const recentStudents = await User.find({
      departmentId: req.user.departmentId,
      role: 'student'
    })
    .select('firstName lastName email createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      departmentName: department.name,
      totalStudents,
      todayAttendance: {
        present: todayPresent,
        absent: totalStudents - todayPresent
      },
      recentStudents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await User.find({
      departmentId: req.user.departmentId,
      role: 'student'
    }).select('firstName lastName email matricNumber profileCompleted');

    const studentsWithAttendance = await Promise.all(
      students.map(async (student) => {
        const totalAttendance = await Attendance.countDocuments({
          studentId: student._id
        });
        
        const lastAttendance = await Attendance.findOne({
          studentId: student._id
        }).sort({ date: -1 });

        return {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          matricNumber: student.matricNumber,
          profileCompleted: student.profileCompleted,
          totalAttendance,
          lastAttendance: lastAttendance ? lastAttendance.date : null
        };
      })
    );

    res.json(studentsWithAttendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const todayAttendance = await Attendance.find({
      date: today
    }).populate({
      path: 'studentId',
      match: { departmentId: req.user.departmentId },
      select: 'departmentId'
    }).sort({ timeIn: 1 });

    // Filter out records where student is not in admin's department
    const filteredAttendance = todayAttendance.filter(record => record.studentId);

    const attendanceTable = filteredAttendance.map((record, index) => ({
      serialNumber: index + 1,
      name: record.name,
      matricNumber: record.matricNumber,
      signatureImage: record.signatureImage,
      timeIn: record.timeIn.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      date: record.date
    }));

    res.json({
      date: today,
      totalPresent: attendanceTable.length,
      attendanceRecords: attendanceTable
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const postUpdate = async (req, res) => {
  try {
    const { title, content, imageUrl, audioUrl } = req.body;

    // Debug: Log what we received
    console.log('Received data:', {
      title,
      hasContent: !!content,
      hasImage: !!imageUrl,
      hasAudio: !!audioUrl,
      imageSize: imageUrl ? imageUrl.length : 0,
      audioSize: audioUrl ? audioUrl.length : 0,
      imagePreview: imageUrl ? imageUrl.substring(0, 50) + '...' : null,
      audioPreview: audioUrl ? audioUrl.substring(0, 50) + '...' : null
    });

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Debug: Log the exact data being saved
    const updateData = {
      departmentId: req.user.departmentId,
      title,
      content: content || null,
      imageUrl: imageUrl || null,
      audioUrl: audioUrl || null,
      createdBy: req.user.userId
    };
    
    console.log('Creating update with data:', {
      ...updateData,
      imageUrl: updateData.imageUrl ? `${updateData.imageUrl.substring(0, 50)}... (${updateData.imageUrl.length} chars)` : null,
      audioUrl: updateData.audioUrl ? `${updateData.audioUrl.substring(0, 50)}... (${updateData.audioUrl.length} chars)` : null
    });

    const update = new Update(updateData);
    
    console.log('Update object before save:', {
      hasImageUrl: !!update.imageUrl,
      hasAudioUrl: !!update.audioUrl,
      imageLength: update.imageUrl ? update.imageUrl.length : 0,
      audioLength: update.audioUrl ? update.audioUrl.length : 0
    });

    const savedUpdate = await update.save();

    // Debug: Log what was actually saved to database
    console.log('Saved update result:', {
      id: savedUpdate._id,
      title: savedUpdate.title,
      hasImage: !!savedUpdate.imageUrl,
      hasAudio: !!savedUpdate.audioUrl,
      imageLength: savedUpdate.imageUrl ? savedUpdate.imageUrl.length : 0,
      audioLength: savedUpdate.audioUrl ? savedUpdate.audioUrl.length : 0
    });
    
    // Verify by reading back from database
    const verifyUpdate = await Update.findById(savedUpdate._id);
    console.log('Verification read from DB:', {
      id: verifyUpdate._id,
      hasImage: !!verifyUpdate.imageUrl,
      hasAudio: !!verifyUpdate.audioUrl,
      imageLength: verifyUpdate.imageUrl ? verifyUpdate.imageUrl.length : 0,
      audioLength: verifyUpdate.audioUrl ? verifyUpdate.audioUrl.length : 0
    });

    res.status(201).json({
      message: 'Update posted successfully',
      updateId: savedUpdate._id,
      // Return the saved data for verification
      update: {
        title: savedUpdate.title,
        content: savedUpdate.content,
        hasImage: !!savedUpdate.imageUrl,
        hasAudio: !!savedUpdate.audioUrl
      }
    });
  } catch (error) {
    console.error('Error saving update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const editUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, imageUrl, audioUrl } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const update = await Update.findOne({
      _id: id,
      createdBy: req.user.userId,
      departmentId: req.user.departmentId
    });

    if (!update) {
      return res.status(404).json({ message: 'Update not found or unauthorized' });
    }

    update.title = title;
    update.content = content;
    update.imageUrl = imageUrl || null;
    update.audioUrl = audioUrl || null;

    await update.save();

    res.json({
      message: 'Update edited successfully',
      update
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAdminUpdates = async (req, res) => {
  try {
    const updates = await Update.find({
      departmentId: req.user.departmentId,
      createdBy: req.user.userId
    })
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });

    // Debug: Log what we're returning
    console.log('Returning updates:', updates.map(u => ({
      id: u._id,
      title: u.title,
      hasImage: !!u.imageUrl,
      hasAudio: !!u.audioUrl,
      imageSize: u.imageUrl ? u.imageUrl.length : 0,
      audioSize: u.audioUrl ? u.audioUrl.length : 0
    })));

    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    const update = await Update.findOne({
      _id: id,
      createdBy: req.user.userId,
      departmentId: req.user.departmentId
    });

    if (!update) {
      return res.status(404).json({ message: 'Update not found or unauthorized' });
    }

    await Update.findByIdAndDelete(id);

    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const students = await User.find({
      departmentId: req.user.departmentId,
      role: 'student'
    }).select('firstName lastName email');

    const attendanceData = await Promise.all(
      students.map(async (student) => {
        const attendance = await Attendance.find({
          studentId: student._id,
          date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        return {
          student: {
            name: `${student.firstName} ${student.lastName}`,
            email: student.email
          },
          attendance: attendance.map(a => ({
            date: a.date,
            timeIn: a.timeIn,
            status: a.status
          }))
        };
      })
    );

    // Return JSON data (PDF generation can be added later)
    res.json({
      dateRange: { startDate, endDate },
      data: attendanceData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};