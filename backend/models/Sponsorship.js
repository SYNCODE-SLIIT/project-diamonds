import mongoose from 'mongoose';

const sponsorshipSchema = new mongoose.Schema({
  sponsorName: { type: String, required: true },
  sponsorType: { type: String, enum: ['Financial', 'Product-based', 'Venue', 'Media/PR', 'Food & Beverages', 'Technical/Equipment'], required: true },
  contributionDetails: { type: String },
  category: { type: String, enum: ['Gold', 'Silver', 'Bronze', 'Supporter'], required: true },
  duration: { type: String },
  contactPerson: { type: String },
  contactInfo: { type: String }, // email or phone
  status: { type: String, enum: ['Pending', 'Active', 'Completed'], default: 'Pending' },
}, { timestamps: true });

export default mongoose.model('Sponsorship', sponsorshipSchema);
