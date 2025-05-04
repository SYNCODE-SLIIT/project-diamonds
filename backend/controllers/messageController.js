// File: /backend/controllers/messageController.js
import Message from '../models/Message.js';

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { chatGroup, sender, text } = req.body;
    const newMessage = new Message({
      chatGroup,
      sender,
      text
    });
    const savedMessage = await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully', savedMessage });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get messages for a chat group
export const getMessagesForGroup = async (req, res) => {
    try {
      const { groupId } = req.params;
      const messages = await Message.find({ chatGroup: groupId })
        .populate('sender', 'fullName')  // Populate only the fullName field of sender
        .sort({ timestamp: 1 });
      res.status(200).json({ messages });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
  };

// (Optional) Mark a message as read by a user
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: userId } },
      { new: true }
    );
    res.status(200).json({ message: 'Message marked as read', updatedMessage });
  } catch (error) {
    res.status(500).json({ message: 'Error updating message', error: error.message });
  }
};

// Check if there are new messages since lastCount
export const checkNewMessages = async (req, res) => {
  try {
    const { groupId, lastCount } = req.params;
    const count = await Message.countDocuments({ chatGroup: groupId });
    res.status(200).json({ hasNew: count > Number(lastCount), count });
  } catch (error) {
    res.status(500).json({ message: 'Error checking new messages', error: error.message });
  }
};