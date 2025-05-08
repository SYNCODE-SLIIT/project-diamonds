import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  MapPin, 
  Users, 
  PlusCircle, 
  CheckCircle, 
  AlertTriangle,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const PracticeSessionManagement = () => {
  const [sessionDate, setSessionDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [sessionMessage, setSessionMessage] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [assignMessage, setAssignMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [practiceRequests, setPracticeRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

  const fetchPracticeRequests = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/practice-requests/requests');
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

  const handleViewRequests = () => {
    setShowRequests(!showRequests);
    if (!showRequests) {
      fetchPracticeRequests();
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6">
      {/* View Practice Requests Button */}
      <div className="flex justify-end">
        <button
          onClick={handleViewRequests}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
        >
          <Eye className="mr-2" size={20} />
          {showRequests ? 'Hide Practice Requests' : 'View Practice Requests'}
        </button>
      </div>

      {/* Practice Requests Section */}
      {showRequests && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">Practice Requests</h3>
          {practiceRequests.length === 0 ? (
            <p className="text-gray-500">No practice requests found.</p>
          ) : (
            <div className="space-y-4">
              {practiceRequests.map((request) => (
                <div key={request._id} className="bg-white p-4 rounded-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{request.practiceName}</h4>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(request.practiceDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Time: {new Date(request.practiceDate).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Location: {request.practiceLocation}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Practice Session Section */}
      {/* ... existing code ... */}
    </div>
  );
};

export default PracticeSessionManagement; 