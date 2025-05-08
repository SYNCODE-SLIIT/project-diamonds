// backend/models/DirectChat.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * A DirectChat represents a thread between exactly TWO users.
 * Later, if you support “member ↔ member” or “organizer ↔ manager”
 * you just need to make sure both users are pushed into `participants`.
 */
const DirectChatSchema = new Schema({
  participants: [
    { type: Schema.Types.ObjectId, ref: 'User', required: true }
  ],             //  e.g. [managerId, memberId]
  createdAt:    { type: Date, default: Date.now }
});

const DirectChat = mongoose.model('DirectChat', DirectChatSchema);
export default DirectChat;