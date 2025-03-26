// src/components/Forms/PaymentForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const PaymentForm = ({ payment, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    status: payment.status, // e.g., "completed", "approved", etc.
    paymentMethod: payment.paymentMethod,
    amount: payment.amount,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(
        `http://localhost:4000/api/finance/p/${payment._id}`,
        formData
      );
      onUpdated(res.data);
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  return (
    // Position the form overlay near the top-center
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      {/* Modal container with moderate size (max-w-xl) */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold mb-8">Edit Payment</h2>
        <form onSubmit={handleSubmit}>
          {/* Each input is on its own row */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Amount:</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Payment Method:</label>
            <input
              type="text"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Status:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="authorized">Authorized</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex justify-end gap-6 mt-8">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors duration-200"
            >
              Update
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
