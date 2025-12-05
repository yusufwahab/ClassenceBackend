import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  matricNumber: {
    type: String,
    required: true
  },
  signatureImage: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  timeIn: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance entries
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);