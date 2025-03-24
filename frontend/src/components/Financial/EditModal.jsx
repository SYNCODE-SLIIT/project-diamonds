import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const EditModal = ({ item, onClose, activeTab }) => {
  const [formData, setFormData] = useState({ ...item });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const shouldDisplayField = (key, value) => {
    const skipFields = ['__v', '_id', 'createdAt', 'updatedAt'];
    return (
      !skipFields.includes(key) &&
      value !== null &&
      value !== undefined
    );
  };

  const getInputType = (key, value) => {
    if (['status', 'paymentStatus'].includes(key)) {
      return 'select';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (key.toLowerCase().includes('date')) {
      return 'datetime-local';
    }
    return 'text';
  };

  const formatDateForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    const pad = (n) => (n < 10 ? `0${n}` : n);
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper: Get status options based on activeTab
  const getStatusOptions = () => {
    if (activeTab === 'payments') {
      return ['pending', 'approved', 'rejected'];
    } else if (activeTab === 'budgets') {
      return ['pending', 'approved', 'rejected'];
    } else if (activeTab === 'invoices') {
      // Order as Paid, Failed, Pending (as specified)
      return ['paid', 'failed', 'pending'];
    } else if (activeTab === 'refunds') {
      return ['pending', 'approved', 'rejected'];
    } else {
      // Fallback: include all options
      return ['pending', 'approved', 'declined', 'rejected'];
    }
  };

  const getGroupedFields = () => {
    const groups = {
      basic: ['description', 'reason', 'notes', 'details', 'comments'],
      financial: ['amount', 'totalAmount', 'allocatedBudget', 'refundAmount', 'price', 'cost', 'paymentMethod', 'transactionType', 'currency'],
      status: ['status', 'paymentStatus', 'invoiceStatus'],
      user: ['user', 'userId', 'userEmail', 'userName', 'fullName', 'email'],
      dates: ['date', 'createdAt', 'updatedAt', 'dueDate', 'paymentDate'],
      identifiers: ['invoiceNumber', 'transactionId', 'referenceNumber'],
      other: []
    };

    const result = {};
    Object.keys(formData).forEach(key => {
      if (shouldDisplayField(key, formData[key])) {
        let assigned = false;
        for (const [groupName, keywords] of Object.entries(groups)) {
          if (keywords.some(keyword => key.toLowerCase().includes(keyword.toLowerCase()))) {
            if (!result[groupName]) result[groupName] = [];
            result[groupName].push(key);
            assigned = true;
            break;
          }
        }
        if (!assigned) {
          if (!result.other) result.other = [];
          result.other.push(key);
        }
      }
    });

    return result;
  };

  const handleInputChange = (key, newValue) => {
    setFormData(prev => ({ ...prev, [key]: newValue }));
  };

  const handleSave = async () => {
    try {
      let updateUrl = '';
      if (activeTab === 'budgets') {
        updateUrl = `/api/finance/b/${item._id}`;
      } else if (activeTab === 'refunds') {
        updateUrl = `/api/finance/r/${item._id}`;
      } else if (activeTab === 'invoices') {
        updateUrl = `/api/finance/i/${item._id}`;
      } else if (activeTab === 'payments') {
        updateUrl = `/api/finance/p/${item._id}`;
      } else if (activeTab === 'transactions') {
        updateUrl = `/api/finance/t/${item._id}`;
      }
      await axiosInstance.patch(updateUrl, formData);
      setMessage('Record updated successfully');
      setMessageType('success');
    } catch (err) {
      console.error('Error updating record:', err);
      setMessage('Error updating record');
      setMessageType('error');
    }
  };

  const renderFieldGroups = () => {
    const groups = getGroupedFields();
    const groupOrder = ['basic', 'financial', 'status', 'user', 'dates', 'identifiers', 'other'];
    const groupTitles = {
      basic: 'Basic Information',
      financial: 'Financial Details',
      status: 'Status Information',
      user: 'User Information',
      dates: 'Important Dates',
      identifiers: 'Identifiers',
      other: 'Additional Information'
    };

    return (
      <div className="space-y-6">
        {groupOrder.map(groupName => {
          if (!groups[groupName] || groups[groupName].length === 0) return null;

          // For user group, make fields read-only.
          const isDisabled = groupName === 'user';

          return (
            <div key={groupName} className="bg-white bg-opacity-80 rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 bg-opacity-80 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">{groupTitles[groupName]}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {groups[groupName].map(key => {
                  const value = formData[key];
                  const inputType = getInputType(key, value);
                  return (
                    <div key={key} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center">
                      <label className="sm:w-1/3 text-sm font-medium text-gray-500" htmlFor={key}>
                        {formatKey(key)}
                      </label>
                      <div className="sm:w-2/3 mt-1 sm:mt-0">
                        {inputType === 'select' ? (
                          // For status fields, conditionally generate options.
                          (key === 'status' || key === 'paymentStatus') ? (
                            <select
                              id={key}
                              value={value}
                              disabled={isDisabled}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {getStatusOptions().map(opt => (
                                <option key={opt} value={opt}>
                                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            // For other select fields, fallback behavior.
                            <select
                              id={key}
                              value={value}
                              disabled={isDisabled}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                            </select>
                          )
                        ) : (
                          <input
                            id={key}
                            type={inputType}
                            disabled={isDisabled}
                            value={inputType === 'datetime-local' ? formatDateForInput(value) : value}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white bg-opacity-80 w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 bg-opacity-80 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Edit {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Record
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {renderFieldGroups()}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 bg-opacity-80 px-6 py-4 border-t border-gray-200 flex flex-col gap-3">
          <div className="flex flex-wrap justify-end gap-3">
            <button 
              onClick={handleSave} 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center"
            >
              Save Changes
            </button>
            <button 
              onClick={onClose} 
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              Cancel
            </button>
          </div>
          
          {message && (
            <div className={`mt-4 p-3 rounded-md ${messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex items-center">
                {messageType === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <p className="ml-3 text-sm font-medium">{message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditModal;
