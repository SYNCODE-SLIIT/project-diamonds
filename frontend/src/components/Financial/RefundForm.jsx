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
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`http://localhost:4000/api/finance/refunds/${refund._id}`, formData);
      onUpdated(res.data);
    } catch (error) {
      console.error("Error updating refund:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <h2 className="font-bold mb-2">Edit Refund</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Refund Amount:</label>
            <input type="number" name="refundAmount" value={formData.refundAmount} onChange={handleChange} />
          </div>
          <div>
            <label>Reason:</label>
            <input type="text" name="reason" value={formData.reason} onChange={handleChange} />
          </div>
          <div>
            <label>Status:</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="mt-2 flex gap-2">
            <button type="submit" className="bg-green-500 text-white px-2 py-1">Update</button>
            <button type="button" className="bg-gray-500 text-white px-2 py-1" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundForm;
