import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const PaymentForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [bankSlip, setBankSlip] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBankSlip(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Using FormData to support file upload
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('reason', reason);
      formData.append('amount', amount);
      formData.append('paymentMethod', paymentMethod);
      if (bankSlip) {
        formData.append('bankSlip', bankSlip);
      }

      const res = await axiosInstance.post('http://localhost:4000/api/finance/mp', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Payment failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Make a Payment</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reason">Reason for Payment:</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="paymentMethod">Payment Method:</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
        <div>
          <label htmlFor="bankSlip">Upload Bank Slip (PNG or PDF):</label>
          <input
            type="file"
            id="bankSlip"
            accept="image/png,application/pdf"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit">Submit Payment</button>
      </form>
      
      {response && (
        <div style={{ marginTop: '20px' }}>
          <h3>Payment Processed Successfully</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default PaymentForm;
