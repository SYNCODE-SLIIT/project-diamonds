import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  transactionType: { type: String, enum: ["payment", "refund"], required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  userId: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  details: { type: Object },
  date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
