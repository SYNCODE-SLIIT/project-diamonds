import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['bank_slip', 'stripe', 'cash'], required: true },
  bankSlipFile: {
    type: String,
    required: false
  },
  fileProvider: {
    type: String,
    enum: ['cloudinary', 'supabase', 's3', null],
    default: null
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
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
  modelPrediction: {
    isAuthentic: Boolean,
    confidence: Number,
    realConfidence: Number,
    fakeConfidence: Number,
    prediction: String,
    error: String
  },
  // Stripe specific fields
  stripePaymentId: {
    type: String
  },
  stripePaymentIntentId: {
    type: String
  },
  stripePaymentStatus: {
    type: String,
    enum: ['succeeded', 'processing', 'failed']
  },
  // Common fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
PaymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;