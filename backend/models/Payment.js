import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  bankSlipFile: { type: String }, // Will be null when testing via JSON
  status: { type: String, default: 'Pending' },
  paymentFor: { 
    type: String, 
    enum: ['merchandise', 'package', 'other'], 
    required: true 
  },
  // Optional fields for merchandise payments
  productId: { type: String },
  productName: { type: String },
  quantity: { type: Number },
  orderId: { type: String },
});

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;