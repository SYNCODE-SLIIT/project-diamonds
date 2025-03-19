import mongoose from 'mongoose';
const { Schema } = mongoose;

const AvailabilitySchema = new Schema({
  day: { type: String },
  start: { type: String },
  end: { type: String }
}, { _id: false });

const MemberApplicationSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String },
  age: { type: Number, required: true },
  danceStyle: { type: String, required: true },
  yearsOfExperience: { type: Number },
  availability: [AvailabilitySchema],
  biography: { type: String },
  achievements: [{ type: String }],
  applicationStatus: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

const MemberApplication = mongoose.model('MemberApplication', MemberApplicationSchema);
export default MemberApplication;