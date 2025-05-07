import React, { useState } from 'react';
import { LuArrowLeft, LuUpload } from 'react-icons/lu';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';

const RefundForm = ({ payment, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    refundAmount: payment?.amount || 0,
    reason: '',
    receiptFile: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        receiptFile: file
      }));
      
      // Clear error when user selects a file
      if (errors.receiptFile) {
        setErrors(prev => ({
          ...prev,
          receiptFile: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.reason) {
      newErrors.reason = 'Please provide a reason for the refund';
    }
    
    if (formData.refundAmount <= 0) {
      newErrors.refundAmount = 'Refund amount must be greater than 0';
    }
    
    if (formData.refundAmount > payment.amount) {
      newErrors.refundAmount = 'Refund amount cannot exceed the original payment amount';
    }
    
    if (!formData.receiptFile) {
      newErrors.receiptFile = 'Please upload the invoice or receipt for the item you want to refund';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('refundAmount', formData.refundAmount);
      formDataToSend.append('reason', formData.reason);
      formDataToSend.append('paymentId', payment._id);
      if (payment.invoiceNumber) {
        formDataToSend.append('invoiceNumber', payment.invoiceNumber);
      }
      formDataToSend.append('receiptFile', formData.receiptFile);
      
      // Send request to backend
      const response = await axiosInstance.post(API_PATHS.REFUND.ADD_REFUND, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Refund request submitted successfully');
      if (onSuccess) onSuccess(response.data.refund);
    } catch (error) {
      console.error('Error submitting refund request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full">
      <div className="flex items-center justify-between mb-4">
        <button 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          onClick={onBack}
        >
          <LuArrowLeft /> Back to Payment Details
        </button>
        <h5 className="text-lg font-medium">Request Refund</h5>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Original Payment Amount
            </label>
            <div className="p-2 bg-gray-50 rounded-md">
              RS. {payment?.amount}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refund Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="refundAmount"
              value={formData.refundAmount}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.refundAmount ? 'border-red-500' : 'border-gray-300'}`}
              min="0"
              max={payment?.amount}
              step="0.01"
            />
            {errors.refundAmount && (
              <p className="text-red-500 text-xs mt-1">{errors.refundAmount}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Refund <span className="text-red-500">*</span>
          </label>
          <select
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select a reason</option>
            <option value="Item not received">Item not received</option>
            <option value="Incorrect charge">Incorrect charge</option>
            <option value="Duplicate payment">Duplicate payment</option>
            <option value="Service not provided">Service not provided</option>
            <option value="Other">Other</option>
          </select>
          {errors.reason && (
            <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Invoice/Receipt <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50">
            <LuUpload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <div className="flex flex-col items-center w-full">
              <div className="flex text-sm text-gray-600 items-center justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="receiptFile"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                </label>
                <span className="mx-2 text-gray-400">|</span>
                <span>or drag and drop</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">PNG, JPG, PDF up to 10MB</div>
              <div className="mt-2 px-3 py-2 bg-white/80 border border-gray-200 rounded text-center text-gray-600 text-sm w-full max-w-md">
                Please upload the <span className="font-medium">invoice or receipt</span> for the item you want to refund.<br />This helps us process your refund request faster.
              </div>
              {formData.receiptFile && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {formData.receiptFile.name}
                </p>
              )}
            </div>
          </div>
          {errors.receiptFile && (
            <p className="text-red-500 text-xs mt-1">{errors.receiptFile}</p>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={onBack}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Refund Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RefundForm; 