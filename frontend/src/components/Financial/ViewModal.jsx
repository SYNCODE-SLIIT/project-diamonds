import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import axiosInstance from '../../utils/axiosInstance';
import { HiOutlineUser, HiOutlineMail, HiOutlineCalendar, HiOutlineDocumentText, HiOutlineCurrencyDollar, HiOutlineBadgeCheck } from 'react-icons/hi';

const ViewModal = ({ item, onClose, activeTab }) => {
  const [status, setStatus] = useState(item.status || '');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); 

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
          className="text-blue-600 underline break-all max-w-xs inline-block truncate align-middle"
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
    basic: <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4dd.png" alt="Document" className="w-5 h-5 mr-1" />,
    financial: <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4b0.png" alt="Money" className="w-5 h-5 mr-1" />,
    status: <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/2705.png" alt="Check" className="w-5 h-5 mr-1" />,
    user: <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f9d1.png" alt="User" className="w-5 h-5 mr-1" />,
    dates: <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4c5.png" alt="Calendar" className="w-5 h-5 mr-1" />,
    identifiers: <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4dc.png" alt="Document" className="w-5 h-5 mr-1" />,
    other: <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4dd.png" alt="Document" className="w-5 h-5 mr-1" />,
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

  // Helper to pretty-print nested objects in the PDF (never as JSON string)
  const prettyPrintObject = (doc, obj, x, y, indent = 0, maxWidth = 150) => {
    const skipFields = ['__v'];
    let startY = y;
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => {
        doc.setFont(undefined, 'bold');
        doc.text(' '.repeat(indent * 2) + `Item ${idx + 1}:`, x, startY);
        doc.setFont(undefined, 'normal');
        startY += 6;
        startY = prettyPrintObject(doc, item, x + 8, startY, indent + 1, maxWidth - 8);
      });
      return startY;
    }
    Object.entries(obj).forEach(([k, v]) => {
      if (skipFields.includes(k)) return;
      let label = formatKey(k) + ':';
      let value = v;
      if (typeof value === 'object' && value !== null) {
        if (k === 'user' && value.email) {
          // Special handling for user
          value = `${value.fullName || 'User'} (${value.email})`;
          doc.setFont(undefined, 'bold');
          doc.text(' '.repeat(indent * 2) + label, x, startY);
          doc.setFont(undefined, 'normal');
          doc.text(String(value), x + 40, startY);
          startY += 6;
        } else {
          doc.setFont(undefined, 'bold');
          doc.text(' '.repeat(indent * 2) + label, x, startY);
          doc.setFont(undefined, 'normal');
          startY += 6;
          startY = prettyPrintObject(doc, value, x + 8, startY, indent + 1, maxWidth - 8);
        }
      } else {
        // Format value for display
        if (value === null || value === undefined) value = '—';
        if (k.toLowerCase().includes('date') && value) {
          try {
            value = new Date(value).toLocaleString();
          } catch {}
        }
        const textLines = doc.splitTextToSize(String(value), maxWidth - 40);
        doc.setFont(undefined, 'bold');
        doc.text(' '.repeat(indent * 2) + label, x, startY);
        doc.setFont(undefined, 'normal');
        doc.text(textLines, x + 40, startY);
        startY += Math.max(6, textLines.length * 6);
      }
    });
    return startY;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    // Add logo at the top (PNG, 30x30 at 15, 8)
    try {
      doc.addImage('/logo192.png', 'PNG', 15, 8, 30, 30);
    } catch (e) {
      // If logo fails, continue without breaking
    }
    // Set document properties
    doc.setProperties({
      title: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Record - ${item._id}`,
      subject: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Details`,
      author: "Project Diamonds",
      keywords: `${activeTab}, record, details`,
      creator: "Project Diamonds Financial System"
    });
    // Add header with gradient background
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, 210, 30, 'F');
    // Add title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Record`, 105, 20, { align: "center" });
    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    // Add record ID and date
    doc.setFontSize(10);
    doc.text(`Record ID: ${item._id}`, 15, 40);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 150, 40, { align: "right" });
    // Add a horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);
    // Add record type icon
    let iconText = "";
    switch(activeTab) {
      case 'payments': iconText = "💰"; break;
      case 'budgets': iconText = "📊"; break;
      case 'invoices': iconText = "📄"; break;
      case 'refunds': iconText = "↩️"; break;
      case 'transactions': iconText = "💸"; break;
      case 'salary': iconText = "💵"; break;
      default: iconText = "📝";
    }
    doc.setFontSize(16);
    doc.text(iconText, 15, 60);
    // Add record type title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Details`, 30, 60);
    doc.setFont(undefined, 'normal');
    // Add a light background for the main content area
    doc.setFillColor(245, 245, 245);
    doc.rect(15, 65, 180, 200, 'F');
    // Start content at y=75
    let y = 75;
    // Group fields by category for better organization
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
    groupOrder.forEach(groupName => {
      if (!groups[groupName] || groups[groupName].length === 0) return;
      if (y + 20 > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(230, 230, 230);
      doc.rect(15, y, 180, 8, 'F');
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(groupTitles[groupName], 20, y + 5);
      y += 15;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      groups[groupName].forEach(key => {
        let value = item[key];
        if (typeof value === 'object' && value !== null) {
          if (key === 'user' && value.email) {
            value = `${value.fullName || 'User'} (${value.email})`;
            doc.setFont(undefined, 'bold');
            doc.text(`${formatKey(key)}:`, 20, y);
            doc.setFont(undefined, 'normal');
            doc.text(String(value), 70, y);
            y += 7;
          } else {
            doc.setFont(undefined, 'bold');
            doc.text(`${formatKey(key)}:`, 20, y);
            doc.setFont(undefined, 'normal');
            y = prettyPrintObject(doc, value, 30, y, 1);
          }
        } else {
          doc.setFont(undefined, 'bold');
          doc.text(`${formatKey(key)}:`, 20, y);
          doc.setFont(undefined, 'normal');
          const textLines = doc.splitTextToSize(String(value), 150);
          doc.text(textLines, 70, y);
          y += Math.max(7, textLines.length * 7);
        }
      });
      y += 5;
    });
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
      doc.text("Project Diamonds Financial System", 105, 295, { align: "center" });
    }
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
      
      // Make a POST request to your API to send the email.
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
    <div className="fixed inset-0 z-50 flex items-center justify-self-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
        {/* Accent Bar & Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 w-full" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white bg-opacity-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {groupIcons[activeTab] || <HiOutlineDocumentText className="text-blue-500 w-5 h-5 mr-1" />} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Record Details
            </h2>
            <p className="text-sm text-gray-500">ID: {item._id}</p>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-white bg-opacity-30">
          {/* File Previews (Deposit Slip, Receipt, Info File) */}
          {activeTab === 'payments' && item.bankSlipFile && (
            <div className="mb-6 bg-gray-50 bg-opacity-50 rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><HiOutlineDocumentText className="mr-1" /> Deposit Slip</h3>
              {item.bankSlipFile.toLowerCase().endsWith('.pdf') ? (
                <iframe src={item.bankSlipFile} width="100%" height="300" title="Deposit Slip PDF" className="rounded border border-gray-200" />
              ) : (
                <img src={item.bankSlipFile} alt="Deposit Slip" className="max-w-full h-auto rounded" />
              )}
            </div>
          )}
          {activeTab === 'refunds' && item.receiptFile && (
            <div className="mb-6 bg-gray-50 bg-opacity-50 rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><HiOutlineDocumentText className="mr-1" /> Receipt File</h3>
              {item.receiptFile.toLowerCase().endsWith('.pdf') ? (
                <iframe src={item.receiptFile} width="100%" height="300" title="Receipt PDF" className="rounded border border-gray-200" />
              ) : (
                <img src={item.receiptFile} alt="Receipt" className="max-w-full h-auto rounded" />
              )}
            </div>
          )}
          {activeTab === 'budgets' && item.infoFile && (
            <div className="mb-6 bg-gray-50 bg-opacity-50 rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><HiOutlineDocumentText className="mr-1" /> Information File</h3>
              {item.infoFile.toLowerCase().endsWith('.pdf') ? (
                <iframe src={item.infoFile} width="100%" height="300" title="Info PDF" className="rounded border border-gray-200" />
              ) : (
                <img src={item.infoFile} alt="Info File" className="max-w-full h-auto rounded" />
              )}
            </div>
          )}
          {/* Grouped Fields as Cards */}
          {(() => {
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
                {groupOrder.map(groupName => (
                  groups[groupName] && groups[groupName].length > 0 ? (
                    <section key={groupName} className="bg-gray-50 bg-opacity-50 rounded-lg shadow p-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">{groupIcons[groupName]} {groupTitles[groupName]}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        {groups[groupName].map(key => (
                          <div key={key} className="flex items-center gap-2 py-1">
                            <span className="text-gray-500 font-medium">{formatKey(key)}:</span>
                            <span className="font-semibold text-gray-900">{formatValue(key, item[key])}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null
                ))}
              </div>
            );
          })()}
          {/* Status Update Dropdown */}
          {activeTab !== 'transactions' && (
            <div className="mt-4 bg-white bg-opacity-50 rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><HiOutlineBadgeCheck className="mr-1" /> Update Status</h3>
              <select 
                value={status} 
                onChange={handleStatusChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white bg-opacity-70"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="rejected">Rejected</option>
                {activeTab === 'invoices' && <option value="paid">Paid</option>}
                {activeTab === 'invoices' && <option value="failed">Failed</option>}
              </select>
            </div>
          )}
        </div>
        {/* Action Bar */}
        <div className="flex flex-wrap justify-end gap-3 px-6 py-4 border-t bg-gray-50 bg-opacity-50">
          <button 
            onClick={handleDownload} 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center"
            title="Download as PDF"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <button 
            onClick={onClose} 
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
            title="Close"
          >
            Close
          </button>
        </div>
        {/* Feedback Message */}
        {message && (
          <div className={`mx-6 mb-6 mt-2 p-3 rounded-md ${
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
  );
};

export default ViewModal;