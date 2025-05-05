import mongoose from 'mongoose';

const practiceSchema = new mongoose.Schema({
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
  assignedMembers: [{
    memberID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MemberApplication'
    },
    assignedBy: {
      type: String,
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Practice', practiceSchema); 