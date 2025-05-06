import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  recipientName: { type: String, required: true },
  eventName: { type: String, required: true },
  issuedDate: { type: Date, default: Date.now }
});

export default mongoose.model('Certificate', certificateSchema);
