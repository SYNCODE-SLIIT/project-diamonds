import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const StripeCheckoutButton = ({ amount, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post('/api/stripe/create-checkout-session', {
        amount: amount * 100, // cents
        successUrl: window.location.origin + '/payment-success',
        cancelUrl: window.location.origin + '/payment-cancel',
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to redirect to Stripe Checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-md mx-auto w-full">
      <div className="flex flex-col items-center mb-6">
        <img src="/logo192.png" alt="Brand Logo" className="w-16 h-16 mb-2" />
        <h2 className="text-3xl font-bold text-gray-800 text-center">Stripe Payment</h2>
        <p className="text-gray-500 text-center mt-1">Pay securely using Stripe</p>
      </div>
      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-3 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Redirecting...
          </>
        ) : (
          `Pay with Card`
        )}
      </button>
      <div className="mt-6 flex justify-center">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 underline text-sm focus:outline-none"
          type="button"
        >
          Cancel / Close
        </button>
      </div>
    </div>
  );
};

export default StripeCheckoutButton; 