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
  // New field for birth date (instead of manually providing age)
  birthDate: { type: Date, required: true },
  // Age will be calculated automatically from birthDate (not provided by client)
  age: { type: Number },
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

// Pre-save hook to automatically compute the age from birthDate
MemberApplicationSchema.pre('save', function(next) {
  if (this.birthDate) {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    this.age = computedAge;
  }
  next();
});

const MemberApplication = mongoose.model('MemberApplication', MemberApplicationSchema);
export default MemberApplication;