// models/Payment.js
import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  amount: Number,
  paymentMethod: String,
  bankSlipFile: String,
  status: String,
  // ... other fields as needed
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
