import React, { useState, useEffect } from 'react';
import { getPackages, deletePackage } from '../../services/packageService';
import PackageForm from './PackageForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Plus, Filter, ChevronDown, Search, RefreshCw, Trash2, Edit3, Package2, Tag, DollarSign, Users, Clock, Calendar, AlertCircle, User, Check, FileSpreadsheet } from 'lucide-react';

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  
  // Filter, sort, and search states
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateCreated');
  const [sortOrder, setSortOrder] = useState('desc');
  // PDF and CSV generation loading states
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingCSV, setGeneratingCSV] = useState(false);

  // Add to state variables at the top
  const [selectedPackages, setSelectedPackages] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await getPackages();
      setPackages(data);
      setFilteredPackages(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Apply filters, sorting, and search whenever dependencies change
  useEffect(() => {
    let result = [...packages];
    
    // Apply type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'system') {
        result = result.filter(pkg => pkg.type === 'system');
      } else if (typeFilter === 'custom') {
        result = result.filter(pkg => pkg.type === 'custom');
      } else if (typeFilter === 'custom-pending') {
        result = result.filter(pkg => pkg.type === 'custom' && pkg.status !== 'approved');
      } else if (typeFilter === 'custom-approved') {
        result = result.filter(pkg => pkg.type === 'custom' && pkg.status === 'approved');
      }
    }
    
    // Apply search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(pkg => 
        pkg.packageName.toLowerCase().includes(query) || 
        pkg.description.toLowerCase().includes(query) ||
        pkg.packageID.toLowerCase().includes(query) ||
        (pkg.danceStyles && pkg.danceStyles.some(style => style.toLowerCase().includes(query)))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'dateCreated') {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'price') {
        const priceA = Number(a.price || 0);
        const priceB = Number(b.price || 0);
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      }
      // Default to name sorting if other options fail
      return sortOrder === 'asc' 
        ? a.packageName.localeCompare(b.packageName)
        : b.packageName.localeCompare(a.packageName);
    });
    
    setFilteredPackages(result);
  }, [packages, typeFilter, searchQuery, sortBy, sortOrder]);

  // Open form for creating a new package
  const handleAddNew = () => {
    setCurrentPackage(null);
    setShowForm(true);
  };

  // Open form for editing an existing package
  const handleEdit = (pkg) => {
    setCurrentPackage(pkg);
    setShowForm(true);
  };

  // Confirm delete modal
  const handleDeleteConfirm = (pkg) => {
    setPackageToDelete(pkg);
    setShowDeleteModal(true);
  };

  // Delete a package
  const handleDelete = async () => {
    if (!packageToDelete) return;
    try {
      await deletePackage(packageToDelete._id);
      setShowDeleteModal(false);
      setPackageToDelete(null);
      fetchPackages();
    } catch (err) {
      setError(err.message || 'Failed to delete package');
      setShowDeleteModal(false);
    }
  };

  // After form submission
  const handleFormSuccess = () => {
    setShowForm(false);
    fetchPackages();
  };

  // Handle filter and sort changes
  const handleFilterChange = (e) => {
    setTypeFilter(e.target.value);
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
  
  // Handler for returning to the package list
  const handleBackToList = () => {
    setShowForm(false);
    setCurrentPackage(null);
  };

  // Open report modal
  const handleOpenReportModal = () => {
    // Initialize selected packages with the filtered packages
    const initialSelection = {};
    filteredPackages.forEach(pkg => {
      initialSelection[pkg._id] = true; // Select all by default
    });
    setSelectedPackages(initialSelection);
    setShowReportModal(true);
  };
  
  // Toggle package selection for report
  const togglePackageSelection = (id) => {
    setSelectedPackages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Select/deselect all packages
  const toggleSelectAll = (select) => {
    const newSelection = {};
    filteredPackages.forEach(pkg => {
      newSelection[pkg._id] = select;
    });
    setSelectedPackages(newSelection);
  };
  
  // Generate report with selected packages
  const generateSelectedReport = () => {
    // Get only selected packages
    const packagesToInclude = filteredPackages.filter(pkg => selectedPackages[pkg._id]);
    
    if (packagesToInclude.length === 0) {
      setError('Please select at least one package for the report');
      return;
    }
    
    // Close modal and generate PDF with selected packages
    setShowReportModal(false);
    generatePDF(packagesToInclude);
  };

  // Update generatePDF to accept specific packages
  const generatePDF = async (packagesToInclude = null) => {
    try {
      setGeneratingPDF(true);
      
      // Use either the provided packages or all filtered packages
      const packagesForReport = packagesToInclude || filteredPackages;
      
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
      setSafeColor('fill', 220, 38, 38); // Red header
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setFont('helvetica', 'bold');
      setSafeColor('text', 255, 255, 255);
      doc.setFontSize(24);
      doc.text('DANCE PERFORMANCE PACKAGES', pageWidth / 2, 25, { align: 'center' });
      
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
      setSafeColor('draw', 220, 38, 38);
      setSafeColor('fill', 253, 242, 242);
      doc.roundedRect(20, 140, pageWidth - 40, 50, 3, 3, 'FD');
      
      doc.setFontSize(12);
      setSafeColor('text', 180, 40, 40);
      doc.text('FILTER CRITERIA', pageWidth / 2, 155, { align: 'center' });
      
      doc.setFontSize(10);
      setSafeColor('text', 80, 80, 80);
      
      const filterTexts = [
        `Type: ${typeFilter === 'all' ? 'All Types' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}`,
        `Sort by: ${sortBy === 'dateCreated' ? 'Date Created' : sortBy === 'price' ? 'Price' : 'Name'} (${sortOrder === 'desc' ? 'Descending' : 'Ascending'})`,
        searchQuery ? `Search Query: "${searchQuery}"` : 'No search query applied'
      ];
      
      filterTexts.forEach((text, index) => {
        doc.text(text, pageWidth / 2, 165 + (index * 8), { align: 'center' });
      });
      
      // Package count
      setSafeColor('fill', 240, 240, 240);
      doc.roundedRect(pageWidth / 2 - 40, 200, 80, 20, 3, 3, 'F');
      doc.setFontSize(12);
      setSafeColor('text', 50, 50, 50);
      doc.text(`Total Packages: ${filteredPackages.length}`, pageWidth / 2, 212, { align: 'center' });
      
      // Footer
      setSafeColor('draw', 220, 38, 38);
      doc.line(20, 240, pageWidth - 20, 240);
      doc.setFontSize(10);
      setSafeColor('text', 100, 100, 100);
      doc.text('Project Diamonds - Dance Performance Management System', pageWidth / 2, 250, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Page 1', pageWidth - 20, 270, { align: 'right' });
      
      // Add table of contents as page 2
      doc.addPage();
      
      // Header for table of contents
      setSafeColor('fill', 220, 38, 38);
      doc.rect(0, 0, pageWidth, 20, 'F');
      setSafeColor('text', 255, 255, 255);
      doc.setFontSize(14);
      doc.text('TABLE OF CONTENTS', pageWidth / 2, 14, { align: 'center' });
      
      // Table of contents content
      setSafeColor('text', 50, 50, 50);
      doc.setFontSize(12);
      doc.text('1. Summary of Packages', 20, 40);
      doc.text('2. Package Details', 20, 50);
      
      // Page numbers
      setSafeColor('text', 100, 100, 100);
      doc.setFontSize(10);
      doc.text('Page 3', 180, 40);
      doc.text('Page 4-' + (4 + filteredPackages.length - 1), 180, 50);
      
      // Add summary table as page 3
      doc.addPage();
      
      // Header for summary table
      setSafeColor('fill', 220, 38, 38);
      doc.rect(0, 0, pageWidth, 20, 'F');
      setSafeColor('text', 255, 255, 255);
      doc.setFontSize(14);
      doc.text('1. SUMMARY OF PACKAGES', pageWidth / 2, 14, { align: 'center' });
      
      // Define table columns
      const tableColumn = [
        'ID', 
        'Package Name', 
        'Type', 
        'Status', 
        'Price (Rs.)', 
        'Travel Fee (Rs.)'
      ];
      
      // Define table rows
      const tableRows = packagesForReport.map(pkg => [
        pkg.packageID,
        pkg.packageName,
        pkg.type === 'system' ? 'System' : 'Custom',
        pkg.status ? pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1) : 'N/A',
        pkg.price ? Number(pkg.price).toLocaleString() : 'N/A',
        pkg.travelFees ? Number(pkg.travelFees).toLocaleString() : '0'
      ]);
      
      // Generate summary table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { 
          fillColor: [220, 38, 38],
          textColor: [255, 255, 255], 
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 30 }
      });
      
      // Detailed package info (1 package per page)
      packagesForReport.forEach((pkg, index) => {
        doc.addPage();
        
        // Package details header
        setSafeColor('fill', 220, 38, 38);
        doc.rect(0, 0, pageWidth, 20, 'F');
        setSafeColor('text', 255, 255, 255);
        doc.setFontSize(14);
        doc.text(`2.${index + 1} PACKAGE DETAILS`, pageWidth / 2, 14, { align: 'center' });
        
        // Package name and ID
        setSafeColor('fill', 240, 240, 240);
        doc.rect(0, 20, pageWidth, 16, 'F');
        setSafeColor('text', 50, 50, 50);
        doc.setFontSize(12);
        doc.text(`${pkg.packageName} (ID: ${pkg.packageID})`, 20, 30);
        
        // Type and status
        doc.setFontSize(10);
        if (pkg.status === 'approved') {
          setSafeColor('text', 34, 197, 94);
        } else {
          setSafeColor('text', 234, 179, 8);
        }
        doc.text(`Status: ${pkg.status ? pkg.status.toUpperCase() : 'N/A'}`, pageWidth - 20, 30, { align: 'right' });
        
        // Package image placeholder
        setSafeColor('draw', 200, 200, 200);
        setSafeColor('fill', 245, 245, 245);
        doc.rect(20, 45, 60, 60, 'FD');
        doc.setFontSize(8);
        setSafeColor('text', 150, 150, 150);
        doc.text('Package Image', 50, 75, { align: 'center' });
        
        // Description
        setSafeColor('text', 80, 80, 80);
        doc.setFontSize(11);
        doc.text('Description:', 90, 50);
        
        const description = pkg.description || 'No description available';
        const splitDescription = doc.splitTextToSize(description, 100);
        doc.setFontSize(9);
        doc.text(splitDescription, 90, 58);
        
        // Price information
        setSafeColor('fill', 245, 245, 245);
        doc.roundedRect(20, 115, pageWidth - 40, 25, 2, 2, 'F');
        doc.setFontSize(11);
        setSafeColor('text', 50, 50, 50);
        doc.text('Price Details:', 25, 125);
        
        doc.setFontSize(10);
        doc.text(`Package Price: Rs. ${pkg.price ? Number(pkg.price).toLocaleString() : 'N/A'}`, 25, 135);
        doc.text(`Travel Fee: Rs. ${pkg.travelFees ? Number(pkg.travelFees).toLocaleString() : '0'}`, pageWidth - 60, 135);
        
        // Dance styles
        setSafeColor('fill', 253, 242, 242); // Light red
        doc.roundedRect(20, 150, pageWidth - 40, 30, 2, 2, 'F');
        doc.setFontSize(11);
        setSafeColor('text', 50, 50, 50);
        doc.text('Dance Styles:', 25, 160);
        
        if (pkg.danceStyles && pkg.danceStyles.length > 0) {
          doc.setFontSize(9);
          const danceStyles = pkg.danceStyles.join(', ');
          const splitStyles = doc.splitTextToSize(danceStyles, pageWidth - 50);
          doc.text(splitStyles, 25, 168);
        } else {
          doc.setFontSize(9);
          setSafeColor('text', 150, 150, 150);
          doc.text('No dance styles specified', 25, 168);
        }
        
        // Team involvement
        setSafeColor('fill', 245, 245, 245);
        doc.roundedRect(20, 190, pageWidth - 40, 40, 2, 2, 'F');
        doc.setFontSize(11);
        setSafeColor('text', 50, 50, 50);
        doc.text('Team Involvement:', 25, 200);
        
        if (pkg.teamInvolvement) {
          doc.setFontSize(9);
          doc.text(`Male Dancers: ${pkg.teamInvolvement.maleDancers || 0}`, 25, 210);
          doc.text(`Female Dancers: ${pkg.teamInvolvement.femaleDancers || 0}`, 25, 218);
          doc.text(`Choreographers: ${pkg.teamInvolvement.choreographers || 0}`, 100, 210);
          doc.text(`MCs: ${pkg.teamInvolvement.MC || 0}`, 100, 218);
        } else {
          doc.setFontSize(9);
          setSafeColor('text', 150, 150, 150);
          doc.text('No team details available', 25, 210);
        }
        
        // Creation info
        doc.setFontSize(8);
        setSafeColor('text', 150, 150, 150);
        doc.text(`Created by: ${pkg.createdBy || 'Unknown'}`, 20, 240);
        doc.text(`Date created: ${pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString() : 'Unknown'}`, 20, 247);
        
        // Package type badge
        if (pkg.type === 'system') {
          setSafeColor('fill', 59, 130, 246); // Blue for system
        } else {
          setSafeColor('fill', 220, 38, 38); // Red for custom
        }
        doc.roundedRect(pageWidth - 50, 238, 30, 12, 6, 6, 'F');
        setSafeColor('text', 255, 255, 255);
        doc.text(pkg.type.toUpperCase(), pageWidth - 35, 246, { align: 'center' });
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
      doc.save(`Dance_Packages_Report_${date.toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Generate and download CSV file for packages
  const generateCSV = (packagesToInclude = null) => {
    try {
      setGeneratingCSV(true);
      
      // Use either the provided packages or all filtered packages
      const packagesForCSV = packagesToInclude || filteredPackages;
      
      // CSV Header row
      const csvHeader = [
        "ID", 
        "Package Name", 
        "Type", 
        "Status", 
        "Price (Rs.)", 
        "Travel Fee (Rs.)",
        "Description",
        "Male Dancers",
        "Female Dancers",
        "Choreographers",
        "MCs",
        "Dance Styles",
        "Created By",
        "Created At"
      ];
      
      // CSV Rows
      const csvRows = packagesForCSV.map(pkg => [
        pkg.packageID,
        pkg.packageName,
        pkg.type,
        pkg.status || 'N/A',
        pkg.price || '',
        pkg.travelFees || '0',
        pkg.description ? pkg.description.replace(/,/g, ";") : '', // Replace commas with semicolons
        pkg.teamInvolvement?.maleDancers || '0',
        pkg.teamInvolvement?.femaleDancers || '0',
        pkg.teamInvolvement?.choreographers || '0',
        pkg.teamInvolvement?.MC || '0',
        pkg.danceStyles ? pkg.danceStyles.join("; ") : '', // Join dance styles with semicolons
        pkg.createdBy || 'Unknown',
        pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString() : 'Unknown'
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
      link.setAttribute('download', `Dance_Packages_${date}.csv`);
      
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

  // Generate CSV with selected packages
  const generateSelectedCSV = () => {
    // Get only selected packages
    const packagesToInclude = filteredPackages.filter(pkg => selectedPackages[pkg._id]);
    
    if (packagesToInclude.length === 0) {
      setError('Please select at least one package for the CSV');
      return;
    }
    
    // Close modal and generate CSV with selected packages
    setShowReportModal(false);
    generateCSV(packagesToInclude);
  };

  // Check if there are any active filters
  const hasActiveFilters = () => {
    return typeFilter !== 'all' || 
           searchQuery !== '' ||
           sortBy !== 'dateCreated' ||
           sortOrder !== 'desc';
  };
  
  // Reset all filters
  const resetFilters = () => {
    setTypeFilter('all');
    setSearchQuery('');
    setSortBy('dateCreated');
    setSortOrder('desc');
  };

  if (loading && packages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white shadow-sm rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dance Performance Packages</h2>
            <p className="text-gray-500 text-sm mt-1">Manage and customize dance performance packages for events</p>
          </div>
          
          {!showForm && (
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${hasActiveFilters() ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-300 text-gray-700 bg-white'} hover:bg-gray-50 transition-colors`}
              >
                <Filter className="w-4 h-4" />
                Filters {hasActiveFilters() && <span className="text-xs bg-red-100 text-red-800 rounded-full px-2 py-0.5">Active</span>}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <motion.button
                onClick={handleAddNew}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Package
              </motion.button>
              
              <motion.button 
                onClick={handleOpenReportModal}
                disabled={filteredPackages.length === 0}
                whileHover={filteredPackages.length > 0 ? { scale: 1.03 } : {}}
                whileTap={filteredPackages.length > 0 ? { scale: 0.97 } : {}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${filteredPackages.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow'} transition-all`}
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
                disabled={filteredPackages.length === 0}
                whileHover={filteredPackages.length > 0 ? { scale: 1.03 } : {}}
                whileTap={filteredPackages.length > 0 ? { scale: 0.97 } : {}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${filteredPackages.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow'} transition-all`}
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
                      <h3 className="font-semibold text-gray-700">Filter Packages</h3>
                      {hasActiveFilters() && (
                        <button 
                          onClick={resetFilters}
                          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Reset Filters
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Search */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search packages..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                        <select 
                          value={typeFilter} 
                          onChange={handleFilterChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        >
                          <option value="all">All Types</option>
                          <option value="system">System</option>
                          <option value="custom">All Custom</option>
                          <option value="custom-pending">Custom Pending</option>
                          <option value="custom-approved">Custom Approved</option>
                        </select>
                      </div>
                      
                      {/* Sort Controls */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select 
                          value={sortBy} 
                          onChange={handleSortChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        >
                          <option value="dateCreated">Date Created</option>
                          <option value="price">Price</option>
                          <option value="name">Name</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                        <select 
                          value={sortOrder} 
                          onChange={handleSortOrderChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        >
                          <option value="desc">Descending</option>
                          <option value="asc">Ascending</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Packages List */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading packages...</p>
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                {packages.length === 0 ? (
                  <div>
                    <div className="bg-red-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <Package2 className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Packages Found</h3>
                    <p className="text-gray-500 mb-6">Start by adding your first dance performance package.</p>
                    <button 
                      onClick={handleAddNew}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Package
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-yellow-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <Filter className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Matching Packages</h3>
                    <p className="text-gray-500 mb-6">No packages match your filter criteria.</p>
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
                {filteredPackages.map((pkg) => (
                  <motion.div
                    key={pkg._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    {/* Package Image */} 
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={pkg.image || 'https://res.cloudinary.com/du5c9fw6s/image/upload/v1742922785/default_zojwtj.avif'} 
                        alt={pkg.packageName} 
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span className="text-white font-bold text-lg line-clamp-1">{pkg.packageName}</span>
                        <p className="text-white/80 text-sm">ID: {pkg.packageID}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <span 
                        className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm backdrop-blur-sm ${
                          pkg.status === 'approved' 
                            ? 'bg-green-100/90 text-green-800' 
                            : 'bg-yellow-100/90 text-yellow-800'
                        }`}
                      >
                        {pkg.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100/90 backdrop-blur-sm text-blue-800 shadow-sm">
                        {pkg.type}
                      </span>
                    </div>
                    
                    <div className="p-5">
                      {/* Dance Styles */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 flex items-center mb-2">
                          <Tag className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                          Dance Styles
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {pkg.danceStyles && pkg.danceStyles.length > 0 ? pkg.danceStyles.map((style, idx) => (
                            <span key={idx} className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs">
                              {style}
                            </span>
                          )) : (
                            <span className="text-gray-400 text-xs italic">No styles specified</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>
                      
                      {/* Team Stats */}
                      <div className="mb-4 bg-gray-50 rounded-lg p-3">
                        <p className="text-sm flex items-center mb-2">
                          <Users className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                          <span className="text-gray-700">Team Composition</span>
                        </p>
                        {pkg.teamInvolvement ? (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center text-xs text-gray-600">
                              <span className="bg-red-100 text-red-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-1.5">
                                {pkg.teamInvolvement.maleDancers}
                              </span>
                              Male Dancers
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <span className="bg-red-100 text-red-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-1.5">
                                {pkg.teamInvolvement.femaleDancers}
                              </span>
                              Female Dancers
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <span className="bg-red-100 text-red-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-1.5">
                                {pkg.teamInvolvement.choreographers}
                              </span>
                              Choreographers
                            </div>
                            {pkg.teamInvolvement.MC > 0 && (
                              <div className="flex items-center text-xs text-gray-600">
                                <span className="bg-red-100 text-red-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-1.5">
                                  {pkg.teamInvolvement.MC}
                                </span>
                                MCs
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-xs italic">No team details available</p>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div>
                          {pkg.price !== null && pkg.price !== undefined ? (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                              <span className="text-xl font-bold text-green-600">
                                Rs. {Number(pkg.price).toLocaleString()}
                              </span>
                              {pkg.travelFees > 0 && (
                                <span className="ml-1 text-xs text-gray-500 inline-flex items-center">
                                  + Rs.{Number(pkg.travelFees).toLocaleString()} travel
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Price on request</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(pkg)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteConfirm(pkg)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </motion.button>
                        </div>
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
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-red-100">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {currentPackage ? 'Edit Package' : 'Create New Package'}
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
                <PackageForm
                  package={currentPackage}
                  onSuccess={handleFormSuccess}
                  onCancel={handleBackToList}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
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
                  <h3 className="text-lg font-bold">Delete Package</h3>
                </div>
                
                <p className="mb-2 text-gray-800">
                  Are you sure you want to delete <span className="font-medium">{packageToDelete?.packageName}</span>?
                </p>
                <p className="text-gray-600 text-sm mb-6">
                  This action cannot be undone and will permanently remove the package from the system.
                </p>
                
                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Package
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-10 transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden max-w-3xl w-full max-h-[80vh] flex flex-col border border-red-100">
              <div className="bg-red-600 text-white px-6 py-3 flex justify-between items-center">
                <h2 className="text-xl font-bold">Generate Package Report</h2>
                <button 
                  className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"
                  onClick={() => setShowReportModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <p className="mb-4">Select the packages you want to include in the report:</p>
                
                {/* Selection controls */}
                <div className="mb-4 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm p-3 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {Object.values(selectedPackages).filter(v => v).length} of {filteredPackages.length} packages selected
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
                
                {/* Package selection list */}
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {filteredPackages.map(pkg => (
                    <div 
                      key={pkg._id} 
                      className={`flex items-center p-3 rounded-lg border ${selectedPackages[pkg._id] ? 'bg-red-50/90 border-red-200' : 'bg-white/90 border-gray-200'}`}
                    >
                      <input
                        type="checkbox"
                        id={`pkg-${pkg._id}`}
                        checked={selectedPackages[pkg._id] || false}
                        onChange={() => togglePackageSelection(pkg._id)}
                        className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                      />
                      <label htmlFor={`pkg-${pkg._id}`} className="ml-3 flex-1 cursor-pointer">
                        <div className="font-medium">{pkg.packageName}</div>
                        <div className="text-sm text-gray-600 flex items-center space-x-3">
                          <span>{pkg.packageID}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            pkg.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pkg.status || 'Status unknown'}
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                            {pkg.type}
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
                  disabled={Object.values(selectedPackages).filter(v => v).length === 0}
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Export CSV
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  onClick={generateSelectedReport}
                  disabled={Object.values(selectedPackages).filter(v => v).length === 0}
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

export default PackageList;
