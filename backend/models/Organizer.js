import mongoose from 'mongoose';
const { Schema } = mongoose;

const OrganizerSchema = new Schema({
  fullName: { type: String, required: true },
  organizationName: { type: String },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String },
  profilePicture: { type: String },
  paymentDetails: {
    paymentMethod: { type: String },
    paymentToken: { type: String },
    billingAddress: { type: String }
  },
  role: { type: String, default: 'organizer' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Organizer = mongoose.model('Organizer', OrganizerSchema);
export default Organizer;