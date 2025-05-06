import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import { createFinanceNotification } from './financeNotificationController.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'lkr',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
};

// Handle successful payment
export const handleSuccessfulPayment = async (req, res) => {
  try {
    const { paymentIntentId, amount, paymentMethod } = req.body;

    // Create a new payment record
    const payment = new Payment({
      user: req.user._id,
      amount,
      paymentMethod: 'stripe',
      stripePaymentIntentId: paymentIntentId,
      status: 'completed',
      stripePaymentStatus: 'succeeded'
    });

    await payment.save();

    // Create notification for the user
    await createFinanceNotification({
      userId: req.user._id,
      message: `Your payment of RS. ${amount} was successful.`,
      type: 'success',
      paymentId: payment._id
    });

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Error handling successful payment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Handle Stripe webhook events
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Update payment status in database
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { 
            status: 'completed',
            stripePaymentStatus: 'succeeded'
          }
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        // Update payment status in database
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: failedPayment.id },
          { 
            status: 'failed',
            stripePaymentStatus: 'failed'
          }
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

// Create a Stripe Checkout session
export const createCheckoutSession = async (req, res) => {
  const { amount, productName, userEmail, successUrl, cancelUrl, orderId, quantity, productId, productImage, currency } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail, // Pre-fill email if provided
      line_items: [
        {
          price_data: {
            currency: currency || 'lkr', // Use provided currency or default to LKR
            product_data: {
              name: productName || 'Product name',
              images: productImage ? [productImage] : [],
            },
            unit_amount: amount, // amount in cents
          },
          quantity: quantity || 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: orderId || '',
        quantity: quantity || 1,
        userEmail: userEmail || '',
        productId: productId || '',
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating Stripe Checkout session:', err);
    res.status(500).json({ error: err.message });
  }
}; 