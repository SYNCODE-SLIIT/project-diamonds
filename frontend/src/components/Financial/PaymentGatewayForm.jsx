import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const PaymentGatewayForm = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Gateway typically does not require a file upload.
  const validateAmount = () => {
    const parsedAmount = parseFloat(amount);
    return !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= 100000;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!validateAmount()) {
      setError('Invalid amount');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('amount', amount);
      // Set the payment method for Payment Gateway
      formData.append('paymentMethod', 'payment_gateway');

      const res = await axiosInstance.post('http://localhost:4000/api/finance/mp', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResponse(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-transparent shadow-2xl rounded-2xl p-6 transform transition-all duration-300 hover:scale-105">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 -mx-6 -mt-6 mb-6 rounded-t-2xl">
        <h2 className="text-3xl font-bold text-white text-center">Payment Gateway</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-3 border-2 border-gray-300 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                transition duration-300"
              min="0.01"
              step="0.01"
              required
              placeholder="Enter amount"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 
            text-white py-3 rounded-xl hover:from-purple-700 hover:to-indigo-800 
            transition duration-300 transform hover:scale-105 
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing Payment...' : 'Submit Payment'}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3 rounded">
          <p className="text-green-700">Payment Processed Successfully</p>
        </div>
      )}
    </div>
  );
};

export default PaymentGatewayForm;