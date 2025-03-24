import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import axiosInstance from '../../utils/axiosInstance';

const ViewModal = ({ item, onClose, activeTab }) => {
  // For non-transaction records, allow status updates
  const [status, setStatus] = useState(item.status || '');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'

  // Function to format data keys for display
  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Determine if a field should be displayed
  const shouldDisplayField = (key, value) => {
    // Skip internal fields and null/undefined values
    const skipFields = ['__v', '_id', 'createdAt', 'updatedAt'];
    return (
      !skipFields.includes(key) && 
      value !== null && 
      value !== undefined &&
      // Don't show nested objects with user info twice
      !(typeof value === 'object' && key === 'user' && item.userEmail)
    );
  };

  // Format value for display
  const formatValue = (key, value) => {
    if (value === null || value === undefined) return "—";
    
    // Format currency
    if (
      ['amount', 'totalAmount', 'allocatedBudget', 'refundAmount', 'price', 'cost'].some(k => 
        key.toLowerCase().includes(k.toLowerCase())
      )
    ) {
      // For numeric values that represent currency
      return typeof value === 'number' ? `RS. ${value.toLocaleString()}` : value;
    }
    
    // Format dates
    if (key.toLowerCase().includes('date') && value) {
      try {
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return value;
      }
    }
    
    // Format status with color-coded badge
    if (key === 'status' || key === 'paymentStatus') {
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        declined: 'bg-red-100 text-red-800',
        paid: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
      };
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
          {value}
        </span>
      );
    }
    
    // Format objects
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.length > 0 ? JSON.stringify(value) : "—";
      } else {
        // Special handling for user object
        if (key === 'user' && value.email) {
          return (
            <div className="flex flex-col space-y-1">
              <div className="flex items-center">
                <span className="font-medium">{value.fullName || 'User'}</span>
              </div>
              <div className="text-xs text-gray-500">{value.email}</div>
            </div>
          );
        }
        return Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : "—";
      }
    }
    
    return String(value);
  };

  // Group fields by category for better organization
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
    const processedKeys = new Set();
    
    // Assign keys to appropriate groups
    Object.keys(item).forEach(key => {
      if (shouldDisplayField(key, item[key])) {
        let assigned = false;
        
        // Check if key belongs to any predefined group
        for (const [groupName, keywords] of Object.entries(groups)) {
          if (keywords.some(keyword => key.toLowerCase().includes(keyword.toLowerCase()))) {
            if (!result[groupName]) result[groupName] = [];
            result[groupName].push(key);
            processedKeys.add(key);
            assigned = true;
            break;
          }
        }
        
        // If not assigned to any group, put in "other"
        if (!assigned) {
          if (!result.other) result.other = [];
          result.other.push(key);
          processedKeys.add(key);
        }
      }
    });
    
    return result;
  };

  // Render field groups
  const renderFieldGroups = () => {
    const groups = getGroupedFields();
    
    // Define group titles and order
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
          
          return (
            <div key={groupName} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">{groupTitles[groupName]}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {groups[groupName].map(key => (
                  <div key={key} className="px-4 py-3 flex flex-col sm:flex-row sm:items-start">
                    <div className="sm:w-1/3 text-sm font-medium text-gray-500">
                      {formatKey(key)}
                    </div>
                    <div className="sm:w-2/3 text-sm text-gray-800 mt-1 sm:mt-0 break-words">
                      {formatValue(key, item[key])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
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
      await axiosInstance.patch(updateUrl, { status: newStatus });
      setMessage('Status updated successfully');
      setMessageType('success');
    } catch (err) {
      console.error('Error updating status:', err);
      setMessage('Error updating status');
      setMessageType('error');
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
  
    // --- Header Section ---
    // Draw a colored background for the title
    doc.setFillColor(0, 102, 204); // blue background
    doc.rect(10, 10, 190, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Record Details", 105, 23, { align: "center" });
  
    // Reset text color for subtitle and details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Record Type: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`, 105, 37, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 44, { align: "center" });
  
    // Draw a horizontal line to separate header from content
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45);
  
    // Increase the starting y position to add more margin below the header
    let y = 60;
  
    // --- Content Section ---
    // Group details using the same grouping method as your modal
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
  
    // Loop through each group and add its header and content
    groupOrder.forEach(groupName => {
      if (!groups[groupName] || groups[groupName].length === 0) return;
  
      // Check if new page is needed
      if (y + 20 > 280) {
        doc.addPage();
        y = 20;
      }
  
      // Draw group header with a light gray background
      doc.setFillColor(230, 230, 230);
      doc.rect(10, y, 190, 10, 'F');
      doc.setFontSize(14);
      doc.text(groupTitles[groupName], 12, y + 7);
      y += 15; // increased spacing after group header
  
      doc.setFontSize(12);
      groups[groupName].forEach(key => {
        let value = item[key];
  
        // Format value similar to the modal
        if (value === null || value === undefined) {
          value = "—";
        } else if (typeof value === 'object') {
          if (key === 'user' && value.email) {
            value = `${value.fullName || 'User'} (${value.email})`;
          } else {
            value = JSON.stringify(value, null, 2);
          }
        }
  
        const text = `${formatKey(key)}: ${value}`;
        // Wrap text if too long
        const textLines = doc.splitTextToSize(text, 190);
        
        // Check for page overflow and add a new page if needed
        if (y + textLines.length * 7 > 280) {
          doc.addPage();
          y = 20;
        }
  
        doc.text(textLines, 12, y);
        y += textLines.length * 7 + 5; // increased spacing after each field
      });
  
      y += 5; // extra spacing between groups
    });
  
    return doc;
  };
  
  
  

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save(`${activeTab}-record-${item._id}.pdf`);
  };

  const handleSendEmail = async () => {
    try {
      const doc = generatePDF();
      const pdfData = doc.output('datauristring');
      await axiosInstance.post('/api/finance/send-email', { 
        recordId: item._id,
        pdfData,
        email: item.user && item.user.email,
      });
      setMessage('Email sent successfully');
      setMessageType('success');
    } catch (err) {
      console.error('Error sending email:', err);
      setMessage('Error sending email');
      setMessageType('error');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Record Details
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
          {/* Bank Slip (if available) */}
          {activeTab === 'payments' && item.bankSlipFile && (
            <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Deposit Slip</h3>
              </div>
              <div className="p-4">
                {item.bankSlipFile.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={`http://localhost:4000/uploads/${item.bankSlipFile}`}
                    width="100%"
                    height="400"
                    title="Deposit Slip PDF"
                    className="rounded border border-gray-200"
                  />
                ) : (
                  <img
                    src={`http://localhost:4000/uploads/${item.bankSlipFile}`}
                    alt="Deposit Slip"
                    className="max-w-full h-auto rounded"
                  />
                )}
              </div>
            </div>
          )}
          
          {/* Record Details */}
          {renderFieldGroups()}
          
          {/* Status Change Form */}
          {activeTab !== 'transactions' && (
            <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Update Status</h3>
              </div>
              <div className="p-4">
                <select 
                  value={status} 
                  onChange={handleStatusChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                  <option value="rejected">Rejected</option>
                  {activeTab === 'invoices' && <option value="paid">Paid</option>}
                  {activeTab === 'invoices' && <option value="failed">Failed</option>}
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-wrap justify-end gap-3">
            <button 
              onClick={handleDownload} 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
            <button 
              onClick={handleSendEmail} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send via Email
            </button>
            <button 
              onClick={onClose} 
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              Close
            </button>
          </div>
          
          {/* Status message */}
          {message && (
            <div className={`mt-4 p-3 rounded-md ${
              messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {messageType === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewModal;