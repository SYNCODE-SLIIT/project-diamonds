import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  accessDuration: { type: String, required: true }, // e.g., "3 months", "Until project ends"
  status: { type: String, enum: ['Active', 'Pending', 'Expired'], default: 'Pending' },
  // Path to profile image
  profileImage: { type: String },
}, { timestamps: true });

const Collaboration = mongoose.model('Collaboration', collaborationSchema);

export default Collaboration;
