// File: /backend/routes/messageRoutes.js
import express from 'express';
const router = express.Router();
import { sendMessage, getMessagesForGroup, markMessageAsRead } from '../controllers/messageController.js';

// Send a new message
router.post('/', sendMessage);

// Get messages for a chat group
router.get('/:groupId', getMessagesForGroup);

// (Optional) Mark a message as read
router.put('/:messageId/read', markMessageAsRead);

export default router;