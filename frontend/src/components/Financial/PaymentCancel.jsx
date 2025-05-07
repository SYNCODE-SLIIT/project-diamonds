import React from 'react';

const PaymentCancel = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 p-4">
    <div className="bg-white shadow-2xl rounded-2xl p-10 flex flex-col items-center max-w-md w-full">
      <div className="bg-red-100 rounded-full p-6 mb-6 flex items-center justify-center">
        <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fee2e2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6m0-6l6 6" />
        </svg>
      </div>
      <h1 className="text-3xl font-extrabold text-red-700 mb-2 text-center">Payment Cancelled</h1>
      <p className="text-base text-gray-700 mb-6 text-center">Your payment was not completed.<br />You can try again or contact support if you need help.</p>
      <div className="flex flex-col gap-3 w-full">
        <a href="/" className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl text-center font-semibold shadow hover:from-red-600 hover:to-pink-600 transition">Go back to Home</a>
        <a href="/merchandise" className="w-full bg-white border border-red-300 text-red-600 py-3 rounded-xl text-center font-semibold shadow hover:bg-red-50 transition">Try Payment Again</a>
      </div>
      <div className="mt-6 text-xs text-gray-400 text-center">If you believe this is a mistake, please contact our support team for assistance.</div>
    </div>
  </div>
);

export default PaymentCancel; 