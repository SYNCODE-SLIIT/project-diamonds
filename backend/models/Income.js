import mongoose from "mongoose";

const IncomeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    icon: { type: String },
    source: { type: String, required: true }, // Example: Salary, Freelance, etc.
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Income", IncomeSchema);
