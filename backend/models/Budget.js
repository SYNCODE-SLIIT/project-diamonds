import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  allocatedBudget: { type: Number, required: true },
  currentSpend: { type: Number, default: 0 },
  remainingBudget: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  // Added "pending" option for budget requests
  status: { type: String, enum: ['approved', 'declined', 'pending'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Budget = mongoose.model('Budget', BudgetSchema);
export default Budget;
