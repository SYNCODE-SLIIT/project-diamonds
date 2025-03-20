import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  paymentStatus: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
  createdAt: { type: Date, default: Date.now },
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);
export default Invoice;
