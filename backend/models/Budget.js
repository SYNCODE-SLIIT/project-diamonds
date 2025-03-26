import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema({
  allocatedBudget: { type: Number, required: true },
  currentSpend: { type: Number, default: 0 },
  remainingBudget: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  status: { type: String, enum: ["approved", "declined"], required: true }
});

const Budget = mongoose.model("Budget", BudgetSchema);
export default Budget;
