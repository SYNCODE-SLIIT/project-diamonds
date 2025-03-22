// src/components/BudgetForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const BudgetForm = ({ budget, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    allocatedBudget: budget.allocatedBudget,
    currentSpend: budget.currentSpend,
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // PATCH to update budget (using budget._id)
      const res = await axios.patch(`http://localhost:4000/api/finance/b/${budget._id}`, formData);
      onUpdated(res.data);
    } catch (error) {
      console.error("Error updating budget:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <h2 className="font-bold mb-2">Edit Budget</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Allocated Budget:</label>
            <input type="number" name="allocatedBudget" value={formData.allocatedBudget} onChange={handleChange} />
          </div>
          <div>
            <label>Current Spend:</label>
            <input type="number" name="currentSpend" value={formData.currentSpend} onChange={handleChange} />
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

export default BudgetForm;
