// File: /backend/routes/messageRoutes.js
import express from 'express';
const router = express.Router();
import { sendMessage, getMessagesForGroup, markMessageAsRead, checkNewMessages, markAllMessagesAsRead } from '../controllers/messageController.js';
import { protect } from '../middleware/authmiddleware.js';

// Send a new message
router.post('/', sendMessage);

// Get messages for a chat group
router.get('/:groupId', getMessagesForGroup);

// (Optional) Mark a message as read
router.put('/:messageId/read', markMessageAsRead);

// Check if new messages exist
router.get('/:groupId/check/:lastCount', checkNewMessages);

// Mark all messages as read in a group
router.put('/:groupId/readAll', protect, markAllMessagesAsRead);

export default router;