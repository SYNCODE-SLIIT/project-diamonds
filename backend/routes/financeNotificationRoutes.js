import express from 'express';
import { getFinanceNotifications, markFinanceNotificationAsRead } from '../controllers/financeNotificationController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

// Get all notifications for the logged-in financial manager
router.get('/', protect, getFinanceNotifications);

// Mark a notification as read
router.post('/read/:id', protect, markFinanceNotificationAsRead);

export default router; 