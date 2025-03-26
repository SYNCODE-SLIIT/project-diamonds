// File: /backend/routes/chatGroupRoutes.js
import express from 'express';
const router = express.Router();
import { createChatGroup, updateChatGroupMembers, deleteChatGroup, getChatGroupsForUser, getAllChatGroups, getGroupMembers, addMembersToGroup, removeMemberFromGroup } from '../controllers/chatGroupController.js';

// Create a new chat group (manager only)
router.post('/', createChatGroup);

// Update group members (add/remove)
router.put('/:groupId/members', updateChatGroupMembers);

// Delete a chat group
router.delete('/:groupId', deleteChatGroup);

// Get all groups for a user
router.get('/user/:userId', getChatGroupsForUser);


router.get('/all', getAllChatGroups);

router.get('/:groupId/members', getGroupMembers);

router.put('/:groupId/members/remove/:memberId', removeMemberFromGroup);
router.put('/:groupId/members/add', addMembersToGroup);
export default router;