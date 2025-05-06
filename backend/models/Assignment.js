import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
  eventID: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to EventRequest model
    ref: 'EventRequest',
    required: true,
  },
  memberAssignments: [
    {
      memberID: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to MemberApplication model
        ref: 'MemberApplication',
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',  // Default status when initially assigned
      },
      assignedBy: {
        type: String,  // ID of the user who assigned the member (admin or manager)
        required: true,
      },
      reason: {
        type: String,  // Optional: Reason for rejection if the member rejects
        default: "",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Assignment = mongoose.model('Assignment', AssignmentSchema);
export default Assignment;