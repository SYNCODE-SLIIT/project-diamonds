import React, { useState } from 'react';
import axios from 'axios';

const BudgetForm = ({ budget, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    allocatedBudget: budget.allocatedBudget,
    currentSpend: budget.currentSpend,
    status: budget.status // Added status field
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-500 ">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Edit Budget</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="allocatedBudget" className="block text-sm font-medium mb-1">
              Allocated Budget:
            </label>
            <input
              id="allocatedBudget"
              type="number"
              name="allocatedBudget"
              value={formData.allocatedBudget}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="currentSpend" className="block text-sm font-medium mb-1">
              Current Spend:
            </label>
            <input
              id="currentSpend"
              type="number"
              name="currentSpend"
              value={formData.currentSpend}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status:
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            >
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
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

export default BudgetForm;
