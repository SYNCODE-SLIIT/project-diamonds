import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({

    organizerID: { type: String, required: true },
    packageID: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    additionalServices: [
        { 
            serviceID: { type: mongoose.Schema.Types.ObjectId, ref: 'AdditionalService' }
        }
    ],
    eventName: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    eventLocation: { type: String, required: true, trim: true },
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
    guestCount: { type: Number, required: true, min: 1 },
    status: { 
        type: String, 
        enum: ["confirmed", "cancelled", "change-requested"], 
        default: "confirmed" 
      },
    additionalRequests: { type: String, default: "" },
    approvedBy: { type: String, required: true },
    approvedAt: { type: Date, default: Date.now },


  membersAssigned: [{
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'MemberApplication' },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    reason: { type: String, default: "" }
  }],

  notes: [{
    author: { type: String },
    authorId: { type: String },
    content: { type: String  },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
  }]

}, { timestamps: true });

const Event = mongoose.model('Event', EventSchema);
export default Event;
