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
    setFormData({...formData, [e.target.name]: e.target.value});
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <h2 className="font-bold mb-2">Edit Invoice</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Invoice Number:</label>
            <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} />
          </div>
          <div>
            <label>Amount:</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} />
          </div>
          <div>
            <label>Category:</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} />
          </div>
          <div>
            <label>Status:</label>
            <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
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

export default InvoiceForm;
