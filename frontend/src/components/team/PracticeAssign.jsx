import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { Bell, Users, Calendar, MapPin, Clock } from 'lucide-react';

const PracticeAssign = () => {
  const [practices, setPractices] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [selectedPractice, setSelectedPractice] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [assignedBy, setAssignedBy] = useState('TeamManager');
  const [loading, setLoading] = useState(false);
  const [newPractice, setNewPractice] = useState({
    practiceName: '',
    practiceDate: '',
    practiceTime: '',
    practiceLocation: '',
    duration: '',
    maxParticipants: '',
    description: ''
  });

  // Fetch practices and members on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [practicesResponse, membersResponse] = await Promise.all([
          axios.get('http://localhost:4000/api/practices'),
          axios.get('http://localhost:4000/api/member-applications/approved')
        ]);
        setPractices(practicesResponse.data);
        setAllMembers(membersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch assigned members when selectedPractice changes
  useEffect(() => {
    if (selectedPractice) {
      setLoading(true);
      axios.get(`http://localhost:4000/api/practices/${selectedPractice}/assignments`)
        .then(response => {
          setAssignedMembers(response.data);
        })
        .catch(error => {
          if (error.response && error.response.status === 404) {
            setAssignedMembers([]);
          } else {
            console.error('Error fetching assigned members:', error);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setAssignedMembers([]);
    }
  }, [selectedPractice]);

  const availableMembers = allMembers.filter(mem => {
    if (!mem || !mem._id) return false;
    return !assignedMembers.some(amem => 
      amem && amem.memberID && amem.memberID._id === mem._id
    );
  });

  const handlePracticeChange = (event) => {
    setSelectedPractice(event.target.value);
    setSelectedMembers([]);
  };

  const handleMemberSelection = (event) => {
    const value = event.target.value;
    setSelectedMembers(prev => 
      prev.includes(value)
        ? prev.filter(member => member !== value)
        : [...prev, value]
    );
  };

  const handleNewPracticeChange = (e) => {
    const { name, value } = e.target;
    setNewPractice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePractice = async () => {
    try {
      // Validate required fields
      const requiredFields = ['practiceName', 'practiceDate', 'practiceTime', 'practiceLocation', 'duration', 'maxParticipants', 'description'];
      const missingFields = requiredFields.filter(field => !newPractice[field]);
      
      if (missingFields.length > 0) {
        Swal.fire({
          title: 'Missing Fields!',
          text: `Please fill in all required fields: ${missingFields.join(', ')}`,
          icon: 'warning',
          confirmButtonColor: '#F59E0B'
        });
        return;
      }

      // Validate field formats
      const validations = {
        duration: {
          isValid: (value) => !isNaN(value) && value > 0,
          message: 'Duration must be a positive number'
        },
        maxParticipants: {
          isValid: (value) => !isNaN(value) && value > 0,
          message: 'Max participants must be a positive number'
        },
        practiceDate: {
          isValid: (value) => new Date(value) > new Date(),
          message: 'Practice date must be in the future'
        }
      };

      for (const [field, validation] of Object.entries(validations)) {
        if (!validation.isValid(newPractice[field])) {
          Swal.fire({
            title: 'Invalid Field!',
            text: validation.message,
            icon: 'warning',
            confirmButtonColor: '#F59E0B'
          });
          return;
        }
      }

      console.log('Creating practice with data:', newPractice);
      const requestData = {
        ...newPractice,
        requestedBy: 'TeamManager'
      };
      console.log('Request data being sent:', requestData);

      const response = await axios.post('http://localhost:4000/api/practices', requestData);
      console.log('Practice request created:', response.data);
      
      setPractices(prev => [...prev, response.data]);
      setNewPractice({
        practiceName: '',
        practiceDate: '',
        practiceTime: '',
        practiceLocation: '',
        duration: '',
        maxParticipants: '',
        description: ''
      });
      
      await Swal.fire({
        title: 'Success!',
        text: 'Practice session created successfully!',
        icon: 'success',
        confirmButtonColor: '#4F46E5',
        timer: 3000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error creating practice:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to create practice session',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleAssignMembers = async () => {
    if (selectedPractice && selectedMembers.length > 0) {
      try {
        await axios.post('http://localhost:4000/api/practices/assign', {
          practiceID: selectedPractice,
          memberIDs: selectedMembers,
          assignedBy: assignedBy,
        });
        
        await Swal.fire({
          title: 'Success!',
          text: 'Members have been assigned successfully!',
          icon: 'success',
          confirmButtonColor: '#4F46E5',
          timer: 3000,
          timerProgressBar: true
        });

        const response = await axios.get(`http://localhost:4000/api/practices/${selectedPractice}/assignments`);
        setAssignedMembers(response.data);
        setSelectedMembers([]);
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to assign members',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      }
    } else {
      Swal.fire({
        title: 'Warning!',
        text: 'Please select a practice session and members to assign',
        icon: 'warning',
        confirmButtonColor: '#F59E0B'
      });
    }
  };

  const selectedPracticeDetails = practices.find(practice => practice._id === selectedPractice);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Create New Practice Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Create New Practice Session</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Practice Name</label>
            <input
              type="text"
              name="practiceName"
              value={newPractice.practiceName}
              onChange={handleNewPracticeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Date</label>
            <input
              type="date"
              name="practiceDate"
              value={newPractice.practiceDate}
              onChange={handleNewPracticeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Time</label>
            <input
              type="time"
              name="practiceTime"
              value={newPractice.practiceTime}
              onChange={handleNewPracticeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Location</label>
            <input
              type="text"
              name="practiceLocation"
              value={newPractice.practiceLocation}
              onChange={handleNewPracticeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={newPractice.duration}
              onChange={handleNewPracticeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Max Participants</label>
            <input
              type="number"
              name="maxParticipants"
              value={newPractice.maxParticipants}
              onChange={handleNewPracticeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600">Description</label>
            <textarea
              name="description"
              value={newPractice.description}
              onChange={handleNewPracticeChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <button
          onClick={handleCreatePractice}
          className="mt-4 w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Create Practice Session
        </button>
      </div>

      {/* Assign Members Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Assign Members to Practice</h2>
          <Link
            to="/team/practice-requests"
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Bell className="h-5 w-5 mr-2" />
            View Practice Requests
          </Link>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Select Practice:</label>
          <select
            value={selectedPractice}
            onChange={handlePracticeChange}
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Practice</option>
            {practices.map(practice => (
              <option key={practice._id} value={practice._id}>
                {practice.practiceName}
              </option>
            ))}
          </select>
        </div>

        {selectedPractice && !loading && (
          <div>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Practice Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Date: {new Date(selectedPracticeDetails?.practiceDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Time: {selectedPracticeDetails?.practiceTime}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>Location: {selectedPracticeDetails?.practiceLocation}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span>Max Participants: {selectedPracticeDetails?.maxParticipants}</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-medium text-gray-700 mb-4">Select Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableMembers.length > 0 ? (
                availableMembers.map((member) => (
                  <div key={member._id} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      value={member._id}
                      checked={selectedMembers.includes(member._id)}
                      onChange={handleMemberSelection}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="text-gray-600 cursor-pointer">{member.fullName}</label>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full">No members available for this practice session.</p>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        <button
          onClick={handleAssignMembers}
          className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
        >
          Assign Members
        </button>
      </div>
    </div>
  );
};

export default PracticeAssign; 