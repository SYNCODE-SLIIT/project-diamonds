import mongoose from 'mongoose';

const EventRequestSchema = new mongoose.Schema({
  eventID: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  organizerID: {
    type: String,
    required: true,
  },
  packageID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true,
  },
  additionalServices: [
    {
      serviceID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdditionalService',
      },
    },
  ],
  eventName: {
    type: String,
    required: true,
    trim: true,
  },
  eventLocation: {
    type: String,
    required: true,
    trim: true,
  },
  eventType: { 
    type: String, 
    enum: ['public', 'private'], 
    required: true, 
    default: 'private' 
  },
  eventTime: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'pending-update'],
    default: 'pending',
  },
  remarks: {
    type: String,
    minlength: 0,
    maxlength: 500,
  },
  reviewedBy: {
    type: String,
    default: null,
  },
  approvalDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const EventRequest = mongoose.model('EventRequest', EventRequestSchema);
export default EventRequest;