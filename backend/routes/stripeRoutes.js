import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPaymentIntent,
  handleSuccessfulPayment,
  handleWebhook,
  createCheckoutSession,
} from '../controllers/stripeController.js';

import { createDonationCheckoutSession } from '../controllers/stripeController.js';


const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', protect, createPaymentIntent);

// Handle successful payment
router.post('/successful-payment', protect, handleSuccessfulPayment);

// Webhook endpoint (no auth required as it's called by Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Create Stripe Checkout session
router.post('/create-checkout-session', createCheckoutSession);

// In your routes file, e.g., routes/stripe.js
router.post('/create-donation-checkout-session', createDonationCheckoutSession);
export default router; 