import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const RefundForm = ({ onClose }) => {
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateRefundAmount = () => {
    const parsedAmount = parseFloat(refundAmount);
    return !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= 100000;
  };

  const validateReason = () => 
    reason.trim().length >= 10 && reason.trim().length <= 500;

  const validateInvoiceNumber = () => 
    invoiceNumber.trim().length > 0;

  const validateReceiptFile = () =>
    receiptFile && (receiptFile.type === 'image/png' || receiptFile.type === 'application/pdf');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/png', 'application/pdf'];
      if (validTypes.includes(file.type)) {
        setReceiptFile(file);
        setMessage('');
      } else {
        setReceiptFile(null);
        setMessage('Invalid file type. Please upload PNG or PDF.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Run all validations
    if (!validateRefundAmount()) {
      setMessage('Invalid refund amount');
      setIsSubmitting(false);
      return;
    }
    if (!validateReason()) {
      setMessage('Reason must be 10-500 characters');
      setIsSubmitting(false);
      return;
    }
    if (!validateInvoiceNumber()) {
      setMessage('Invoice number is required');
      setIsSubmitting(false);
      return;
    }
    if (!validateReceiptFile()) {
      setMessage('Invalid receipt file. Only PNG or PDF accepted.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Use FormData to handle file uploads
      const formData = new FormData();
      formData.append('refundAmount', refundAmount);
      formData.append('reason', reason);
      formData.append('invoiceNumber', invoiceNumber);
      if (receiptFile) {
        formData.append('receiptFile', receiptFile);
      }

      const res = await axiosInstance.post('http://localhost:4000/api/finance/ef', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(res.data.message || 'Refund requested successfully');
      setRefundAmount('');
      setReason('');
      setInvoiceNumber('');
      setReceiptFile(null);
    } catch (error) {
      console.error('Error requesting refund:', error);
      setMessage('Error requesting refund');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md relative transform transition-all duration-300 hover:scale-105">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-t-2xl">
          <h2 className="text-3xl font-bold text-white text-center">Request Refund</h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition duration-300"
          >
            ✖
          </button>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Refund Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">RS.</span>
              <input
                type="number"
                id="refundAmount"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-3 border-2 border-gray-300 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent 
                  transition duration-300"
                min="0.01"
                step="0.01"
                required
                placeholder="   Enter refund amount"
              />
            </div>
          </div>

          <div>
            <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Number
            </label>
            <input
              type="text"
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent 
                transition duration-300"
              required
              placeholder="Enter invoice number"
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Refund
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent 
                transition duration-300 h-32"
              placeholder="Provide detailed reasons (10-500 characters)"
              required
            />
          </div>

          <div>
            <label htmlFor="receiptFile" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Receipt (PNG or PDF)
            </label>
            <input
              type="file"
              id="receiptFile"
              accept="image/png,application/pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl 
                file:mr-4 file:rounded-full file:border-0 file:bg-red-50 
                file:text-red-700 hover:file:bg-red-100 
                focus:outline-none focus:ring-2 focus:ring-red-500 
                transition duration-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-pink-700 
              text-white py-3 rounded-xl hover:from-red-700 hover:to-pink-800 
              transition duration-300 transform hover:scale-105 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Submit Refund Request'}
          </button>
        </form>

        {message && (
          <div className="px-6 pb-6">
            <div className={`p-3 rounded-lg 
              ${message.includes('Error') 
                ? 'bg-red-50 border-l-4 border-red-500 text-red-700' 
                : 'bg-green-50 border-l-4 border-green-500 text-green-700'
              }`}
            >
              <p>{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundForm;