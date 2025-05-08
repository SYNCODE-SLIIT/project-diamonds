import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  MapPin, 
  CheckCircle,
  RefreshCw,
  Users,
  FileDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AcceptedAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/assignments/requests');
      console.log('API Response:', response.data);
      
      const acceptedAssignments = response.data.filter(assignment => {
        console.log('Assignment:', assignment);
        return assignment.status === 'accepted' && assignment.event && assignment.member;
      });
      
      console.log('Filtered Assignments:', acceptedAssignments);
      setAssignments(acceptedAssignments);
      setError(null);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to load accepted assignments');
      toast.error('Failed to load accepted assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const generatePDF = () => {
    try {
      if (!assignments || assignments.length === 0) {
        toast.error('No assignments to generate PDF');
        return;
      }

      console.log('Generating PDF with assignments:', assignments);

      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Accepted Assignments Report', 14, 15);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

      // Prepare table data
      const tableData = assignments.map(assignment => {
        const eventName = assignment.event?.eventName || 'N/A';
        const memberName = assignment.member?.fullName || 'N/A';
        const eventDate = assignment.event?.eventDate 
          ? new Date(assignment.event.eventDate).toLocaleDateString() 
          : 'N/A';
        const location = assignment.event?.eventLocation || 'N/A';

        console.log('Table row data:', { eventName, memberName, eventDate, location });

        return [eventName, memberName, eventDate, location];
      });

      console.log('Table data prepared:', tableData);

      // Add table using autoTable
      autoTable(doc, {
        startY: 35,
        head: [['Event Name', 'Assigned Member', 'Date', 'Location']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didDrawPage: function(data) {
          // Add page number
          doc.setFontSize(10);
          doc.text(
            `Page ${data.pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        }
      });

      // Save the PDF
      doc.save('accepted-assignments.pdf');
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  // Group assignments by event
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const eventId = assignment.event?._id;
    if (!eventId) return acc;

    if (!acc[eventId]) {
      acc[eventId] = {
        eventName: assignment.event?.eventName,
        eventDate: assignment.event?.eventDate,
        eventLocation: assignment.event?.eventLocation,
        members: []
      };
    }

    if (assignment.member?.fullName) {
      acc[eventId].members.push({
        name: assignment.member.fullName,
        status: assignment.status
      });
    }

    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchAssignments}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <CheckCircle className="mr-3 text-green-600" size={36} />
            <h2 className="text-3xl font-bold text-gray-800">Accepted Assignments</h2>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={generatePDF}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={loading || assignments.length === 0}
            >
              <FileDown className="mr-2" size={20} />
              Download PDF
            </button>
            <button
              onClick={fetchAssignments}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <RefreshCw className="mr-2" size={20} />
              Refresh
            </button>
          </div>
        </div>

        {Object.keys(groupedAssignments).length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No accepted assignments found</p>
            <p className="text-sm text-gray-400 mt-2">Total assignments: {assignments.length}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(groupedAssignments).map((event, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.eventName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        {event.members.map((member, idx) => (
                          <div key={idx} className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-900">{member.name}</span>
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Accepted
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        {event.eventLocation || 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptedAssignments; 