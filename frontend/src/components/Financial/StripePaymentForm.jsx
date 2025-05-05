import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const StripePaymentForm = ({ onClose, amount, paymentFor }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      setProcessing(false);
      return;
    }

    try {
      // Create payment intent on the server
      const { data: clientSecret } = await axiosInstance.post('/api/finance/create-payment-intent', {
        amount: amount * 100, // Convert to cents for Stripe
        paymentFor
      });

      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // You can add billing details here if needed
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Create payment record in your database
        await axiosInstance.post(API_PATHS.FINANCIAL.ADD_PAYMENT, {
          amount,
          paymentMethod: 'stripe',
          paymentFor,
          stripePaymentId: paymentIntent.id,
          status: 'approved' // Since Stripe payments are instant
        });

        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while processing your payment.');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Stripe Payment</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Payment successful! Redirecting...
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Amount</label>
        <div className="p-2 border border-gray-300 rounded bg-gray-50">
          RS. {amount}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Card Details</label>
        <div className="p-3 border border-gray-300 rounded">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          onClick={onClose}
          disabled={processing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={!stripe || processing}
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
};

export default StripePaymentForm; 