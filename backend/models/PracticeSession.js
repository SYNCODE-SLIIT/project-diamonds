import mongoose from 'mongoose';

const PracticeSessionSchema = new mongoose.Schema({
  sessionDate: { type: Date, required: true },
  location: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  // Tracking member assignments similar to events
  membersAssigned: [{
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'MemberApplication' },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    reason: { type: String, default: "" }
  }]
}, { timestamps: true });

const PracticeSession = mongoose.model('PracticeSession', PracticeSessionSchema);
export default PracticeSession;
