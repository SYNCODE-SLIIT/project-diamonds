import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const BudgetForm = () => {
  const [allocatedBudget, setAllocatedBudget] = useState('');
  const [remainingBudget, setRemainingBudget] = useState('');
  const [status, setStatus] = useState('pending'); // pending, approved, or declined
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/api/finance/cb', { allocatedBudget, remainingBudget, status });
      setMessage(res.data.message || 'Budget request created successfully');
      setAllocatedBudget('');
      setRemainingBudget('');
    } catch (error) {
      console.error('Error creating budget:', error);
      setMessage('Error creating budget');
    }
  };

  return (
    <div>
      <h2>Create Budget Request</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="allocatedBudget">Allocated Budget:</label>
          <input
            type="number"
            id="allocatedBudget"
            value={allocatedBudget}
            onChange={(e) => setAllocatedBudget(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="remainingBudget">Remaining Budget:</label>
          <input
            type="number"
            id="remainingBudget"
            value={remainingBudget}
            onChange={(e) => setRemainingBudget(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <button type="submit">Submit Budget Request</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BudgetForm;
 