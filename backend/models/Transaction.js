import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  transactionType: { type: String, enum: ['payment', 'refund', 'expense', 'invoice'], required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalAmount: { type: Number, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  date: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;