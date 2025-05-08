import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const PaymentGatewayForm = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const validateAmount = () => {
    const parsedAmount = parseFloat(amount);
    if (amount === '') return '';
    if (isNaN(parsedAmount) || parsedAmount <= 0) return 'Amount must be greater than 0';
    if (parsedAmount > 100000) return 'Amount must not exceed 100,000';
    return '';
  };

  const amountError = touched ? validateAmount() : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setIsSubmitting(true);
    setError('');

    if (validateAmount()) {
      setError(validateAmount());
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('amount', amount);
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
    <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-md mx-auto w-full">
      {/* Header with logo */}
      <div className="flex flex-col items-center mb-6">
        <img src="/logo192.png" alt="Brand Logo" className="w-16 h-16 mb-2" />
        <h2 className="text-3xl font-bold text-gray-800 text-center">Payment Gateway</h2>
        <p className="text-gray-500 text-center mt-1">Pay securely using our trusted gateway</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Summary Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-2">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Payment Summary</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Amount</span>
            <span className="font-bold text-lg text-indigo-700">{amount ? `RS. ${amount}` : '--'}</span>
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">RS.</span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setTouched(true); }}
              onBlur={() => setTouched(true)}
              className={`w-full pl-7 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-300 ${amountError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-500'}`}
              min="0.01"
              step="0.01"
              required
              placeholder="Enter amount"
              aria-invalid={!!amountError}
              aria-describedby="amount-error"
            />
          </div>
          {amountError && (
            <div id="amount-error" className="text-red-600 text-sm mt-1">{amountError}</div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !!amountError}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-3 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {isSubmitting ? 'Processing Payment...' : 'Submit Payment'}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3 rounded flex items-center">
          <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <div>
            <p className="text-green-700 font-semibold">Payment Processed Successfully</p>
            <p className="text-green-700 text-sm mt-1">Thank you for your payment.</p>
          </div>
        </div>
      )}

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

export default PaymentGatewayForm;