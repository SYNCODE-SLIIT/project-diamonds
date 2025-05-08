import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserContext } from '../../context/userContext';

// Get current logged-in member ID from UserContext/localStorage
const getCurrentMemberId = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.profileId || '';
    }
  } catch {}
  return '';
};

const MemberDashboardNewRequest = () => {
  const [assignmentRequests, setAssignmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const memberId = getCurrentMemberId();

  useEffect(() => {
    fetchAssignmentRequests();
  }, []);

  const fetchAssignmentRequests = async () => {
    try {
      // Fetch all assignment requests from the team endpoint
      const response = await axios.get('http://localhost:4000/api/assignments/requests');
      // Filter for the current logged-in member using member._id
      const filtered = response.data.filter(req => req.member && req.member._id === memberId);
      setAssignmentRequests(filtered);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignment requests:', error);
      toast.error('Failed to load assignment requests.');
      setAssignmentRequests([]);
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.put(`http://localhost:4000/api/assignments/requests/${requestId}/status`, { status: 'accepted' });
      toast.success('Assignment request accepted successfully');
      setAssignmentRequests(prevRequests =>
        prevRequests.map(request =>
          request._id === requestId
            ? { ...request, status: 'accepted' }
            : request
        )
      );
    } catch (error) {
      toast.error('Failed to accept assignment request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`http://localhost:4000/api/assignments/requests/${requestId}/status`, { status: 'rejected' });
      toast.success('Assignment request rejected successfully');
      setAssignmentRequests(prevRequests =>
        prevRequests.map(request =>
          request._id === requestId
            ? { ...request, status: 'rejected' }
            : request
        )
      );
    } catch (error) {
      toast.error('Failed to reject assignment request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Assignment Requests</h1>
      {assignmentRequests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No assignment requests found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {assignmentRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {request.event?.eventName || 'Event'}
                  </h2>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Date:</span>{' '}
                    {request.event?.eventDate ? new Date(request.event.eventDate).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Location:</span>{' '}
                    {request.event?.eventLocation || 'N/A'}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Guest Count:</span>{' '}
                    {request.event?.guestCount || 'N/A'}
                  </p>
                  <p className="text-gray-600 mb-4">
                    <span className="font-medium">Assigned By:</span>{' '}
                    {request.assignedBy || 'N/A'}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Pending'}
                  </span>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberDashboardNewRequest;