import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const RefundForm = () => {
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/api/finance/ef', { refundAmount, reason });
      setMessage(res.data.message || 'Refund requested successfully');
      setRefundAmount('');
      setReason('');
    } catch (error) {
      console.error('Error requesting refund:', error);
      setMessage('Error requesting refund');
    }
  };

  return (
    <div>
      <h2>Request Refund</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="refundAmount">Refund Amount:</label>
          <input
            type="number"
            id="refundAmount"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reason">Reason:</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <button type="submit">Submit Refund Request</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RefundForm;
