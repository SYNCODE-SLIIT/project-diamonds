import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Calendar, CheckCircle, XCircle, User } from 'lucide-react';

const EventAssignmentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignmentRequests();
  }, []);

  const fetchAssignmentRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:4000/api/assignments/requests');
      console.log('Fetched requests:', response.data); // Debug log
      // Filter out any requests without an event or member
      const validRequests = response.data.filter(req => req.event && req.event.eventName && req.member && req.member._id);
      setRequests(validRequests);
    } catch (error) {
      console.error('Error fetching assignment requests:', error);
      setError('Failed to fetch assignment requests. Please try again later.');
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch assignment requests',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await axios.put(`http://localhost:4000/api/assignments/requests/${requestId}/status`, { status });
      
      await Swal.fire({
        title: 'Success!',
        text: `Request has been ${status}ed successfully!`,
        icon: 'success',
        confirmButtonColor: '#4F46E5',
        timer: 3000,
        timerProgressBar: true
      });

      // Refresh the requests list
      fetchAssignmentRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update request status',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Event Assignment Requests</h2>
      
      {requests.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No pending assignment requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-medium text-gray-800">
                    {request.event?.eventName || 'Unknown Event'}
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>{request.event?.eventDate ? new Date(request.event.eventDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <p className="text-gray-600">Location: {request.event?.eventLocation || 'N/A'}</p>
                    <p className="text-gray-600">Guest Count: {request.event?.guestCount ?? 'N/A'}</p>
                    <div className="flex items-center text-gray-600">
                      <User className="h-5 w-5 mr-2" />
                      <span>Requested by: {request.member?.fullName || 'Unknown Member'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-sm text-gray-500">Member ID: {request.member?._id || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleStatusUpdate(request._id, 'accepted')}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(request._id, 'rejected')}
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventAssignmentRequests; 