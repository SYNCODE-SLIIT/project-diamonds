import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { HiOutlineDocumentText, HiOutlineX, HiOutlineUpload, HiOutlineCurrencyDollar, HiOutlineAnnotation } from 'react-icons/hi';

const BudgetForm = ({ onClose }) => {
  const [allocatedBudget, setAllocatedBudget] = useState('');
  const [remainingBudget, setRemainingBudget] = useState('');
  const [reason, setReason] = useState('');
  const [infoFile, setInfoFile] = useState(null);
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

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
        if (file.type === 'application/pdf') {
          setFilePreview('pdf');
        } else {
          setFilePreview(URL.createObjectURL(file));
        }
      } else {
        setInfoFile(null);
        setFilePreview(null);
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
      setFilePreview(null);
    } catch (error) {
      console.error('Error creating budget:', error);
      setMessage('Error creating budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-lg relative animate-fadein">
        <div className="flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-700 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <HiOutlineDocumentText className="text-white text-3xl" />
            <h2 className="text-2xl font-bold text-white">Budget Request</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition duration-300"
              title="Close"
            >
              <HiOutlineX className="text-xl" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-7">
          <div>
            <label htmlFor="allocatedBudget" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <HiOutlineCurrencyDollar className="text-green-600" /> Allocated Budget
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-black">RS.</span>
              <input
                type="number"
                id="allocatedBudget"
                value={allocatedBudget}
                onChange={(e) => setAllocatedBudget(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-300 text-lg"
                min="0.01"
                step="0.01"
                required
                placeholder="Enter allocated budget"
              />
            </div>
          </div>

          <div>
            <label htmlFor="remainingBudget" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <HiOutlineCurrencyDollar className="text-green-600" /> Remaining Budget
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">RS.</span>
              <input
                type="number"
                id="remainingBudget"
                value={remainingBudget}
                onChange={(e) => setRemainingBudget(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-300 text-lg"
                min="0"
                step="0.01"
                required
                placeholder="Enter remaining budget"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <HiOutlineAnnotation className="text-green-600" /> Reason for Budget Request
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-300 text-base h-24"
              placeholder="Provide a detailed reason (10-500 characters)"
              required
            />
          </div>

          <div>
            <label htmlFor="infoFile" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <HiOutlineUpload className="text-green-600" /> Upload Supporting Document (PNG or PDF)
            </label>
            <input
              type="file"
              id="infoFile"
              accept="image/png,application/pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
              required
            />
            {filePreview && (
              <div className="mt-3">
                {filePreview === 'pdf' ? (
                  <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <HiOutlineDocumentText className="text-2xl text-green-600" />
                    <span>PDF selected: {infoFile?.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <img src={filePreview} alt="Preview" className="h-16 w-16 object-contain rounded shadow" />
                    <span>{infoFile?.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-800 transition duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold shadow"
          >
            {isSubmitting ? 'Processing...' : 'Submit Budget Request'}
          </button>
        </form>

        {message && (
          <div className="px-8 pb-8">
            <div className={`p-3 rounded-lg mt-2 ${
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
