// File: /backend/models/Message.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const MessageSchema = new Schema({
  chatGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatGroup', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Stores user IDs that have read this message
});

const Message = mongoose.model('Message', MessageSchema);
export default Message;
