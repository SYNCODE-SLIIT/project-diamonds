// File: /backend/routes/chatGroupRoutes.js
import express from 'express';
const router = express.Router();
import { createChatGroup, updateChatGroupMembers, deleteChatGroup, getChatGroupsForUser } from '../controllers/chatGroupController.js';

// Create a new chat group (manager only)
router.post('/', createChatGroup);

// Update group members (add/remove)
router.put('/:groupId/members', updateChatGroupMembers);

// Delete a chat group
router.delete('/:groupId', deleteChatGroup);

// Get all groups for a user
router.get('/user/:userId', getChatGroupsForUser);

export default router;