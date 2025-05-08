// File: /backend/controllers/chatGroupController.js
import ChatGroup from '../models/ChatGroup.js';
import Message from '../models/Message.js';

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
    // Augment each group with unreadCount and lastMessage
    const enhanced = await Promise.all(groups.map(async (grp) => {
      const unreadCount = await Message.countDocuments({
        chatGroup: grp._id,
        readBy: { $ne: userId }
      });
      const lastMsgDoc = await Message.find({ chatGroup: grp._id })
        .sort({ timestamp: -1 })
        .limit(1)
        .populate('sender', 'fullName');
      const lastMessage = lastMsgDoc.length > 0
        ? lastMsgDoc[0].text
        : null;
      return {
        _id: grp._id,
        groupName: grp.groupName,
        unreadCount,
        lastMessage
      };
    }));
    res.status(200).json({ groups: enhanced });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat groups', error: error.message });
  }
};

// Get all chat groups (for admin to view all available groups)
export const getAllChatGroups = async (req, res) => {
  try {
    const groups = await ChatGroup.find();
    res.status(200).json({ groups });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat groups', error: error.message });
  }
};

// Get all members for a given chat group (populated)
export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await ChatGroup.findById(groupId).populate('members');
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }
    res.status(200).json({ members: group.members });
  } catch (error) {
    res.status(500).json({ message: "Error fetching group members", error: error.message });
  }
};

export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const updatedGroup = await ChatGroup.findByIdAndUpdate(
      groupId,
      { $pull: { members: memberId } },
      { new: true }
    );
    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found." });
    }
    res.status(200).json({ message: "Member removed successfully", group: updatedGroup });
  } catch (error) {
    res.status(500).json({ message: "Error removing member", error: error.message });
  }
};

export const addMembersToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body; // Expecting an array of member IDs to add
    const updatedGroup = await ChatGroup.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: { $each: memberIds } } },
      { new: true }
    );
    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found." });
    }
    res.status(200).json({ message: "Members added successfully", group: updatedGroup });
  } catch (error) {
    res.status(500).json({ message: "Error adding members", error: error.message });
  }
};

// Get a single chat group by ID
export const getChatGroupById = async (req, res) => {
  try {
    const group = await ChatGroup.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }
    res.status(200).json({ group });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group details', error: error.message });
  }
};

