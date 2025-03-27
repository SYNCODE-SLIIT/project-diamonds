import mongoose from 'mongoose';

const ContentCreatorSchema = new mongoose.Schema({
  personalInfo: {
    fullName: String,
    email: String,
    phoneNumber: String
  },
  creatorDetails: {
    specialization: String,
    skills: [String]
  },
  projectProposal: {
    contentType: String,
    title: String,
    description: String
  },
  agreement: {
    termsAccepted: Boolean,
    agreementDate: Date,
    paymentTerms: String,
    deliveryTimeline: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Pending'
  }
}, {
  timestamps: true
});

export default mongoose.model('ContentCreator', ContentCreatorSchema);