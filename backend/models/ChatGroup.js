// File: /backend/models/ChatGroup.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ChatGroupSchema = new Schema({
  groupName: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ChatGroup = mongoose.model('ChatGroup', ChatGroupSchema);
export default ChatGroup;