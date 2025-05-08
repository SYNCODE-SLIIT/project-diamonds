import React from 'react';
import AdminApplicationsList from './AdminApplicationsList'; // Pending Applications
import AdminInvitedApplicationsList from './AdminInvitedApplicationsList'; // Invited Applications
import AdminFinalizedApplicationsList from './AdminFinalizedApplicationsList'; // Approved/Rejected Applications
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const AdminApplicationsCombinedList = () => {
  const generateReport = async () => {
    try {
      console.log('Starting report generation...');
      
      // Update to use the CORRECT API endpoints that match your components
      const [pendingRes, invitedRes, finalizedRes] = await Promise.all([
        axios.get('http://localhost:4000/api/admin/applications'),        // Used in AdminApplicationsList
        axios.get('http://localhost:4000/api/member-applications/invited'), // Used in AdminInvitedApplicationsList
        axios.get('http://localhost:4000/api/member-applications/finalized') // Used in AdminFinalizedApplicationsList
      ]);
      
      console.log('API responses received:', {
        pending: pendingRes.data,
        invited: invitedRes.data,
        finalized: finalizedRes.data
      });
      
      // Extract applications from responses - note the different structure for each endpoint
      const pendingApplications = pendingRes.data.applications || [];
      const invitedApplications = invitedRes.data.applications || [];
      const finalizedApplications = finalizedRes.data.applications || [];
      
      const allApplications = [...pendingApplications, ...invitedApplications, ...finalizedApplications];
      
      if (allApplications.length === 0) {
        console.warn('No applications found to generate report');
        alert('No applications data available for the report');
        return;
      }
      
      console.log('Generating PDF with', allApplications.length, 'applications');
      
      // Create new document with slightly larger page (A4)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add document metadata
      doc.setProperties({
        title: 'Diamond Dance Company - Applications Report',
        subject: 'Member Applications Summary',
        author: 'Diamond Dance Admin',
        creator: 'Diamond Dance Company'
      });
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Define colors
      const primaryColor = [22, 160, 133]; // teal
      const secondaryColor = [41, 128, 185]; // blue
      const accentColor = [142, 68, 173]; // purple
      
      // Add fancy header with gradient background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Add decorative element
      doc.setFillColor(...secondaryColor);
      doc.rect(0, 38, pageWidth, 4, 'F');
      
      // Add title with shadow effect
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('DIAMOND DANCE', pageWidth/2, 18, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Applications Report', pageWidth/2, 28, { align: 'center' });
      
      // Add date and summary
      const today = new Date();
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Generated: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`, pageWidth - 15, 50, { align: 'right' });
      
      // Add summary boxes
      const summaryY = 60;
      const boxWidth = 58;
      const boxHeight = 25;
      const gap = 8;
      
      const approvedCount = finalizedApplications.filter(app => app.applicationStatus === 'Approved').length;
      const rejectedCount = finalizedApplications.filter(app => app.applicationStatus === 'Rejected').length;

      // Summary boxes with counts
      const boxes = [
        { label: 'Pending', count: pendingApplications.length, color: [241, 196, 15] }, // yellow
        { label: 'Invited', count: invitedApplications.length, color: [230, 126, 34] }, // orange
        { label: 'Approved', count: approvedCount, color: [46, 204, 113] }, // green
        { label: 'Rejected', count: rejectedCount, color: [231, 76, 60] }  // red
      ];
      
      boxes.forEach((box, index) => {
        const boxX = 15 + (boxWidth + gap) * index;
        
        // Draw box with rounded corners
        doc.setFillColor(...box.color);
        doc.roundedRect(boxX, summaryY, boxWidth, boxHeight, 3, 3, 'F');
        
        // Add label and count
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(box.label, boxX + boxWidth/2, summaryY + 10, { align: 'center' });
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(box.count.toString(), boxX + boxWidth/2, summaryY + 20, { align: 'center' });
        doc.setFont(undefined, 'normal');
      });
      
      // Add "Applications by Status" section title
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Applications by Status', 15, summaryY + boxHeight + 15);
      doc.setFont(undefined, 'normal');
      
      // Add tables for each status type
      const tableStartY = summaryY + boxHeight + 20;
      
      // Function to add table with title
      const addApplicationsTable = (title, applications, startY, titleColor) => {
        if (applications.length === 0) return startY;

        // Add section title with colored indicator
        doc.setTextColor(...titleColor);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${title} (${applications.length})`, 15, startY);
        doc.setFont(undefined, 'normal');
        
        const columns = [
          { header: '#', dataKey: 'index' },
          { header: 'Name', dataKey: 'name' },
          { header: 'Email', dataKey: 'email' },
          { header: 'Dance Style', dataKey: 'danceStyle' },
          { header: 'Date', dataKey: 'date' }
        ];
        
        const tableData = applications.map((app, idx) => ({
          index: idx + 1,
          name: app.fullName || '',
          email: app.email || '',
          danceStyle: app.danceStyle || '',
          date: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''
        }));
        
        autoTable(doc, {
          columns: columns,
          body: tableData,
          startY: startY + 5,
          theme: 'grid',
          headStyles: { 
            fillColor: titleColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            index: { cellWidth: 10 },
            email: { cellWidth: 50 }
          },
          margin: { left: 15, right: 15 },
          didDrawPage: (data) => {
            // Add header on new pages
            if (data.pageNumber > 1) {
              // Smaller header for continuation pages
              doc.setFillColor(...primaryColor);
              doc.rect(0, 0, pageWidth, 20, 'F');
              
              doc.setFontSize(14);
              doc.setTextColor(255, 255, 255);
              doc.text('DIAMOND DANCE - Applications Report (Continued)', pageWidth/2, 12, { align: 'center' });
              
              // Add page number
              doc.setFontSize(10);
              doc.text(`Page ${data.pageNumber}`, pageWidth - 20, pageHeight - 10);
            }
          }
        });
        
        // Return the final Y position after the table
        return doc.lastAutoTable.finalY + 15;
      };
      
      // Add tables for each status
      let currentY = tableStartY;
      currentY = addApplicationsTable('Pending Applications', pendingApplications, currentY, [241, 196, 15]);
      currentY = addApplicationsTable('Invited Applications', invitedApplications, currentY, [230, 126, 34]);
      currentY = addApplicationsTable('Approved Applications', finalizedApplications.filter(app => app.applicationStatus === 'Approved'), currentY, [46, 204, 113]);
      currentY = addApplicationsTable('Rejected Applications', finalizedApplications.filter(app => app.applicationStatus === 'Rejected'), currentY, [231, 76, 60]);
      
      // Add footer to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Draw footer bar
        doc.setFillColor(240, 240, 240);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        
        // Add footer text
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Diamond Dance Company - Confidential', 15, pageHeight - 6);
        
        // Add page number
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, pageHeight - 6, { align: 'right' });
      }
      
      // Save with a more descriptive filename including date
      const dateStr = today.toISOString().split('T')[0];
      doc.save(`Diamond_Dance_Applications_Report_${dateStr}.pdf`);
      console.log('PDF saved successfully');
      
    } catch (err) {
      console.error('Failed to generate report', err);
      alert('Failed to generate report: ' + (err.message || 'Unknown error'));
    }
  };

  const handleExportCSV = async (type) => {
    try {
      console.log(`Exporting ${type} applications to CSV...`);
      let response;
      let filename;
      let applications;
      
      // Fetch the appropriate data based on type
      if (type === 'pending') {
        response = await axios.get('http://localhost:4000/api/admin/applications');
        applications = response.data.applications || [];
        filename = 'pending_applications.csv';
      } else if (type === 'invited') {
        response = await axios.get('http://localhost:4000/api/member-applications/invited');
        applications = response.data.applications || [];
        filename = 'invited_applications.csv';
      } else if (type === 'finalized') {
        response = await axios.get('http://localhost:4000/api/member-applications/finalized');
        applications = response.data.applications || [];
        filename = 'finalized_applications.csv';
      }

      if (!applications || applications.length === 0) {
        alert(`No ${type} applications found to export.`);
        return;
      }
      
      // Define headers based on application type
      const headers = ['Full Name', 'Email', 'Contact Number', 'Birth Date', 'Age', 
                       'Dance Style', 'Experience', 'Biography', 'Achievements', 
                       'Availabilities', 'Status', 'Created Date'];
      
      // Map applications to rows
      const rows = applications.map(app => [
        app.fullName || '',
        app.email || '',
        app.contactNumber || '',
        app.birthDate ? new Date(app.birthDate).toLocaleDateString() : '',
        app.age || '',
        app.danceStyle || '',
        app.yearsOfExperience || '',
        app.biography || '',
        (app.achievements || []).join('; '),
        (app.availability || []).map(a => `${a.day} ${a.start}-${a.end}`).join('; '),
        app.applicationStatus || '',
        app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''
      ]);
      
      // Create CSV content
      const csvContent = [headers, ...rows].map(r => r.map(val => `"${val}"`).join(',')).join('\n');
      
      // Create and download blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`${type} applications exported successfully`);
    } catch (err) {
      console.error(`Failed to export ${type} applications:`, err);
      alert(`Error exporting ${type} applications: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="bg-white shadow-lg rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Member Applications Dashboard</h1>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleExportCSV('pending')}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg shadow-md hover:from-yellow-600 hover:to-amber-700 transition-all transform hover:scale-105 duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export Pending
            </button>
            <button
              onClick={() => handleExportCSV('invited')}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export Invited
            </button>
            <button
              onClick={() => handleExportCSV('finalized')}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-blue-700 transition-all transform hover:scale-105 duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export Finalized
            </button>
            <button
              onClick={generateReport}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg shadow-md hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105 duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Generate PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* Pending Applications */}
      <AdminApplicationsList />

      {/* Invited Applications */}
      <AdminInvitedApplicationsList />

      {/* Finalized Applications */}
      <AdminFinalizedApplicationsList />
    </div>
  );
};

export default AdminApplicationsCombinedList;