import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const BudgetForm = ({ onClose }) => {
  const [allocatedBudget, setAllocatedBudget] = useState('');
  const [remainingBudget, setRemainingBudget] = useState('');
  const [reason, setReason] = useState('');        
  const [infoFile, setInfoFile] = useState(null);     
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateAllocatedBudget = () => {
    const parsedBudget = parseFloat(allocatedBudget);
    return !isNaN(parsedBudget) && parsedBudget > 0 && parsedBudget <= 1000000;
  };

  const validateRemainingBudget = () => {
    const parsedAllocated = parseFloat(allocatedBudget);
    const parsedRemaining = parseFloat(remainingBudget);
    return (
      !isNaN(parsedRemaining) && 
      parsedRemaining >= 0 && 
      parsedRemaining <= parsedAllocated
    );
  };

  const validateReason = () => reason.trim().length >= 10 && reason.trim().length <= 500;

  const validateInfoFile = () => {
    return infoFile && (infoFile.type === 'image/png' || infoFile.type === 'application/pdf');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/png', 'application/pdf'];
      if (validTypes.includes(file.type)) {
        setInfoFile(file);
        setMessage('');
      } else {
        setInfoFile(null);
        setMessage('Invalid file type. Please upload PNG or PDF.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Validation checks
    if (!validateAllocatedBudget()) {
      setMessage('Invalid allocated budget amount');
      setIsSubmitting(false);
      return;
    }

    if (!validateRemainingBudget()) {
      setMessage('Invalid remaining budget amount');
      setIsSubmitting(false);
      return;
    }

    if (!validateReason()) {
      setMessage('Reason must be between 10 and 500 characters');
      setIsSubmitting(false);
      return;
    }

    if (!validateInfoFile()) {
      setMessage('Invalid file. Please upload a PNG or PDF file.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('allocatedBudget', allocatedBudget);
      formData.append('remainingBudget', remainingBudget);
      formData.append('status', status);
      formData.append('reason', reason);
      formData.append('infoFile', infoFile);

      const res = await axiosInstance.post('/api/finance/cb', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message || 'Budget request created successfully');
      setAllocatedBudget('');
      setRemainingBudget('');
      setReason('');
      setInfoFile(null);
    } catch (error) {
      console.error('Error creating budget:', error);
      setMessage('Error creating budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md relative transform transition-all duration-300 hover:scale-105">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
          <h2 className="text-3xl font-bold text-white text-center">Create Budget Request</h2>
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
            <label htmlFor="allocatedBudget" className="block text-sm font-medium text-gray-700 mb-2">
              Allocated Budget
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center justify-between text-black">RS. </span>
              <input
                type="number"
                id="allocatedBudget"
                value={allocatedBudget}
                onChange={(e) => setAllocatedBudget(e.target.value)}
                className="w-full pl-7 pr-3 py-3 border-2 border-gray-300 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                  transition duration-300"
                min="0.01"
                step="0.01"
                required
                placeholder="   Enter allocated budget"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="remainingBudget" className="block text-sm font-medium text-gray-700 mb-2">
              Remaining Budget
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">RS. </span>
              <input
                type="number"
                id="remainingBudget"
                value={remainingBudget}
                onChange={(e) => setRemainingBudget(e.target.value)}
                className="w-full pl-7 pr-3 py-3 border-2 border-gray-300 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                  transition duration-300"
                min="0"
                step="0.01"
                required
                placeholder="   Enter remaining budget"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Budget Request
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                transition duration-300 h-24"
              placeholder="Provide a detailed reason (10-500 characters)"
              required
            />
          </div>
          
          <div>
            <label htmlFor="infoFile" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Supporting Document (PNG or PDF)
            </label>
            <input
              type="file"
              id="infoFile"
              accept="image/png,application/pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl 
                file:mr-4 file:rounded-full file:border-0 file:bg-green-50 
                file:text-green-700 hover:file:bg-green-100 
                focus:outline-none focus:ring-2 focus:ring-green-500 
                transition duration-300"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 
              text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-800 
              transition duration-300 transform hover:scale-105 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Submit Budget Request'}
          </button>
        </form>
        
        {message && (
          <div className="px-6 pb-6">
            <div className={`p-3 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-50 border-l-4 border-red-500 text-red-700' 
                : 'bg-green-50 border-l-4 border-green-500 text-green-700'
            }`}>
              <p>{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetForm;
