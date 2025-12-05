import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String, // Base64 string or URL
    required: false
  },
  audioUrl: {
    type: String, // Base64 string or URL
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Update', updateSchema);