// src/components/Forms/RefundForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const RefundForm = ({ refund, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    refundAmount: refund.refundAmount,
    reason: refund.reason,
    status: refund.status,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`http://localhost:4000/api/finance/r/${refund._id}`, formData);
      onUpdated(res.data);
    } catch (error) {
      console.error("Error updating refund:", error);
    }
  };

  return (
    // The form overlays on the FinancialDashboard, without a dark opaque background.
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      {/* Use a moderately large modal container */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl w-full">
        <h2 className="text-3xl font-bold mb-8">Edit Refund</h2>
        <form onSubmit={handleSubmit}>
          {/* Refund Amount on its own row */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Refund Amount:</label>
            <input 
              type="number" 
              name="refundAmount" 
              value={formData.refundAmount} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          {/* Reason on its own row */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Reason:</label>
            <input 
              type="text" 
              name="reason" 
              value={formData.reason} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          {/* Status on its own row */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Status:</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {/* Action Buttons */}
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

export default RefundForm;
