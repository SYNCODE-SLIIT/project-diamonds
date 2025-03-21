import React, { useState } from 'react';
import axios from 'axios';

const PaymentForm = ({ payment, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    status: payment.status, // for example: "completed", "approved", etc.
    paymentMethod: payment.paymentMethod,
    amount: payment.amount,
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`http://localhost:4000/api/finance/payments/${payment._id}`, formData);
      onUpdated(res.data);
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <h2 className="font-bold mb-2">Edit Payment</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Amount:</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} />
          </div>
          <div>
            <label>Payment Method:</label>
            <input type="text" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} />
          </div>
          <div>
            <label>Status:</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="authorized">Authorized</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="failed">Failed</option>
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

export default PaymentForm;
