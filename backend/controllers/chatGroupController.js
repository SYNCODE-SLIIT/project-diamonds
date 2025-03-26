// File: /backend/controllers/chatGroupController.js
import ChatGroup from '../models/ChatGroup.js';

// Create a new chat group (manager only)
export const createChatGroup = async (req, res) => {
  try {
    const { groupName, description, createdBy, members } = req.body;
    // Do not reference a variable "user" here; just use createdBy from the payload.
    const newGroup = new ChatGroup({
      groupName,
      description,
      createdBy, // this comes from the payload
      members
    });
    const savedGroup = await newGroup.save();
    res.status(201).json({ message: 'Chat group created successfully', group: savedGroup });
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat group', error: error.message });
  }
};

// Update members of a chat group
export const updateChatGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body; // Pass an array of user IDs
    const updatedGroup = await ChatGroup.findByIdAndUpdate(groupId, { members, updatedAt: new Date() }, { new: true });
    res.status(200).json({ message: 'Chat group updated successfully', group: updatedGroup });
  } catch (error) {
    res.status(500).json({ message: 'Error updating chat group', error: error.message });
  }
};

// Delete a chat group
export const deleteChatGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    await ChatGroup.findByIdAndDelete(groupId);
    res.status(200).json({ message: 'Chat group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chat group', error: error.message });
  }
};

// Get all chat groups for a user
export const getChatGroupsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const groups = await ChatGroup.find({ members: userId });
    res.status(200).json({ groups });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat groups', error: error.message });
  }
};
