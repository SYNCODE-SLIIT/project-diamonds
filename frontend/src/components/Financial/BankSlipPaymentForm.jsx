import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const BankSlipPaymentForm = ({ onClose, userData }) => {
  const [paymentFor, setPaymentFor] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [bankSlip, setBankSlip] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Pre-fill user data if available
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
    }
  }, [userData]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Validation functions
  const validatePaymentFor = () => paymentFor.trim().length > 0;
  const validateFirstName = () => firstName.trim().length > 0;
  const validateLastName = () => lastName.trim().length > 0;
  const validateReason = () => reason.trim().length >= 10 && reason.trim().length <= 500;
  
  const validateAmount = () => {
    const parsedAmount = parseFloat(amount);
    return !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= 100000;
  };
  
  // Enhanced PDF validation
  const validateBankSlip = () => {
    if (!bankSlip) return false;
    
    // Check file type
    const validTypes = ['image/png', 'application/pdf'];
    if (!validTypes.includes(bankSlip.type)) {
      setMessage('Invalid file type. Please upload PNG or PDF.');
      return false;
    }
    
    // Check file size (5MB limit)
    if (bankSlip.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB.');
      return false;
    }
    
    // For PDFs, check extension
    if (bankSlip.type === 'application/pdf' && !bankSlip.name.toLowerCase().endsWith('.pdf')) {
      setMessage('Invalid PDF file. File must have a .pdf extension.');
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Clear previous preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      // Set the file
      setBankSlip(file);
      setMessage('');
      
      // Create preview URL for images and PDFs
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setUploadProgress(0);

    if (!validatePaymentFor()) {
      setMessage('Payment purpose is required.');
      setIsSubmitting(false);
      return;
    }
    if (!validateFirstName()) {
      setMessage('First name is required.');
      setIsSubmitting(false);
      return;
    }
    if (!validateLastName()) {
      setMessage('Last name is required.');
      setIsSubmitting(false);
      return;
    }
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
    if (!validateBankSlip()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('paymentFor', paymentFor);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('reason', reason);
      formData.append('amount', amount);
      if (bankSlip) {
        formData.append('bankSlip', bankSlip);
      }

      // Use the financial route endpoint from API_PATHS with progress tracking
      const res = await axiosInstance.post(API_PATHS.FINANCIAL.ADD_PAYMENT, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      setMessage(res.data.message || 'Payment submitted successfully.');
      
      // If the response includes the Cloudinary URL, update the preview
      if (res.data.bankSlipFile) {
        setPreviewUrl(res.data.bankSlipFile);
      }

      // Clear form fields but keep the preview URL for confirmation
      setPaymentFor('');
      setFirstName('');
      setLastName('');
      setReason('');
      setAmount('');
      setBankSlip(null);
    } catch (error) {
      console.error('Error submitting payment:', error);
      setMessage(error.response?.data?.message || 'Error submitting payment.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // PDF Preview Component
  const FilePreview = () => {
    if (!previewUrl) return null;
    
    const isPDF = bankSlip?.type === 'application/pdf' || previewUrl.includes('.pdf');
    
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
              {bankSlip?.name || 'Uploaded PDF'}
            </p>
            <div className="flex flex-col items-center space-y-2">
              {/* For Cloudinary PDFs */}
              {previewUrl.includes('cloudinary') && (
                <iframe
                  src={previewUrl.replace('/upload/', '/upload/fl_attachment/')}
                  className="w-full h-96 border rounded mb-2"
                  title="PDF Preview"
                />
              )}
              {/* For local file preview */}
              {!previewUrl.includes('cloudinary') && (
                <iframe
                  src={previewUrl}
                  className="w-full h-96 border rounded mb-2"
                  title="PDF Preview"
                />
              )}
              {/* Always show download and open buttons */}
              <div className="flex justify-center space-x-2 w-full">
                <a 
                  href={previewUrl.includes('cloudinary') 
                    ? previewUrl.replace('/upload/', '/upload/fl_attachment/') 
                    : previewUrl}
                  download
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </a>
                <a 
                  href={previewUrl.includes('cloudinary') 
                    ? previewUrl.replace('/upload/', '/upload/fl_attachment/') 
                    : previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View in Browser
                </a>
              </div>
            </div>
          </div>
        ) : (
          <img 
            src={previewUrl} 
            alt="Bank Slip Preview" 
            className="max-h-96 mx-auto"
          />
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bank Slip Payment</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment For
            </label>
            <input
              type="text"
              value={paymentFor}
              onChange={(e) => setPaymentFor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter payment purpose"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (RS.)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Explain the payment reason (10-500 characters)"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Slip (PNG or PDF)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept=".png,.pdf,image/png,application/pdf"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: 5MB. Accepted formats: PNG, PDF
            </p>
          </div>
          
          {/* File Preview */}
          <FilePreview />
          
          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}
          
          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankSlipPaymentForm;