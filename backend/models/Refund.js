import mongoose from 'mongoose';

const RefundSchema = new mongoose.Schema({
  refundAmount: { type: Number, required: true },
  reason: { type: String },
  invoiceNumber: { type: String, required: true }, 
  receiptFile: { type: String },                   
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  transactionId: { type: String },
  processedAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Refund = mongoose.model('Refund', RefundSchema);
export default Refund;
