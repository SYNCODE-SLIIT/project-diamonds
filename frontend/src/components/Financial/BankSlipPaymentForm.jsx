import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const BankSlipPaymentForm = ({ onClose, onExpenseAdded }) => {
  // New state for paymentFor
  const [paymentFor, setPaymentFor] = useState('merchandise'); // default to 'merchandise'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [bankSlip, setBankSlip] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions remain the same...
  const validateFirstName = () =>
    firstName.trim().length >= 2 && /^[A-Za-z]+$/.test(firstName);
  const validateLastName = () =>
    lastName.trim().length >= 2 && /^[A-Za-z]+$/.test(lastName);
  const validateAmount = () => {
    const parsedAmount = parseFloat(amount);
    return !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= 100000;
  };
  const validateReason = () =>
    reason.trim().length >= 10 && reason.trim().length <= 500;
  const validateBankSlip = () =>
    bankSlip && (bankSlip.type === 'image/png' || bankSlip.type === 'application/pdf');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/png', 'application/pdf'];
      if (validTypes.includes(file.type)) {
        setBankSlip(file);
        setError('');
      } else {
        setBankSlip(null);
        setError('Invalid file type. Please upload PNG or PDF.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate inputs
    const validations = [
      { validate: validateFirstName(), message: 'Invalid first name' },
      { validate: validateLastName(), message: 'Invalid last name' },
      { validate: validateAmount(), message: 'Invalid amount' },
      { validate: validateReason(), message: 'Reason must be 10-500 characters' },
      { validate: validateBankSlip(), message: 'Invalid bank slip' }
    ];
    const failedValidation = validations.find(v => !v.validate);
    if (failedValidation) {
      setError(failedValidation.message);
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('reason', reason);
      formData.append('amount', amount);
      // Append the payment method and paymentFor information
      formData.append('paymentMethod', 'bankslip');
      formData.append('paymentFor', paymentFor);

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

      if (onExpenseAdded && res.data.expense) {
        onExpenseAdded(res.data.expense);
      }
    } catch (err) {
      console.error(err);
      setError('Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl p-6 transform transition-all duration-300 hover:scale-105">
      <div className="bg-gradient-to-r from-blue-500 to-teal-600 p-4 -mx-6 -mt-6 mb-6 rounded-t-2xl">
        <h2 className="text-3xl font-bold text-white text-center">Bank Slip Payment</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Other input fields for first name, last name, etc. */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                transition duration-300"
              required
              placeholder="Enter first name"
            />
          </div>

        <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                transition duration-300"
              required
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Payment
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              transition duration-300 h-24"
            required
            placeholder="Describe the reason for your payment"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">RS.</span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-3 border-2 border-gray-300 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                  transition duration-300"
                min="0.01"
                step="0.01"
                required
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div>
            <label htmlFor="paymentFor" className="block text-sm font-medium text-gray-700 mb-2">
              Payment For
            </label>
            <select
              id="paymentFor"
              value={paymentFor}
              onChange={(e) => setPaymentFor(e.target.value)}
              className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                transition duration-300"
              required
            >
              <option value="merchandise">Merchandise</option>
              <option value="package">Package</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="bankSlip" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Bank Slip (PNG or PDF)
          </label>
          <input
            type="file"
            id="bankSlip"
            accept="image/png,application/pdf"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl 
              file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 
              file:text-blue-700 hover:file:bg-blue-100 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              transition duration-300"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-700 
            text-white py-3 rounded-xl hover:from-blue-700 hover:to-teal-800 
            transition duration-300 transform hover:scale-105 
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing Payment...' : 'Submit Payment'}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3 rounded">
          <p className="text-green-700">Payment Processed Successfully</p>
          {response.expense && (
            <div className="mt-2">
              <h3 className="text-sm font-bold">Expense Record</h3>
              <p>Category: {response.expense.category}</p>
              <p>Amount: RS. {response.expense.amount}</p>
              <p>Date: {new Date(response.expense.date).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BankSlipPaymentForm;