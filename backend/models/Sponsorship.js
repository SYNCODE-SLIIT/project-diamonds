import mongoose from 'mongoose';

const sponsorshipSchema = new mongoose.Schema({
  sponsorName: { type: String, required: true },
  sponsorType: { type: String, enum: ['Monetary', 'In-Kind'], required: true },
  amount: { type: Number },
  duration: { type: String },
  contactEmail: { type: String },
  status: { type: String, enum: ['Active', 'Completed', 'Pending'], default: 'Pending' },
}, { timestamps: true });

export default mongoose.model('Sponsorship', sponsorshipSchema);
