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
  }]

}, { timestamps: true });

const Event = mongoose.model('Event', EventSchema);
export default Event;
