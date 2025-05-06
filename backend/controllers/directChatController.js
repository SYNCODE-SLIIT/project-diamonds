// backend/controllers/directChatController.js
import DirectChat      from '../models/DirectChat.js';
import DirectMessage   from '../models/DirectMessage.js';
import mongoose        from 'mongoose';

/* ---------- Utility functions ---------- */

// Utility: find or create direct chat thread between two users
const findOrCreateThread = async (userA, userB) => {
  // Convert to ObjectId instances
  const objA = new mongoose.Types.ObjectId(userA);
  const objB = new mongoose.Types.ObjectId(userB);
  // Try to find existing thread
  let thread = await DirectChat.findOne({
    participants: { $all: [objA, objB], $size: 2 }
  });
  if (thread) return thread;
  // Not found: create new thread
  try {
    thread = await DirectChat.create({ participants: [objA, objB] });
  } catch (err) {
    if (err.code === 11000) {
      // In case of a rare race, fetch the existing one
      thread = await DirectChat.findOne({
        participants: { $all: [objA, objB], $size: 2 }
      });
    } else {
      throw err;
    }
  }
  return thread;
};

/* ---------- API handlers ---------- */

// POST /api/direct-chats/start   { otherUserId }
export const startDirectChat = async (req, res) => {
  try {
    const selfId = req.user._id.toString();  // use ObjectId string
    const otherId = req.body.otherUserId;

    if (!mongoose.isValidObjectId(otherId) || selfId === otherId) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    // Find or create thread using atomic upsert
    const thread = await findOrCreateThread(selfId, otherId);

    // Populate and return
    await thread.populate('participants', 'fullName profilePicture');
    res.status(200).json({ thread });
  } catch (err) {
    console.error('Error in startDirectChat:', err);
    res.status(500).json({ message: 'Error starting chat', error: err.message });
  }
};

// POST /api/direct-chats/:threadId/messages   { text }
export const sendDirectMessage = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { text }     = req.body;
    const sender       = req.user._id.toString(); // Changed from req.user.id

    const msg = await DirectMessage.create({
      thread: threadId,
      sender,
      text,
      readBy: [sender]
    });
    
    // Populate sender info for frontend display
    const populatedMsg = await DirectMessage.findById(msg._id)
      .populate('sender', 'fullName');
      
    res.status(201).json({ savedMessage: populatedMsg });
  } catch (e) {
    console.error("Error sending direct message:", e);
    res.status(500).json({ message: 'Error sending message', error: e.message });
  }
};

// GET /api/direct-chats/:threadId/messages
export const getDirectMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const msgs = await DirectMessage
      .find({ thread: threadId })
      .populate('sender', 'fullName')
      .sort({ timestamp: 1 });
    res.status(200).json({ messages: msgs });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching messages', error: e.message });
  }
};

// PUT /api/direct-chats/:threadId/read-all
export const markAllDMsRead = async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId       = req.user._id.toString(); // Changed from req.user.id
    
    await DirectMessage.updateMany(
      { thread: threadId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
    res.status(200).json({ message: 'Marked as read' });
  } catch (e) {
    console.error("Error marking messages as read:", e);
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

// GET /api/direct-chats/user/:userId
// returns all threads that user participates in + unread counts
export const getThreadsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // find threads and the “other” user’s basic info
    const threads = await DirectChat
      .find({ participants: userId })
      .lean()
      .populate('participants', 'fullName profilePicture');

    // attach unreadCount, lastMessage and lastMessageTime
    const withCounts = await Promise.all(
      threads.map(async (t) => {
        const unread = await DirectMessage.countDocuments({
          thread: t._id, readBy: { $ne: userId }
        });
        // find last message
        const lastMsgDoc = await DirectMessage.find({ thread: t._id })
          .sort({ timestamp: -1 })
          .limit(1)
          .populate('sender', 'fullName');
        const lastMessage = lastMsgDoc.length > 0 ? lastMsgDoc[0].text : null;
        const lastMessageTime = lastMsgDoc.length > 0 ? lastMsgDoc[0].timestamp : null;
        return { ...t, unreadCount: unread, lastMessage, lastMessageTime };
      })
    );
    res.status(200).json({ threads: withCounts });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};