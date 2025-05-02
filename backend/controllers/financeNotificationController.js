import FinanceNotification from '../models/FinanceNotification.js';
import User from '../models/User.js';

// Get all notifications for the logged-in financial manager
export const getFinanceNotifications = async (req, res) => {
  try {
    const notifications = await FinanceNotification.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
};

// Mark a notification as read
export const markFinanceNotificationAsRead = async (req, res) => {
  try {
    const notification = await FinanceNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notification', error: error.message });
  }
};

// Create a finance notification (for use in payment/invoice events)
export const createFinanceNotification = async ({ userId, message, type = 'info', invoiceId = null }) => {
  try {
    await FinanceNotification.create({ user: userId, message, type, invoiceId });
  } catch (error) {
    console.error('Error creating finance notification:', error);
  }
}; 