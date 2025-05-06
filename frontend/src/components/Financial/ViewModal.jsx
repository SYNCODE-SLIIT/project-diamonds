import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import axiosInstance from '../../utils/axiosInstance';
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlineCalendar, 
  HiOutlineDocumentText, 
  HiOutlineCurrencyDollar, 
  HiOutlineBadgeCheck,
  HiOutlineDownload,
  HiOutlineX,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineEyeOff
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const ViewModal = ({ item, onClose, activeTab }) => {
  const [status, setStatus] = useState(item.status || '');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [activeSection, setActiveSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);

  // Set all sections expanded by default
  useEffect(() => {
    const groups = getGroupedFields();
    const initialExpandedState = {};
    Object.keys(groups).forEach(group => {
      initialExpandedState[group] = true;
    });
    setExpandedSections(initialExpandedState);
    
    // Set the first non-empty section as active
    const firstSection = Object.keys(groups).find(group => 
      groups[group] && groups[group].length > 0
    );
    setActiveSection(firstSection);
  }, [item]);

  // Function to format data keys for display
  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const shouldDisplayField = (key, value) => {
    // Skip internal fields and null/undefined values
    const skipFields = ['__v', '_id', 'createdAt', 'updatedAt'];
    return (
      !skipFields.includes(key) && 
      value !== null && 
      value !== undefined &&
      !(typeof value === 'object' && key === 'user' && item.userEmail)
    );
  };

  // Format value for display
  const formatValue = (key, value) => {
    if (value === null || value === undefined) return "—";
    
    if (
      ['amount', 'totalAmount', 'allocatedBudget', 'refundAmount', 'price', 'cost'].some(k => 
        key.toLowerCase().includes(k.toLowerCase())
      )
    ) {
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
        pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
        approved: 'bg-green-100 text-green-800 border border-green-300',
        rejected: 'bg-red-100 text-red-800 border border-red-300',
        declined: 'bg-red-100 text-red-800 border border-red-300',
        paid: 'bg-green-100 text-green-800 border border-green-300',
        failed: 'bg-red-100 text-red-800 border border-red-300',
      };
      
      return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[value.toLowerCase()] || 'bg-gray-100 text-gray-800 border border-gray-300'}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      );
    }
    
    // If value is an array, show as comma-separated or bulleted list
    if (Array.isArray(value)) {
      return value.length > 0 ? (
        <ul className="list-disc list-inside space-y-1">
          {value.map((v, i) => (
            <li key={i}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</li>
          ))}
        </ul>
      ) : "—";
    }
    
    // If value is a URL, render as a clickable, truncated link
    const isUrl = typeof value === 'string' && value.match(/^https?:\/\//i);
    if (isUrl) {
      const displayUrl = value.length > 40 ? value.slice(0, 32) + '...' + value.slice(-8) : value;
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all max-w-xs inline-block truncate align-middle transition-colors"
          title={value}
        >
          {displayUrl}
        </a>
      );
    }
    
    // If value is an object (not user), show as a vertical list
    if (typeof value === 'object' && value !== null) {
      // Special case for user object
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
      // General object: pretty key-value list
      return (
        <div className="space-y-1">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex gap-1 text-sm">
              <span className="text-gray-500">{formatKey(k)}:</span>
              <span className="text-gray-800">{formatValue(k, v)}</span>
            </div>
          ))}
        </div>
      );
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

  // Accent color and icon mapping for groups
  const groupIcons = {
    basic: <HiOutlineDocumentText className="w-5 h-5" />,
    financial: <HiOutlineCurrencyDollar className="w-5 h-5" />,
    status: <HiOutlineBadgeCheck className="w-5 h-5" />,
    user: <HiOutlineUser className="w-5 h-5" />,
    dates: <HiOutlineCalendar className="w-5 h-5" />,
    identifiers: <HiOutlineDocumentText className="w-5 h-5" />,
    other: <HiOutlineDocumentText className="w-5 h-5" />,
  };

  const groupTitles = {
    basic: 'Basic Information',
    financial: 'Financial Details',
    status: 'Status Information',
    user: 'User Information',
    dates: 'Important Dates',
    identifiers: 'Identifiers',
    other: 'Additional Information'
  };

  const groupColors = {
    basic: 'bg-blue-50 border-blue-200 text-blue-700',
    financial: 'bg-green-50 border-green-200 text-green-700',
    status: 'bg-purple-50 border-purple-200 text-purple-700',
    user: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    dates: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    identifiers: 'bg-pink-50 border-pink-200 text-pink-700',
    other: 'bg-gray-50 border-gray-200 text-gray-700',
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      const title = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)} Details`;
      doc.setFontSize(18);
      doc.text(title, 105, 15, { align: 'center' });
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
      
      // Add content
      doc.setFontSize(12);
      let yPos = 30;
      
      const groups = getGroupedFields();
      const groupOrder = ['basic', 'financial', 'status', 'user', 'dates', 'identifiers', 'other'];
      
      groupOrder.forEach(groupName => {
        if (!groups[groupName] || groups[groupName].length === 0) return;
        
        // Add section title
        doc.setFont(undefined, 'bold');
        doc.text(groupTitles[groupName], 14, yPos);
        yPos += 7;
        
        // Add section content
        doc.setFont(undefined, 'normal');
        groups[groupName].forEach(key => {
          // Skip if we're at the bottom of the page
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          const value = item[key];
          let displayValue = '';
          
          if (value === null || value === undefined) {
            displayValue = "—";
          } else if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              displayValue = value.join(', ');
            } else if (key === 'user' && value.email) {
              displayValue = `${value.fullName || 'User'} (${value.email})`;
            } else {
              displayValue = JSON.stringify(value);
            }
          } else {
            displayValue = String(value);
          }
          
          // Format key
          const formattedKey = formatKey(key);
          
          // Add key-value pair
          doc.text(`${formattedKey}: ${displayValue}`, 14, yPos);
          yPos += 7;
        });
        
        // Add spacing between sections
        yPos += 5;
      });
      
      // Save the PDF
      doc.save(`${activeTab}_${item._id}.pdf`);
      setMessage('PDF downloaded successfully');
      setMessageType('success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setMessage('Error generating PDF');
      setMessageType('error');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderFieldGroups = () => {
    const groups = getGroupedFields();
    const groupOrder = ['basic', 'financial', 'status', 'user', 'dates', 'identifiers', 'other'];
    
    return (
      <div className="space-y-6">
        {groupOrder.map(groupName => {
          if (!groups[groupName] || groups[groupName].length === 0) return null;
          
          const isExpanded = expandedSections[groupName];
          const isActive = activeSection === groupName;
          
          return (
            <motion.div 
              key={groupName} 
              className={`bg-white rounded-lg shadow-md overflow-hidden border ${isActive ? 'ring-2 ring-offset-2 ring-blue-500' : 'border-gray-200'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className={`px-4 py-3 border-b ${groupColors[groupName]} flex justify-between items-center cursor-pointer`}
                onClick={() => {
                  setActiveSection(groupName);
                  if (!isExpanded) {
                    toggleSection(groupName);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <span className="p-1 rounded-full bg-white bg-opacity-50">
                    {groupIcons[groupName]}
                  </span>
                  <h3 className="text-sm font-medium">{groupTitles[groupName]}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection(groupName);
                    }}
                    className="p-1 rounded-full hover:bg-white hover:bg-opacity-30 transition-colors"
                  >
                    {isExpanded ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-gray-100">
                      {groups[groupName].map(key => {
                        const value = item[key];
                        return (
                          <div key={key} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <label className="sm:w-1/3 text-sm font-medium text-gray-500 mb-1 sm:mb-0">
                                {formatKey(key)}
                              </label>
                              <div className="sm:w-2/3 text-sm text-gray-900">
                                {formatValue(key, value)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-blue-600 p-6 rounded-t-2xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <HiOutlineDocumentText className="text-white text-3xl" />
            <h2 className="text-2xl font-bold text-white">
              {activeTab === 'budgets' ? 'Budget Details' :
               activeTab === 'refunds' ? 'Refund Details' :
               activeTab === 'invoices' ? 'Invoice Details' :
               activeTab === 'payments' ? 'Payment Details' : 'Transaction Details'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="text-white bg-blue-700 hover:bg-blue-800 rounded-full w-10 h-10 flex items-center justify-center transition duration-300"
              title="Download PDF"
            >
              <HiOutlineDownload className="text-xl" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white bg-red-500 hover:bg-red-600 rounded-full w-10 h-10 flex items-center justify-center transition duration-300"
                title="Close"
              >
                <HiOutlineX className="text-xl" />
              </button>
            )}
          </div>
        </div>
        
        {/* Status update section */}
        {(activeTab === 'budgets' || activeTab === 'refunds' || activeTab === 'payments') && (
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 sticky top-[88px] z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Update Status:</label>
              <select
                value={status}
                onChange={handleStatusChange}
                className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Message display */}
        {message && (
          <div className={`px-6 py-3 ${messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} sticky top-[136px] z-10`}>
            {message}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {renderFieldGroups()}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-end sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;