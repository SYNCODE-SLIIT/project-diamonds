import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Calendar, CheckCircle, XCircle, User, Clock } from 'lucide-react';

const PracticeAssignments = () => {
  const [practices, setPractices] = useState([]);
  const [practiceRequests, setPracticeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' or 'requests'

  useEffect(() => {
    fetchPractices();
    fetchPracticeRequests();
  }, []);

  const fetchPractices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/practices');
      setPractices(response.data);
    } catch (error) {
      console.error('Error fetching practices:', error);
      setError('Failed to fetch practices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPracticeRequests = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/practice-requests/requests');
      console.log('Fetched practice requests:', response.data);
      setPracticeRequests(response.data);
    } catch (error) {
      console.error('Error fetching practice requests:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch practice requests',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handlePracticeStatusUpdate = async (requestId, status) => {
    try {
      const endpoint = status === 'accepted' 
        ? `http://localhost:4000/api/practice-requests/requests/${requestId}/accept`
        : `http://localhost:4000/api/practice-requests/requests/${requestId}/reject`;
      
      await axios.put(endpoint);
      
      await Swal.fire({
        title: 'Success!',
        text: `Practice request has been ${status}ed successfully!`,
        icon: 'success',
        confirmButtonColor: '#4F46E5',
        timer: 3000,
        timerProgressBar: true
      });

      fetchPracticeRequests();
      fetchPractices(); // Refresh the practices list as well
    } catch (error) {
      console.error('Error updating practice request status:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update practice request status',
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
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'assignments'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Practice Assignments
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'requests'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Practice Requests
        </button>
      </div>

      {activeTab === 'assignments' ? (
        <>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Practice Assignments</h2>
          {practices.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No practices found.</p>
            </div>
          ) : (
            practices.map(practice => (
              <div key={practice._id} className="bg-white shadow-lg rounded-lg p-6 mb-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">{practice.practiceName}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{new Date(practice.practiceDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>Time: {practice.practiceTime}</span>
                  </div>
                  <p className="text-gray-600">Location: {practice.practiceLocation}</p>
                  <p className="text-gray-600">Duration: {practice.duration} minutes</p>
                  <p className="text-gray-600">Max Participants: {practice.maxParticipants}</p>
                </div>
                <h4 className="mt-4 font-semibold">Assigned Members:</h4>
                {practice.assignedMembers && practice.assignedMembers.length > 0 ? (
                  <ul className="list-disc ml-6">
                    {practice.assignedMembers.map((am, idx) => (
                      <li key={idx} className="text-gray-600">
                        {am.memberID && am.memberID.fullName
                          ? am.memberID.fullName
                          : 'Member info not available'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No members assigned.</p>
                )}
              </div>
            ))
          )}
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Practice Assignment Requests</h2>
          {practiceRequests.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No pending practice assignment requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {practiceRequests.map((request) => (
                <div key={request._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium text-gray-800">{request.practiceName}</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-2" />
                          <span>{new Date(request.practiceDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-5 w-5 mr-2" />
                          <span>Time: {request.practiceTime}</span>
                        </div>
                        <p className="text-gray-600">Location: {request.practiceLocation}</p>
                        <p className="text-gray-600">Duration: {request.duration} minutes</p>
                        <p className="text-gray-600">Max Participants: {request.maxParticipants}</p>
                        <div className="flex items-center text-gray-600">
                          <User className="h-5 w-5 mr-2" />
                          <span>Requested by: {request.requestedBy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handlePracticeStatusUpdate(request._id, 'accepted')}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Accept
                      </button>
                      <button
                        onClick={() => handlePracticeStatusUpdate(request._id, 'rejected')}
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
        </>
      )}
    </div>
  );
};

export default PracticeAssignments; 