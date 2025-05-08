import React from 'react';

const PaymentSuccess = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
    <h1 className="text-3xl font-bold text-green-700 mb-4">Payment Successful!</h1>
    <p className="text-lg text-gray-700 mb-6">Thank you for your purchase. Your payment was processed successfully.</p>
    <a href="/" className="text-blue-600 underline">Go back to Home</a>
  </div>
);

export default PaymentSuccess; 