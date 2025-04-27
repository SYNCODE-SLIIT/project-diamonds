// components/Dashboard/RefundForm.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const RefundForm = ({ onClose, paymentId, prefillInvoiceNumber, userData }) => {
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill invoice number if provided
  useEffect(() => {
    if (prefillInvoiceNumber) {
      setInvoiceNumber(prefillInvoiceNumber);
    }
  }, [prefillInvoiceNumber]);

  // Validation functions
  const validateRefundAmount = () => {
    const parsedAmount = parseFloat(refundAmount);
    return !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= 100000;
  };

  const validateReason = () => reason.trim().length >= 10 && reason.trim().length <= 500;
  const validateInvoiceNumber = () => invoiceNumber.trim().length > 0;
  // Receipt file is required—ensure the file is PNG or PDF.
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

    if (!validateRefundAmount()) {
      setMessage('Invalid refund amount.');
      setIsSubmitting(false);
      return;
    }
    if (!validateReason()) {
      setMessage('Reason must be between 10 and 500 characters.');
      setIsSubmitting(false);
      return;
    }
    if (!validateInvoiceNumber()) {
      setMessage('Invoice number is required.');
      setIsSubmitting(false);
      return;
    }
    if (!validateReceiptFile()) {
      setMessage('Invalid receipt file. Only PNG or PDF accepted.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('refundAmount', refundAmount);
      formData.append('reason', reason);
      formData.append('invoiceNumber', invoiceNumber);
      if (paymentId) {
        formData.append('paymentId', paymentId);
      }
      if (receiptFile) {
        formData.append('receiptFile', receiptFile);
      }

      // Use the financial route endpoint from API_PATHS.
      const res = await axiosInstance.post(API_PATHS.REFUND.ADD_REFUND, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message || 'Refund requested successfully.');
      // Clear refund amount and reason; invoice number remains for reference.
      setRefundAmount('');
      setReason('');
      setReceiptFile(null);
    } catch (error) {
      console.error('Error requesting refund:', error);
      setMessage('Error requesting refund.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Transparent backdrop with subtle blur */}
      <div className="bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl rounded-2xl w-full max-w-md relative transform transition-all duration-300">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Refund Request Form</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            &times;
          </button>
        )}

        {/* Display user information if available */}
        {userData && (
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Name:</strong> {userData.name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Email:</strong> {userData.email}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Refund Amount (RS)
            </label>
            <input
              type="number"
              id="refundAmount"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              min="0.01"
              step="0.01"
              required
              placeholder="Enter refund amount"
            />
          </div>

          <div>
            <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              required
              placeholder="Enter invoice number"
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Refund
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 transition duration-300"
              placeholder="Enter a detailed reason (10-500 characters)"
              rows="4"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="receiptFile" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Receipt (PNG or PDF)
            </label>
            <input
              type="file"
              id="receiptFile"
              accept="image/png,application/pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Submit Refund Request'}
          </button>
        </form>

        {message && (
          <div className="p-4">
            <div
              className={`p-3 rounded-md text-sm ${
                message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundForm;