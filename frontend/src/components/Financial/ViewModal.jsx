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
  HiOutlineEyeOff,
  HiOutlinePhotograph,
  HiOutlineDocument,
  HiOutlineLocationMarker,
  HiOutlineUserGroup
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const ViewModal = ({ item, onClose, activeTab }) => {
  const [status, setStatus] = useState(item.status || '');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [activeSection, setActiveSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [fileViewer, setFileViewer] = useState({ isOpen: false, url: '', type: '' });
  const [eventInfo, setEventInfo] = useState(null);

  // Check for bank slip or attachment when component mounts
  useEffect(() => {
    // Find bank slip or attachment URL in the item data
    const findAttachment = () => {
      for (const [key, value] of Object.entries(item)) {
        if (
          (key === 'bankSlipUrl' || 
           key === 'fileUrl' || 
           key === 'attachmentUrl' || 
           key === 'infoFile' || // <-- Add this line for budget info file
           key === 'receiptFile' || // <-- Add this line for refund receipt file
           key.toLowerCase().includes('slip') || 
           key.toLowerCase().includes('attachment')) && 
          typeof value === 'string'
        ) {
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(value);
          const isPdf = /\.pdf$/i.test(value);
          
          if (isImage || isPdf) {
            setFileViewer({
              isOpen: true,
              url: value,
              type: isImage ? 'image' : 'pdf'
            });
            return true;
          }
        }
      }
      return false;
    };
    
    findAttachment();
  }, [item]);

  useEffect(() => {
    const fetchEventInfo = async () => {
      if (activeTab === 'budgets' && item.event) {
        try {
          // Try to get event details from the backend (assuming /api/finance/event/:id returns populated event)
          const res = await axiosInstance.get(`/api/finance/event/${item.event}`);
          setEventInfo(res.data.data || res.data);
        } catch (err) {
          setEventInfo(null);
        }
      }
    };
    fetchEventInfo();
  }, [item, activeTab]);

  // Add the missing showFileViewer function
  const showFileViewer = (url, type) => {
    setFileViewer({
      isOpen: true,
      url,
      type
    });
  };

  // Add a function to close the file viewer
  const closeFileViewer = () => {
    setFileViewer({
      isOpen: false,
      url: '',
      type: ''
    });
  };

  // Add the handleViewFile function that was referenced but missing
  const handleViewFile = (url, type) => {
    showFileViewer(url, type);
  };

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
    
    // Handle bank slip or file attachments
    if (key === 'bankSlipUrl' || key === 'fileUrl' || key === 'attachmentUrl' || key.toLowerCase().includes('slip') || key.toLowerCase().includes('attachment')) {
      const isImage = typeof value === 'string' && /\.(jpg|jpeg|png|gif|webp)$/i.test(value);
      const isPdf = typeof value === 'string' && /\.pdf$/i.test(value);
      
      if (isImage || isPdf) {
        return (
          <button
            onClick={() => handleViewFile(value, isImage ? 'image' : 'pdf')}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
          >
            {isImage ? <HiOutlinePhotograph className="w-4 h-4" /> : <HiOutlineDocument className="w-4 h-4" />}
            View {isImage ? 'Image' : 'PDF'}
          </button>
        );
      }
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
      // Header
      doc.setFillColor(31, 41, 55);
      doc.rect(0, 0, doc.internal.pageSize.width, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text(
        `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)} Details`,
        doc.internal.pageSize.width / 2,
        16,
        { align: 'center' }
      );
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        doc.internal.pageSize.width / 2,
        28,
        { align: 'center' }
      );
      let yPos = 38;
      // --- Budget Section ---
      if (activeTab === 'budgets' || item.allocatedBudget !== undefined) {
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.text('Budget Details', 14, yPos); yPos += 7;
        doc.setFontSize(11); doc.setFont(undefined, 'normal');
        if (item.allocatedBudget !== undefined) { doc.text(`Allocated Budget: RS. ${item.allocatedBudget}`, 16, yPos); yPos += 6; }
        if (item.currentSpend !== undefined) { doc.text(`Current Spend: RS. ${item.currentSpend}`, 16, yPos); yPos += 6; }
        if (item.remainingBudget !== undefined) { doc.text(`Remaining Budget: RS. ${item.remainingBudget}`, 16, yPos); yPos += 6; }
        if (item.status) { doc.text(`Status: ${item.status}`, 16, yPos); yPos += 6; }
        if (item.reason) { doc.text(`Reason: ${item.reason}`, 16, yPos); yPos += 6; }
        if (item.infoFile) { doc.text(`Supporting Document: [file available in system]`, 16, yPos); yPos += 6; }
        yPos += 2;
        // Event Info (use eventInfo from state if available)
        const event = eventInfo || item.eventInfo || item.event;
        if (event) {
          doc.setFontSize(12); doc.setFont(undefined, 'bold');
          doc.text('Event Information', 16, yPos); yPos += 6;
          doc.setFontSize(11); doc.setFont(undefined, 'normal');
          if (event.eventName) { doc.text(`Event Name: ${event.eventName}`, 18, yPos); yPos += 6; }
          if (event.eventDate) { doc.text(`Event Date: ${new Date(event.eventDate).toLocaleDateString()}`, 18, yPos); yPos += 6; }
          if (event.eventLocation) { doc.text(`Location: ${event.eventLocation}`, 18, yPos); yPos += 6; }
          if (event.guestCount) { doc.text(`Guest Count: ${event.guestCount}`, 18, yPos); yPos += 6; }
          if (event.packageID && event.packageID.name) { doc.text(`Package: ${event.packageID.name}`, 18, yPos); yPos += 6; }
          if (event.additionalRequests) { doc.text(`Additional Requests: ${event.additionalRequests}`, 18, yPos); yPos += 6; }
          if (event.approvedBy) { doc.text(`Approved By: ${event.approvedBy}`, 18, yPos); yPos += 6; }
          if (event.approvedAt) { doc.text(`Approved At: ${new Date(event.approvedAt).toLocaleString()}`, 18, yPos); yPos += 6; }
          if (event.additionalServices && event.additionalServices.length > 0) {
            doc.text('Additional Services:', 18, yPos); yPos += 5;
            event.additionalServices.forEach((srv, idx) => {
              const name = srv.serviceID?.serviceName || srv.serviceID?.name || srv.serviceID?.description || srv.serviceID?.category || 'Service';
              doc.text(`- ${name}`, 20, yPos); yPos += 5;
            });
          }
          yPos += 2;
        }
      }
      // --- Payment Section ---
      if (activeTab === 'payments' || item.payment) {
        const payment = item.payment || item;
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.text('Payment Details', 14, yPos); yPos += 7;
        doc.setFontSize(11); doc.setFont(undefined, 'normal');
        if (payment.amount) { doc.text(`Amount: RS. ${payment.amount}`, 16, yPos); yPos += 6; }
        if (payment.paymentMethod) { doc.text(`Method: ${payment.paymentMethod}`, 16, yPos); yPos += 6; }
        if (payment.status) { doc.text(`Status: ${payment.status}`, 16, yPos); yPos += 6; }
        if (payment.productName) { doc.text(`Product: ${payment.productName}`, 16, yPos); yPos += 6; }
        if (payment.quantity) { doc.text(`Quantity: ${payment.quantity}`, 16, yPos); yPos += 6; }
        if (payment.orderId) { doc.text(`Order ID: ${payment.orderId}`, 16, yPos); yPos += 6; }
        if (payment.paymentFor) { doc.text(`Payment For: ${payment.paymentFor}`, 16, yPos); yPos += 6; }
        if (payment.bankSlipFile) { doc.text(`Bank Slip: [file available in system]`, 16, yPos); yPos += 6; }
        if (payment.date) { doc.text(`Date: ${new Date(payment.date).toLocaleString()}`, 16, yPos); yPos += 6; }
        if (payment.createdAt) { doc.text(`Created At: ${new Date(payment.createdAt).toLocaleString()}`, 16, yPos); yPos += 6; }
        yPos += 2;
        // User Info
        if (payment.user) {
          doc.setFontSize(12); doc.setFont(undefined, 'bold');
          doc.text('User Information', 16, yPos); yPos += 6;
          doc.setFontSize(11); doc.setFont(undefined, 'normal');
          if (payment.user.fullName) { doc.text(`Name: ${payment.user.fullName}`, 18, yPos); yPos += 6; }
          if (payment.user.email) { doc.text(`Email: ${payment.user.email}`, 18, yPos); yPos += 6; }
          if (payment.user.phone) { doc.text(`Phone: ${payment.user.phone}`, 18, yPos); yPos += 6; }
          if (payment.user.role) { doc.text(`Role: ${payment.user.role}`, 18, yPos); yPos += 6; }
          yPos += 2;
        }
      }
      // --- Refund Section ---
      if (activeTab === 'refunds' || item.refundAmount !== undefined) {
        const refund = item;
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.text('Refund Details', 14, yPos); yPos += 7;
        doc.setFontSize(11); doc.setFont(undefined, 'normal');
        if (refund.refundAmount !== undefined) { doc.text(`Refund Amount: RS. ${refund.refundAmount}`, 16, yPos); yPos += 6; }
        if (refund.reason) { doc.text(`Reason: ${refund.reason}`, 16, yPos); yPos += 6; }
        if (refund.status) { doc.text(`Status: ${refund.status}`, 16, yPos); yPos += 6; }
        if (refund.invoiceNumber) { doc.text(`Invoice #: ${refund.invoiceNumber}`, 16, yPos); yPos += 6; }
        if (refund.receiptFile) { doc.text(`Receipt File: [file available in system]`, 16, yPos); yPos += 6; }
        if (refund.date) { doc.text(`Date: ${new Date(refund.date).toLocaleString()}`, 16, yPos); yPos += 6; }
        if (refund.createdAt) { doc.text(`Created At: ${new Date(refund.createdAt).toLocaleString()}`, 16, yPos); yPos += 6; }
        yPos += 2;
        // User Info
        if (refund.user) {
          doc.setFontSize(12); doc.setFont(undefined, 'bold');
          doc.text('User Information', 16, yPos); yPos += 6;
          doc.setFontSize(11); doc.setFont(undefined, 'normal');
          if (refund.user.fullName) { doc.text(`Name: ${refund.user.fullName}`, 18, yPos); yPos += 6; }
          if (refund.user.email) { doc.text(`Email: ${refund.user.email}`, 18, yPos); yPos += 6; }
          if (refund.user.phone) { doc.text(`Phone: ${refund.user.phone}`, 18, yPos); yPos += 6; }
          if (refund.user.role) { doc.text(`Role: ${refund.user.role}`, 18, yPos); yPos += 6; }
          yPos += 2;
        }
      }
      // --- Transaction Section ---
      if (activeTab === 'transactions' || item.transactionType) {
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.text('Transaction Details', 14, yPos); yPos += 7;
        doc.setFontSize(11); doc.setFont(undefined, 'normal');
        if (item.transactionType) { doc.text(`Type: ${item.transactionType}`, 16, yPos); yPos += 6; }
        if (item.totalAmount !== undefined) { doc.text(`Total Amount: RS. ${item.totalAmount}`, 16, yPos); yPos += 6; }
        if (item.status) { doc.text(`Status: ${item.status}`, 16, yPos); yPos += 6; }
        if (item.date) { doc.text(`Date: ${new Date(item.date).toLocaleString()}`, 16, yPos); yPos += 6; }
        if (item.details && typeof item.details === 'object') {
          Object.entries(item.details).forEach(([k, v]) => {
            doc.text(`${k.charAt(0).toUpperCase() + k.slice(1)}: ${typeof v === 'object' ? JSON.stringify(v) : v}`, 16, yPos); yPos += 6;
          });
        }
        // User Info
        if (item.user) {
          doc.setFontSize(12); doc.setFont(undefined, 'bold');
          doc.text('User Information', 16, yPos); yPos += 6;
          doc.setFontSize(11); doc.setFont(undefined, 'normal');
          if (item.user.fullName) { doc.text(`Name: ${item.user.fullName}`, 18, yPos); yPos += 6; }
          if (item.user.email) { doc.text(`Email: ${item.user.email}`, 18, yPos); yPos += 6; }
          if (item.user.phone) { doc.text(`Phone: ${item.user.phone}`, 18, yPos); yPos += 6; }
          if (item.user.role) { doc.text(`Role: ${item.user.role}`, 18, yPos); yPos += 6; }
          yPos += 2;
        }
        // Invoice Info (if present)
        if (item.invoice) {
          doc.setFontSize(12); doc.setFont(undefined, 'bold');
          doc.text('Invoice Information', 16, yPos); yPos += 6;
          doc.setFontSize(11); doc.setFont(undefined, 'normal');
          if (item.invoice.invoiceNumber) { doc.text(`Invoice #: ${item.invoice.invoiceNumber}`, 18, yPos); yPos += 6; }
          if (item.invoice.amount) { doc.text(`Amount: RS. ${item.invoice.amount}`, 18, yPos); yPos += 6; }
          if (item.invoice.paymentStatus) { doc.text(`Status: ${item.invoice.paymentStatus}`, 18, yPos); yPos += 6; }
          if (item.invoice.category) { doc.text(`Category: ${item.invoice.category}`, 18, yPos); yPos += 6; }
          if (item.invoice.dueDate) { doc.text(`Due Date: ${new Date(item.invoice.dueDate).toLocaleDateString()}`, 18, yPos); yPos += 6; }
          yPos += 2;
        }
        yPos += 2;
      }
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Team Diamond Financial Services', 15, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }
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

  const renderFileViewerButton = (fileUrl, label) => {
    if (!fileUrl) return null;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
    const isPdf = /\.pdf$/i.test(fileUrl);
    if (!isImage && !isPdf) return null;
    return (
      <button
        onClick={() => handleViewFile(fileUrl, isImage ? 'image' : 'pdf')}
        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1 mt-2"
      >
        {isImage ? <HiOutlinePhotograph className="w-4 h-4" /> : <HiOutlineDocument className="w-4 h-4" />}
        View {label}
      </button>
    );
  };
  
  // Inside your JSX where you render fields, add explicit viewers for budget info and refund receipt files:
  {renderFileViewerButton(item.infoFile || item.budgetInfoFile, "Budget Info File")}
  {renderFileViewerButton(item.receiptFile || item.refundReceiptFile, "Refund Receipt File")}

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
        
        {/* Custom Invoice/Transaction Details */}
        {(activeTab === 'invoices' || activeTab === 'transactions') && (
          <div className="mb-6 space-y-6">
            {/* Invoice Image (if available) */}
            {item.invoice && item.invoice.invoiceImage && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlinePhotograph className="text-blue-600 w-5 h-5" />
                  <h3 className="text-lg font-semibold text-gray-800">Invoice Image</h3>
                </div>
                <img src={item.invoice.invoiceImage} alt="Invoice" className="max-h-48 rounded-lg border shadow" />
              </div>
            )}
            
            {/* Payment Details */}
            {item.payment && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineCurrencyDollar className="text-green-600 w-5 h-5" />
                  <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-semibold text-green-700">RS. {item.payment.amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Method</span>
                      <span className="font-medium text-gray-800">{item.payment.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                        item.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.payment.status.charAt(0).toUpperCase() + item.payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {(item.payment.productName || item.payment.quantity) && (
                    <div className="space-y-3">
                      {item.payment.productName && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Product</span>
                          <span className="font-medium text-gray-800">{item.payment.productName}</span>
                        </div>
                      )}
                      {item.payment.quantity && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Quantity</span>
                          <span className="font-medium text-gray-800">{item.payment.quantity}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Merchandise Details */}
            {item.productDetails && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <HiOutlineDocumentText className="text-blue-600 w-5 h-5" />
                  <h3 className="text-lg font-semibold text-gray-800">Merchandise Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium text-gray-800">{item.productDetails.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price</span>
                      <span className="font-semibold text-blue-700">RS. {item.productDetails.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Stock</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.productDetails.stock > 10 ? 'bg-green-100 text-green-800' :
                        item.productDetails.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.productDetails.stock} units
                      </span>
                    </div>
                  </div>
                  {item.productDetails.image && (
                    <div className="flex justify-center items-center">
                      <img 
                        src={item.productDetails.image} 
                        alt="Product" 
                        className="max-h-32 rounded-lg border shadow hover:scale-105 transition-transform duration-300 cursor-pointer" 
                        onClick={() => handleViewFile(item.productDetails.image, 'image')}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {/* Display attachment at the top if available */}
          {fileViewer.url && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">
                {fileViewer.type === 'image' ? 'Bank Slip Image' : 'Bank Slip PDF'}
              </h3>
              <div className="flex justify-center bg-white p-2 rounded border border-gray-300">
                {fileViewer.type === 'image' ? (
                  <img 
                    src={fileViewer.url} 
                    alt="Bank Slip" 
                    className="max-w-full max-h-[300px] object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                ) : (
                  <iframe
                    src={fileViewer.url}
                    title="PDF Viewer"
                    className="w-full h-[300px] border-0"
                    onError={(e) => {
                      e.target.parentNode.innerHTML = '<div class="flex flex-col items-center justify-center h-full"><p class="text-red-500 mb-2">Unable to display PDF</p><a href="' + fileViewer.url + '" target="_blank" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Open PDF in New Tab</a></div>';
                    }}
                  />
                )}
              </div>
              <div className="mt-2 flex justify-end">
                <a
                  href={fileViewer.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1 text-sm"
                >
                  <HiOutlineDownload className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          )}
          
          {/* Render event info for budget requests */}
          {activeTab === 'budgets' && eventInfo && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl flex flex-col items-center">
              <img
                src={eventInfo.packageID?.image || 'https://via.placeholder.com/150'}
                alt={eventInfo.eventName}
                className="w-24 h-24 object-cover rounded-lg mb-2"
              />
              <h3 className="text-xl font-bold text-blue-900">{eventInfo.eventName}</h3>
              <div className="text-blue-800">
                <div><HiOutlineCalendar className="inline mr-1" /> {new Date(eventInfo.eventDate).toLocaleDateString()}</div>
                <div><HiOutlineLocationMarker className="inline mr-1" /> {eventInfo.eventLocation}</div>
                <div><HiOutlineUserGroup className="inline mr-1" /> {eventInfo.guestCount} Guests</div>
                {eventInfo.packageID && (
                  <div className="text-xs text-blue-700">Package: {eventInfo.packageID.name}</div>
                )}
                {eventInfo.additionalRequests && eventInfo.additionalRequests.trim() && (
                  <div className="mt-2 text-xs text-blue-900 bg-blue-100 rounded p-2">Additional Requests: <span className="text-blue-800">{eventInfo.additionalRequests}</span></div>
                )}
                {eventInfo.approvedBy && (
                  <div className="mt-2 text-xs text-blue-700">Approved By: <span className="text-blue-800">{eventInfo.approvedBy}</span></div>
                )}
                {eventInfo.approvedAt && (
                  <div className="text-xs text-blue-700">Approved At: <span className="text-blue-800">{new Date(eventInfo.approvedAt).toLocaleString()}</span></div>
                )}
                {eventInfo.additionalServices && eventInfo.additionalServices.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-blue-700 mb-1">Additional Services:</div>
                    <ul className="list-disc list-inside text-blue-800">
                      {eventInfo.additionalServices.map((srv, idx) => (
                        <li key={idx}>
                          {srv.serviceID?.serviceName || srv.serviceID?.name || srv.serviceID?.description || srv.serviceID?.category || 'Service'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
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

      {/* Remove the separate File Viewer Modal since we're showing it inline */}
    </div>
  );
};

export default ViewModal;
