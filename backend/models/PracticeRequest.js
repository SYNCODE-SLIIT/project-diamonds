import mongoose from 'mongoose';

const practiceRequestSchema = new mongoose.Schema({
  practiceName: {
    type: String,
    required: true
  },
  practiceDate: {
    type: Date,
    required: true
  },
  practiceTime: {
    type: String,
    required: true
  },
  practiceLocation: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  maxParticipants: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requestedBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.model('PracticeRequest', practiceRequestSchema); 