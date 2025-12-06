import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  date: {
    type: String, // Format: "YYYY-MM-DD"
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate sessions for same subject on same date
attendanceSessionSchema.index({ subjectId: 1, date: 1 }, { unique: true });

export default mongoose.model('AttendanceSession', attendanceSessionSchema);