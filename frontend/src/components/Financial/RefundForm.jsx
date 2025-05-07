import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { uploadFile } from '../../utils/uploadFile';

const RefundForm = ({ onClose, userData }) => {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Validation functions
  const validateReason = () => reason.trim().length >= 10 && reason.trim().length <= 500;
  const validateAmount = () => {
    const parsedAmount = parseFloat(amount);
    return !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= 100000;
  };
  const validateReceipt = () => {
    if (!receipt) return false;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(receipt.type)) {
      setMessage('Invalid file type. Please upload an image or PDF.');
      return false;
    }
    if (receipt.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB.');
      return false;
    }
    if (receipt.type === 'application/pdf' && !receipt.name.toLowerCase().endsWith('.pdf')) {
      setMessage('Invalid PDF file. File must have a .pdf extension.');
      return false;
    }
    return true;
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceipt(file);
      setMessage('');
      setUploadProgress(0);
      setReceiptUrl('');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      try {
        setMessage('Uploading file...');
        const uploadedUrl = await uploadFile(file);
        setReceiptUrl(uploadedUrl);
        setMessage('File uploaded successfully.');
      } catch (err) {
        setMessage(err.message || 'File upload failed.');
        setReceiptUrl('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setUploadProgress(0);
    if (!validateReason()) {
      setMessage('Reason must be between 10 and 500 characters.');
      setIsSubmitting(false);
      return;
    }
    if (!validateAmount()) {
      setMessage('Invalid amount.');
      setIsSubmitting(false);
      return;
    }
    if (!validateReceipt()) {
      setIsSubmitting(false);
      return;
    }
    if (!receiptUrl) {
      setMessage('Please wait for the file to finish uploading.');
      setIsSubmitting(false);
      return;
    }
    try {
      const payload = {
        reason,
        refundAmount: amount,
        receiptFile: receiptUrl,
      };
      const res = await axiosInstance.post(API_PATHS.FINANCIAL.REQUEST_REFUND, payload);
      setMessage(res.data.message || 'Refund requested successfully.');
      setReason('');
      setAmount('');
      setReceipt(null);
      setReceiptUrl('');
    } catch (error) {
      console.error('Error requesting refund:', error);
      setMessage(error.response?.data?.message || 'Error requesting refund.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const FilePreview = () => {
    if (!previewUrl) return null;
    const isPDF = receipt?.type === 'application/pdf' || previewUrl.includes('.pdf');
    return (
      <div className="mt-4 border rounded p-2">
        <h4 className="text-sm font-medium mb-2">File Preview</h4>
        {isPDF ? (
          <div className="bg-gray-100 p-4 rounded text-center">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">PDF Document</p>
            <p className="text-sm text-gray-500 mb-4">
              {receipt?.name || 'Uploaded PDF'}
            </p>
            <div className="flex flex-col items-center space-y-2">
              {receiptUrl && (
                <iframe
                  src={receiptUrl}
                  className="w-full h-96 border rounded mb-2"
                  title="PDF Preview"
                />
              )}
              <a
                href={receiptUrl || previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                Open PDF in new tab
              </a>
            </div>
          </div>
        ) : (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-64 mx-auto rounded shadow"
          />
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Request Refund</h2>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Reason</label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={reason}
          onChange={e => setReason(e.target.value)}
          minLength={10}
          maxLength={500}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Amount</label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min={1}
          max={100000}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Receipt (Image or PDF)</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          required
        />
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>
      <FilePreview />
      {message && <div className="mt-4 text-center text-sm text-blue-700 font-medium">{message}</div>}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default RefundForm;