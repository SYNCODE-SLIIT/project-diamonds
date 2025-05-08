import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['bank_slip', 'payment_gateway', 'stripe']
  },
  bankSlipFile: {
    type: String,
    required: false
  },
  fileProvider: {
    type: String,
    enum: ['cloudinary', 'supabase', 's3', null],
    default: null
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending' 
  },
  paymentFor: { 
    type: String, 
    enum: ['merchandise', 'package', 'ticket', 'other'], 
    required: true 
  },
  // Stripe specific fields
  stripePaymentIntentId: { type: String },
  stripeCustomerId: { type: String },
  stripePaymentStatus: { 
    type: String,
    enum: ['succeeded', 'processing', 'failed', null],
    default: null
  },
  // Optional fields for merchandise payments
  productId: { type: String },
  productName: { type: String },
  quantity: { type: Number },
  orderId: { type: String },
  modelPrediction: {
    isAuthentic: Boolean,
    confidence: Number,
    realConfidence: Number,
    fakeConfidence: Number,
    prediction: String,
    error: String
  },
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;