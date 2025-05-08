import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  transactionType: { 
    type: String, 
    enum: ['payment', 'refund', 'budget'], // added "budget"
    required: true 
  },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }, // Optional for non–invoice transactions
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  totalAmount: { type: Number, required: true },
  details: { type: Object },
  date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
export default Transaction;
