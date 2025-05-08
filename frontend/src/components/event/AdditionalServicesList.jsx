import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdditionalServiceForm from './AdditionalServiceForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, X, Plus, Filter, ChevronDown, Search, RefreshCw, CreditCard, Edit3, Trash2, DollarSign, Tag, User, Briefcase, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdditionalServicesList = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Filter, sort, and search states
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateCreated');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // PDF and CSV generation states
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingCSV, setGeneratingCSV] = useState(false);
  const [selectedServices, setSelectedServices] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [error, setError] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirmService, setDeleteConfirmService] = useState(null);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/services');
      setServices(res.data);
      setFilteredServices(res.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching additional services', error);
      setError('Failed to load services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);
  
  // Apply filters, sorting, and search whenever dependencies change
  useEffect(() => {
    let result = [...services];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(service => service.category === categoryFilter);
    }
    
    // Apply availability filter
    if (availabilityFilter !== 'all') {
      result = result.filter(service => service.status === availabilityFilter);
    }
    
    // Apply search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(service => 
        service.serviceName.toLowerCase().includes(query) || 
        service.description.toLowerCase().includes(query) ||
        service.serviceID.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.createdBy.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'dateCreated') {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.serviceName.localeCompare(b.serviceName)
          : b.serviceName.localeCompare(a.serviceName);
      }
      return 0;
    });
    
    setFilteredServices(result);
  }, [services, categoryFilter, availabilityFilter, searchQuery, sortBy, sortOrder]);

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleFormSubmit = (serviceData) => {
    if (editingService) {
      axios
        .put(`/api/services/${editingService._id}`, serviceData)
        .then(() => {
          setShowForm(false);
          setEditingService(null);
          fetchServices();
        })
        .catch((error) => console.error('Error updating service', error));
    } else {
      axios
        .post('/api/services', serviceData)
        .then(() => {
          setShowForm(false);
          fetchServices();
        })
        .catch((error) => console.error('Error creating service', error));
    }
  };

  const handleDelete = (serviceId) => {
    axios
      .delete(`/api/services/${serviceId}`)
      .then(() => {
        fetchServices();
      })
      .catch((error) => console.error('Error deleting service', error));
  };
  
  // Handle filter and sort changes
  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };
  
  const handleAvailabilityFilterChange = (e) => {
    setAvailabilityFilter(e.target.value);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleBackToList = () => {
    setShowForm(false);
    setEditingService(null);
  };

  // Open report modal
  const handleOpenReportModal = () => {
    // Initialize selected services with the filtered services
    const initialSelection = {};
    filteredServices.forEach(service => {
      initialSelection[service._id] = true; // Select all by default
    });
    setSelectedServices(initialSelection);
    setShowReportModal(true);
  };
  
  // Toggle service selection for report
  const toggleServiceSelection = (id) => {
    setSelectedServices(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Select/deselect all services
  const toggleSelectAll = (select) => {
    const newSelection = {};
    filteredServices.forEach(service => {
      newSelection[service._id] = select;
    });
    setSelectedServices(newSelection);
  };
  
  // Generate report with selected services
  const generateSelectedReport = () => {
    // Get only selected services
    const servicesToInclude = filteredServices.filter(service => selectedServices[service._id]);
    
    if (servicesToInclude.length === 0) {
      setError('Please select at least one service for the report');
      return;
    }
    
    // Close modal and generate PDF with selected services
    setShowReportModal(false);
    generatePDF(servicesToInclude);
  };

  // Generate PDF report
  const generatePDF = async (servicesToInclude = null) => {
    try {
      setGeneratingPDF(true);
      
      // Use either the provided services or all filtered services
      const servicesForReport = servicesToInclude || filteredServices;
      
      // Create new PDF document
      const doc = new jsPDF('portrait');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Helper function for setting fill and text colors safely
      const setSafeColor = (method, r, g, b) => {
        try {
          if (method === 'fill') {
            doc.setFillColor(r, g, b);
          } else if (method === 'text') {
            doc.setTextColor(r, g, b);
          } else if (method === 'draw') {
            doc.setDrawColor(r, g, b);
          }
        } catch (e) {
          console.warn('Color error:', e);
          // Use fallback colors if there's an error
          if (method === 'fill') {
            doc.setFillColor(200, 200, 200); // gray
          } else if (method === 'text') {
            doc.setTextColor(0, 0, 0); // black
          } else if (method === 'draw') {
            doc.setDrawColor(0, 0, 0); // black
          }
        }
      };
      
      // Add cover page
      // Title
      setSafeColor('fill', 0, 112, 201); // Blue header for Services (different from packages)
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setFont('helvetica', 'bold');
      setSafeColor('text', 255, 255, 255);
      doc.setFontSize(24);
      doc.text('ADDITIONAL SERVICES REPORT', pageWidth / 2, 25, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(16);
      setSafeColor('text', 50, 50, 50);
      doc.text('DETAILED REPORT', pageWidth / 2, 50, { align: 'center' });
      
      // Current date
      const date = new Date();
      doc.setFontSize(12);
      setSafeColor('text', 100, 100, 100);
      doc.text(`Generated on: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`, pageWidth / 2, 60, { align: 'center' });
      
      // Logo placeholder
      setSafeColor('draw', 200, 200, 200);
      setSafeColor('fill', 245, 245, 245);
      doc.roundedRect(pageWidth / 2 - 30, 70, 60, 60, 3, 3, 'FD');
      doc.setFontSize(10);
      setSafeColor('text', 150, 150, 150);
      doc.text('PROJECT DIAMONDS', pageWidth / 2, 110, { align: 'center' });
      
      // Filter info box
      setSafeColor('draw', 0, 112, 201);
      setSafeColor('fill', 240, 249, 255); // Light blue background
      doc.roundedRect(20, 140, pageWidth - 40, 50, 3, 3, 'FD');
      
      doc.setFontSize(12);
      setSafeColor('text', 0, 112, 201);
      doc.text('FILTER CRITERIA', pageWidth / 2, 155, { align: 'center' });
      
      doc.setFontSize(10);
      setSafeColor('text', 80, 80, 80);
      
      const filterTexts = [
        `Category: ${categoryFilter === 'all' ? 'All Categories' : categoryFilter}`,
        `Availability: ${availabilityFilter === 'all' ? 'All' : availabilityFilter}`,
        `Sort by: ${sortBy === 'dateCreated' ? 'Date Created' : sortBy === 'price' ? 'Price' : 'Name'} (${sortOrder === 'desc' ? 'Descending' : 'Ascending'})`,
        searchQuery ? `Search Query: "${searchQuery}"` : 'No search query applied'
      ];
      
      filterTexts.forEach((text, index) => {
        doc.text(text, pageWidth / 2, 165 + (index * 8), { align: 'center' });
      });
      
      // Services count
      setSafeColor('fill', 240, 240, 240);
      doc.roundedRect(pageWidth / 2 - 40, 200, 80, 20, 3, 3, 'F');
      doc.setFontSize(12);
      setSafeColor('text', 50, 50, 50);
      doc.text(`Total Services: ${servicesForReport.length}`, pageWidth / 2, 212, { align: 'center' });
      
      // Footer
      setSafeColor('draw', 0, 112, 201);
      doc.line(20, 240, pageWidth - 20, 240);
      doc.setFontSize(10);
      setSafeColor('text', 100, 100, 100);
      doc.text('Project Diamonds - Additional Services', pageWidth / 2, 250, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Page 1', pageWidth - 20, 270, { align: 'right' });
      
      // Add table of contents as page 2
      doc.addPage();
      
      // Header for table of contents
      setSafeColor('fill', 0, 112, 201);
      doc.rect(0, 0, pageWidth, 20, 'F');
      setSafeColor('text', 255, 255, 255);
      doc.setFontSize(14);
      doc.text('TABLE OF CONTENTS', pageWidth / 2, 14, { align: 'center' });
      
      // Table of contents content
      setSafeColor('text', 50, 50, 50);
      doc.setFontSize(12);
      doc.text('1. Summary of Services', 20, 40);
      doc.text('2. Service Details', 20, 50);
      
      // Page numbers
      setSafeColor('text', 100, 100, 100);
      doc.setFontSize(10);
      doc.text('Page 3', 180, 40);
      doc.text('Page 4-' + (4 + servicesForReport.length - 1), 180, 50);
      
      // Add summary table as page 3
      doc.addPage();
      
      // Header for summary table
      setSafeColor('fill', 0, 112, 201);
      doc.rect(0, 0, pageWidth, 20, 'F');
      setSafeColor('text', 255, 255, 255);
      doc.setFontSize(14);
      doc.text('1. SUMMARY OF SERVICES', pageWidth / 2, 14, { align: 'center' });
      
      // Define table columns
      const tableColumn = [
        'ID', 
        'Service Name', 
        'Category', 
        'Status', 
        'Price (Rs.)'
      ];
      
      // Define table rows
      const tableRows = servicesForReport.map(service => [
        service.serviceID,
        service.serviceName,
        service.category,
        service.status ? service.status.charAt(0).toUpperCase() + service.status.slice(1) : 'N/A',
        service.price ? Number(service.price).toLocaleString() : 'N/A'
      ]);
      
      // Generate summary table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { 
          fillColor: [0, 112, 201],
          textColor: [255, 255, 255], 
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 30 }
      });
      
      // Detailed service info (1 service per page)
      servicesForReport.forEach((service, index) => {
        doc.addPage();
        
        // Service details header
        setSafeColor('fill', 0, 112, 201);
        doc.rect(0, 0, pageWidth, 20, 'F');
        setSafeColor('text', 255, 255, 255);
        doc.setFontSize(14);
        doc.text(`2.${index + 1} SERVICE DETAILS`, pageWidth / 2, 14, { align: 'center' });
        
        // Service name and ID
        setSafeColor('fill', 240, 240, 240);
        doc.rect(0, 20, pageWidth, 16, 'F');
        setSafeColor('text', 50, 50, 50);
        doc.setFontSize(12);
        doc.text(`${service.serviceName} (ID: ${service.serviceID})`, 20, 30);
        
        // Status
        doc.setFontSize(10);
        if (service.status.toLowerCase() === 'available') {
          setSafeColor('text', 34, 197, 94); // Green for available
        } else {
          setSafeColor('text', 234, 179, 8); // Yellow/orange for unavailable
        }
        doc.text(`Status: ${service.status.toUpperCase()}`, pageWidth - 20, 30, { align: 'right' });
        
        // Category box
        setSafeColor('fill', 235, 245, 255); // Very light blue
        doc.roundedRect(20, 45, pageWidth - 40, 25, 3, 3, 'F');
        setSafeColor('text', 0, 112, 201);
        doc.setFontSize(12);
        doc.text('Category:', 30, 60);
        doc.setFontSize(14);
        doc.text(service.category, 100, 60);
        
        // Description
        setSafeColor('text', 80, 80, 80);
        doc.setFontSize(11);
        doc.text('Description:', 20, 85);
        
        const description = service.description || 'No description available';
        const splitDescription = doc.splitTextToSize(description, pageWidth - 40);
        doc.setFontSize(10);
        doc.text(splitDescription, 20, 95);
        
        // Price information
        setSafeColor('fill', 235, 245, 255);
        doc.roundedRect(20, 130, pageWidth - 40, 30, 3, 3, 'F');
        doc.setFontSize(12);
        setSafeColor('text', 50, 50, 50);
        doc.text('Price:', 30, 145);
        
        setSafeColor('text', 0, 112, 201);
        doc.setFontSize(16);
        doc.text(`Rs. ${service.price ? Number(service.price).toLocaleString() : 'N/A'}`, 100, 145);
        
        // Created by information
        setSafeColor('fill', 245, 245, 245);
        doc.roundedRect(20, 170, pageWidth - 40, 30, 3, 3, 'F');
        setSafeColor('text', 80, 80, 80);
        doc.setFontSize(11);
        doc.text('Created By:', 30, 185);
        doc.setFontSize(12);
        setSafeColor('text', 50, 50, 50);
        doc.text(service.createdBy || 'Unknown', 100, 185);
        
        // Creation date
        doc.setFontSize(8);
        setSafeColor('text', 150, 150, 150);
        doc.text(`Date created: ${service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'Unknown'}`, 20, 220);
      });
      
      // Add page numbers to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        if (i > 1) { // Skip for cover page which already has page number
          doc.setFontSize(8);
          setSafeColor('text', 150, 150, 150);
          doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10, { align: 'right' });
        }
      }
      
      // Save PDF
      doc.save(`Additional_Services_Report_${date.toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Generate and download CSV file for services
  const generateCSV = (servicesToInclude = null) => {
    try {
      setGeneratingCSV(true);
      
      // Use either the provided services or all filtered services
      const servicesForCSV = servicesToInclude || filteredServices;
      
      // CSV Header row
      const csvHeader = ["ID", "Service Name", "Category", "Status", "Price (Rs.)", "Created By", "Created At", "Description"];
      
      // CSV Rows
      const csvRows = servicesForCSV.map(service => [
        service.serviceID,
        service.serviceName,
        service.category,
        service.status,
        service.price,
        service.createdBy || 'Unknown',
        service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'Unknown',
        service.description ? service.description.replace(/,/g, ";") : 'No description' // Replace commas with semicolons to prevent CSV parsing issues
      ]);
      
      // Combine header and rows
      const csvContent = [
        csvHeader,
        ...csvRows
      ].map(row => row.join(',')).join('\n');
      
      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      
      // Set file name and download attributes
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `Additional_Services_${date}.csv`);
      
      // Append to the document, trigger download, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating CSV:', err);
      setError('Failed to generate CSV file');
    } finally {
      setGeneratingCSV(false);
    }
  };

  // Generate CSV with selected services
  const generateSelectedCSV = () => {
    // Get only selected services
    const servicesToInclude = filteredServices.filter(service => selectedServices[service._id]);
    
    if (servicesToInclude.length === 0) {
      setError('Please select at least one service for the CSV');
      return;
    }
    
    // Close modal and generate CSV with selected services
    setShowReportModal(false);
    generateCSV(servicesToInclude);
  };

  // Check if there are any active filters
  const hasActiveFilters = () => {
    return categoryFilter !== 'all' || 
           availabilityFilter !== 'all' || 
           searchQuery !== '' ||
           sortBy !== 'dateCreated' ||
           sortOrder !== 'desc';
  };
  
  // Reset all filters
  const resetFilters = () => {
    setCategoryFilter('all');
    setAvailabilityFilter('all');
    setSearchQuery('');
    setSortBy('dateCreated');
    setSortOrder('desc');
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Choreography':
        return '💃';
      case 'Styling':
        return '👔';
      case 'Stage Effects':
        return '✨';
      case 'Photography':
        return '📸';
      case 'Workshops':
        return '🎓';
      default:
        return '🔧';
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = (service) => {
    setDeleteConfirmService(service);
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmService(null);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    if (deleteConfirmService) {
      handleDelete(deleteConfirmService._id);
      setDeleteConfirmService(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white shadow-sm rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Additional Services</h2>
            <p className="text-gray-500 text-sm mt-1">Manage and customize additional services for events</p>
          </div>
          
          {!showForm && (
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${hasActiveFilters() ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-700 bg-white'} hover:bg-gray-50 transition-colors`}
              >
                <Filter className="w-4 h-4" />
                Filters {hasActiveFilters() && <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">Active</span>}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <motion.button
                onClick={handleAdd}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Service
              </motion.button>
              
              <motion.button 
                onClick={handleOpenReportModal}
                disabled={filteredServices.length === 0}
                whileHover={filteredServices.length > 0 ? { scale: 1.03 } : {}}
                whileTap={filteredServices.length > 0 ? { scale: 0.97 } : {}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${filteredServices.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow'} transition-all`}
              >
                {generatingPDF ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </motion.button>
              
              <motion.button 
                onClick={handleOpenReportModal}
                disabled={filteredServices.length === 0}
                whileHover={filteredServices.length > 0 ? { scale: 1.03 } : {}}
                whileTap={filteredServices.length > 0 ? { scale: 0.97 } : {}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${filteredServices.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow'} transition-all`}
              >
                {generatingCSV ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    Export CSV
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 flex items-start">
            <div className="text-red-500 mr-3 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {!showForm ? (
          <>
            {/* Filters section */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700">Filter Services</h3>
                      {hasActiveFilters() && (
                        <button 
                          onClick={resetFilters}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Reset Filters
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Search */}
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search by name, ID, category..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Category Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                          value={categoryFilter} 
                          onChange={handleCategoryFilterChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="all">All Categories</option>
                          <option value="Choreography">Choreography</option>
                          <option value="Styling">Styling</option>
                          <option value="Stage Effects">Stage Effects</option>
                          <option value="Photography">Photography</option>
                          <option value="Workshops">Workshops</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      {/* Availability Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                        <select 
                          value={availabilityFilter} 
                          onChange={handleAvailabilityFilterChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="all">All</option>
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </div>
                      
                      {/* Sort Controls */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                        <div className="flex">
                          <select 
                            value={sortBy} 
                            onChange={handleSortChange}
                            className="w-1/2 p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            <option value="dateCreated">Date</option>
                            <option value="price">Price</option>
                            <option value="name">Name</option>
                          </select>
                          <select 
                            value={sortOrder} 
                            onChange={handleSortOrderChange}
                            className="w-1/2 p-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Services List */}
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading services...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                {services.length === 0 ? (
                  <div>
                    <div className="bg-blue-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Services Found</h3>
                    <p className="text-gray-500 mb-6">Start by adding your first additional service.</p>
                    <button 
                      onClick={handleAdd}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Service
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-yellow-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <Filter className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Matching Services</h3>
                    <p className="text-gray-500 mb-6">No services match your filter criteria.</p>
                    <button 
                      onClick={resetFilters}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors inline-flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <motion.div
                    key={service._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm py-1 px-3 rounded-full flex items-center shadow-sm">
                      <span className="mr-1">{getCategoryIcon(service.category)}</span>
                      <span className="text-xs font-medium text-gray-700">{service.category}</span>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span 
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          service.status.toLowerCase() === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {service.status.toLowerCase() === 'available' ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-6 pt-14">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{service.serviceName}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Briefcase className="w-3.5 h-3.5 mr-1" />
                          ID: {service.serviceID}
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm line-clamp-3">{service.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-500 mr-1.5" />
                          <span className="text-sm text-gray-600">{service.createdBy}</span>
                        </div>
                        
                        <div className="flex items-center text-2xl font-bold text-blue-600">
                          <span className="text-sm font-normal text-gray-500 mr-1">Rs.</span>{service.price}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(service)}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteConfirm(service)}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={handleBackToList}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </div>
                <AdditionalServiceForm
                  service={editingService}
                  onSubmit={handleFormSubmit}
                  onCancel={handleBackToList}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-10"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 max-w-md w-full border border-red-100"
              >
                <div className="flex items-center gap-3 text-red-600 mb-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">Delete Service</h3>
                </div>
                
                <p className="mb-2 text-gray-800">
                  Are you sure you want to delete <span className="font-medium">{deleteConfirmService.serviceName}</span>?
                </p>
                <p className="text-gray-600 text-sm mb-6">
                  This action cannot be undone and will permanently remove the service from the system.
                </p>
                
                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={cancelDelete}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Service
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-10 transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden max-w-3xl w-full max-h-[80vh] flex flex-col border border-blue-100">
              <div className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
                <h2 className="text-xl font-bold">Generate Service Report</h2>
                <button 
                  className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"
                  onClick={() => setShowReportModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <p className="mb-4">Select the services you want to include in the report:</p>
                
                {/* Selection controls */}
                <div className="mb-4 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm p-3 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {Object.values(selectedServices).filter(v => v).length} of {filteredServices.length} services selected
                  </span>
                  <div className="space-x-2">
                    <button 
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
                      onClick={() => toggleSelectAll(true)}
                    >
                      Select All
                    </button>
                    <button 
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
                      onClick={() => toggleSelectAll(false)}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                
                {/* Service selection list */}
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {filteredServices.map(service => (
                    <div 
                      key={service._id} 
                      className={`flex items-center p-3 rounded-lg border ${selectedServices[service._id] ? 'bg-blue-50/90 border-blue-200' : 'bg-white/90 border-gray-200'}`}
                    >
                      <input
                        type="checkbox"
                        id={`service-${service._id}`}
                        checked={selectedServices[service._id] || false}
                        onChange={() => toggleServiceSelection(service._id)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor={`service-${service._id}`} className="ml-3 flex-1 cursor-pointer">
                        <div className="font-medium">{service.serviceName}</div>
                        <div className="text-sm text-gray-600 flex items-center space-x-3">
                          <span>{service.serviceID}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            service.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {service.status}
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                            {service.category}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50/80 backdrop-blur-sm flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  onClick={generateSelectedCSV}
                  disabled={Object.values(selectedServices).filter(v => v).length === 0}
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Export CSV
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  onClick={generateSelectedReport}
                  disabled={Object.values(selectedServices).filter(v => v).length === 0}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Generate PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalServicesList;
