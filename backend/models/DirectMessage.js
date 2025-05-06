// backend/models/DirectMessage.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * We keep the same read‑tracking pattern as your group Message model
 * so the frontend can show “unread” badges the same way.
 */
const DirectMessageSchema = new Schema({
  thread:   { type: Schema.Types.ObjectId, ref: 'DirectChat', required: true },
  sender:   { type: Schema.Types.ObjectId, ref: 'User',        required: true },
  text:     { type: String, required: true },
  timestamp:{ type: Date,   default: Date.now },
  readBy:   [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const DirectMessage = mongoose.model('DirectMessage', DirectMessageSchema);
export default DirectMessage;