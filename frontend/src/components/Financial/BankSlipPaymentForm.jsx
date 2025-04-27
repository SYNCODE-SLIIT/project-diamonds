import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const BankSlipPaymentForm = ({ onClose, onExpenseAdded }) => {
  const [paymentFor, setPaymentFor] = useState('merchandise');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [bankSlip, setBankSlip] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateFirstName = () => {
    if (!firstName.trim()) return 'First name is required';
    if (firstName.trim().length < 2 || !/^[A-Za-z]+$/.test(firstName)) return 'Enter a valid first name';
    return '';
  };
  const validateLastName = () => {
    if (!lastName.trim()) return 'Last name is required';
    if (lastName.trim().length < 2 || !/^[A-Za-z]+$/.test(lastName)) return 'Enter a valid last name';
    return '';
  };
  const validateAmount = () => {
    const parsedAmount = parseFloat(amount);
    if (amount === '') return '';
    if (isNaN(parsedAmount) || parsedAmount <= 0) return 'Amount must be greater than 0';
    if (parsedAmount > 100000) return 'Amount must not exceed 100,000';
    return '';
  };
  const validateReason = () => {
    if (!reason.trim()) return 'Reason is required';
    if (reason.trim().length < 10 || reason.trim().length > 500) return 'Reason must be 10-500 characters';
    return '';
  };
  const validateBankSlip = () => {
    if (!bankSlip) return 'Bank slip is required';
    if (!(bankSlip.type === 'image/png' || bankSlip.type === 'application/pdf')) return 'Invalid file type. Please upload PNG or PDF.';
    return '';
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBankSlip(file);
      setTouched((prev) => ({ ...prev, bankSlip: true }));
    }
  };

  const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, amount: true, reason: true, bankSlip: true });
    setIsSubmitting(true);
    setError('');

    // Validate all fields
    const validations = [
      { validate: !validateFirstName(), message: validateFirstName() },
      { validate: !validateLastName(), message: validateLastName() },
      { validate: !validateAmount(), message: validateAmount() },
      { validate: !validateReason(), message: validateReason() },
      { validate: !validateBankSlip(), message: validateBankSlip() }
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
    <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-md mx-auto w-full">
      {/* Header with logo */}
      <div className="flex flex-col items-center mb-6">
        <img src="/logo192.png" alt="Brand Logo" className="w-16 h-16 mb-2" />
        <h2 className="text-3xl font-bold text-gray-800 text-center">Bank Slip Payment</h2>
        <p className="text-gray-500 text-center mt-1">Upload your bank slip for secure payment</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Summary Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-2">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Payment Summary</h3>
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-600">Amount</span>
            <span className="font-bold text-lg text-blue-700">{amount ? `RS. ${amount}` : '--'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">For</span>
            <span className="font-semibold text-gray-700 capitalize">{paymentFor}</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleBlur('firstName')}
              className={`w-full px-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-300 ${touched.firstName && validateFirstName() ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
              required
              placeholder="Enter first name"
              aria-invalid={!!(touched.firstName && validateFirstName())}
              aria-describedby="firstName-error"
            />
            {touched.firstName && validateFirstName() && (
              <div id="firstName-error" className="text-red-600 text-sm mt-1">{validateFirstName()}</div>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleBlur('lastName')}
              className={`w-full px-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-300 ${touched.lastName && validateLastName() ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
              required
              placeholder="Enter last name"
              aria-invalid={!!(touched.lastName && validateLastName())}
              aria-describedby="lastName-error"
            />
            {touched.lastName && validateLastName() && (
              <div id="lastName-error" className="text-red-600 text-sm mt-1">{validateLastName()}</div>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">Reason for Payment</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => handleBlur('reason')}
            className={`w-full px-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-300 h-24 ${touched.reason && validateReason() ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
            required
            placeholder="Describe the reason for your payment"
            aria-invalid={!!(touched.reason && validateReason())}
            aria-describedby="reason-error"
          />
          {touched.reason && validateReason() && (
            <div id="reason-error" className="text-red-600 text-sm mt-1">{validateReason()}</div>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">RS.</span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={() => handleBlur('amount')}
                className={`w-full pl-7 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-300 ${touched.amount && validateAmount() ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
                min="0.01"
                step="0.01"
                required
                placeholder="Enter amount"
                aria-invalid={!!(touched.amount && validateAmount())}
                aria-describedby="amount-error"
              />
            </div>
            {touched.amount && validateAmount() && (
              <div id="amount-error" className="text-red-600 text-sm mt-1">{validateAmount()}</div>
            )}
          </div>
          <div>
            <label htmlFor="paymentFor" className="block text-sm font-medium text-gray-700 mb-2">Payment For</label>
            <select
              id="paymentFor"
              value={paymentFor}
              onChange={(e) => setPaymentFor(e.target.value)}
              className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              required
            >
              <option value="merchandise">Merchandise</option>
              <option value="package">Package</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="bankSlip" className="block text-sm font-medium text-gray-700 mb-2">Upload Bank Slip (PNG or PDF)</label>
          <input
            type="file"
            id="bankSlip"
            accept="image/png,application/pdf"
            onChange={handleFileChange}
            onBlur={() => handleBlur('bankSlip')}
            className={`w-full px-3 py-2 border-2 rounded-xl file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 transition duration-300 ${touched.bankSlip && validateBankSlip() ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'}`}
            aria-invalid={!!(touched.bankSlip && validateBankSlip())}
            aria-describedby="bankSlip-error"
          />
          {touched.bankSlip && validateBankSlip() && (
            <div id="bankSlip-error" className="text-red-600 text-sm mt-1">{validateBankSlip()}</div>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || validateFirstName() || validateLastName() || validateAmount() || validateReason() || validateBankSlip()}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-teal-800 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {isSubmitting ? 'Processing Payment...' : 'Submit Payment'}
        </button>
      </form>
      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {response && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3 rounded flex items-center">
          <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <div>
            <p className="text-green-700 font-semibold">Payment Processed Successfully</p>
            <p className="text-green-700 text-sm mt-1">Thank you for your payment.</p>
            {response.expense && (
              <div className="mt-2">
                <h3 className="text-sm font-bold">Expense Record</h3>
                <p>Category: {response.expense.category}</p>
                <p>Amount: RS. {response.expense.amount}</p>
                <p>Date: {new Date(response.expense.date).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-center">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 underline text-sm focus:outline-none"
          type="button"
        >
          Cancel / Close
        </button>
      </div>
    </div>
  );
};

export default BankSlipPaymentForm;