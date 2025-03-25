import mongoose from 'mongoose';

const CalendarEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    eventType: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Added teamMembers to associate multiple users to events
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true,
});

const CalendarEvent = mongoose.model('CalendarEvent', CalendarEventSchema);

export default CalendarEvent;



