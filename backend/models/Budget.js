import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  allocatedBudget: { type: Number, required: true },
  currentSpend: { type: Number, default: 0 },
  remainingBudget: { type: Number, default: function() { return this.allocatedBudget; } },
  lastUpdated: { type: Date, default: Date.now },
});

const Budget = mongoose.model('Budget', BudgetSchema);

export default Budget;