// models/Salary.js
import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    salaryAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Salary", SalarySchema);