import mongoose from 'mongoose';

const FinanceNotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // financial manager
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: false },
});

export default mongoose.model('FinanceNotification', FinanceNotificationSchema); 