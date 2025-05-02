import mongoose from 'mongoose';

const RefundSchema = new mongoose.Schema({
  refundAmount: { type: Number, required: true },
  reason: { type: String },
  invoiceNumber: { type: String, required: true }, 
  receiptFile: {
    type: String,
    required: false
  },
  fileProvider: {
    type: String,
    enum: ['cloudinary', 's3', null],
    default: null
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  transactionId: { type: String },
  processedAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

const Refund = mongoose.model('Refund', RefundSchema);
export default Refund;
