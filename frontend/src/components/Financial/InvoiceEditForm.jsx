// src/components/Forms/InvoiceForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const InvoiceForm = ({ invoice, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.amount,
    paymentStatus: invoice.paymentStatus,
    category: invoice.category,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`http://localhost:4000/api/finance/i/${invoice._id}`, formData);
      onUpdated(res.data);
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  return (
    // Using fixed positioning without an opaque background overlay.
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-500">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Edit Invoice</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Invoice Number:</label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount:</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category:</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium text-sm mb-1">Status:</label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-200"
            >
              Update
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
