import React, { useState } from 'react';
import { LuArrowLeft, LuUpload } from 'react-icons/lu';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';

const RefundForm = ({ payment, onBack, onSuccess }) => {
  console.log("Payment object in RefundForm:", payment);
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
      newErrors.receiptFile = 'Please upload a receipt or documentation';
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
      
      // Debug: log FormData
      console.log("Sending refund request with invoiceNumber:", payment.invoiceNumber);
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }
      
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
            Documentation <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <LuUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
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
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF up to 10MB
              </p>
              {formData.receiptFile && (
                <p className="text-sm text-green-600">
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