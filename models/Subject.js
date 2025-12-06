import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },

}, {
  timestamps: true
});

// Compound index to ensure unique subject codes per department
subjectSchema.index({ code: 1, departmentId: 1 }, { unique: true });

export default mongoose.model('Subject', subjectSchema);