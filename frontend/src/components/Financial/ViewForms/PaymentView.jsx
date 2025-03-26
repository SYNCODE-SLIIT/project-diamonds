// src/components/Modals/PaymentViewModal.jsx
import React from 'react';

const PaymentViewModal = ({ payment, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
        <div className="mb-4">
          <strong>Amount:</strong> {payment?.amount || 'N/A'}
        </div>
        <div className="mb-4">
          <strong>Method:</strong> {payment?.paymentMethod || 'N/A'}
        </div>
        <div className="mb-4">
          <strong>Status:</strong> {payment?.status || 'N/A'}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentViewModal;