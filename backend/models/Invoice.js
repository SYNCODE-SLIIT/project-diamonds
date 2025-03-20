// models/Invoice.js
import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  transactionId: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Invoice = mongoose.model('Invoice', InvoiceSchema);

export default Invoice;
