import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { Bell, Users, Calendar, MapPin, Clock, List, PlusCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { UserContext } from '../../context/userContext';

const PracticeAssign = () => {
  const [practices, setPractices] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [selectedPractice, setSelectedPractice] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [assignedBy, setAssignedBy] = useState('TeamManager');
  const [loading, setLoading] = useState(false);
  const [practiceAssignments, setPracticeAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [activeView, setActiveView] = useState('display'); // 'display' or 'form'
  const [newPractice, setNewPractice] = useState({
    practiceName: '',
    practiceDate: '',
    practiceTime: '',
    practiceLocation: '',
    duration: '',
    maxParticipants: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const { user } = useContext(UserContext);

  // Fetch practices, members, and assignments on component mount
  const fetchData = async () => {
    try {
      setAssignmentsLoading(true);
      const [practicesResponse, membersResponse, assignmentsResponse] = await Promise.all([
        axios.get('http://localhost:4000/api/practices'),
        axios.get('http://localhost:4000/api/member-applications/approved'),
        axios.get('http://localhost:4000/api/practices/assignments')
      ]);
      setPractices(practicesResponse.data);
      setAllMembers(membersResponse.data);
      setPracticeAssignments(assignmentsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to fetch practice assignments',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
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
    
    // Input sanitization and validation
    let sanitizedValue = value;
    
    switch (name) {
      case 'practiceName':
        // Remove special characters except spaces and basic punctuation
        sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_.,]/g, '');
        break;
      
      case 'duration':
      case 'maxParticipants':
        // Only allow positive numbers
        sanitizedValue = value.replace(/[^0-9]/g, '');
        break;
      
      case 'practiceLocation':
        // Allow alphanumeric characters, spaces, and basic punctuation
        sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_.,#]/g, '');
        break;
      
      case 'description':
        // Allow alphanumeric characters, spaces, and basic punctuation
        sanitizedValue = value.replace(/[^a-zA-Z0-9\s\-_.,!?]/g, '');
        break;
      
      default:
        sanitizedValue = value;
    }

    setNewPractice(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const selectedDate = new Date(newPractice.practiceDate);
    selectedDate.setHours(0, 0, 0, 0); // Reset time to start of day

    // Practice Name validation
    if (!newPractice.practiceName.trim()) {
      newErrors.practiceName = 'Practice name is required';
    } else if (newPractice.practiceName.length < 3) {
      newErrors.practiceName = 'Practice name must be at least 3 characters';
    } else if (newPractice.practiceName.length > 100) {
      newErrors.practiceName = 'Practice name must be less than 100 characters';
    }

    // Date validation
    if (!newPractice.practiceDate) {
      newErrors.practiceDate = 'Practice date is required';
    } else if (isNaN(selectedDate.getTime())) {
      newErrors.practiceDate = 'Invalid date format';
    } else if (selectedDate < today) {
      newErrors.practiceDate = 'Practice date must be today or a future date';
    }

    // Time validation
    if (!newPractice.practiceTime) {
      newErrors.practiceTime = 'Practice time is required';
    } else {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(newPractice.practiceTime)) {
        newErrors.practiceTime = 'Invalid time format (HH:MM)';
      } else if (selectedDate.getTime() === today.getTime()) {
        // If date is today, check if time is in the future
        const [hours, minutes] = newPractice.practiceTime.split(':').map(Number);
        const selectedTime = new Date();
        selectedTime.setHours(hours, minutes, 0, 0);
        const currentTime = new Date();
        if (selectedTime <= currentTime) {
          newErrors.practiceTime = 'Practice time must be in the future';
        }
      }
    }

    // Location validation
    if (!newPractice.practiceLocation.trim()) {
      newErrors.practiceLocation = 'Practice location is required';
    } else if (newPractice.practiceLocation.length < 5) {
      newErrors.practiceLocation = 'Location must be at least 5 characters';
    } else if (newPractice.practiceLocation.length > 200) {
      newErrors.practiceLocation = 'Location must be less than 200 characters';
    }

    // Duration validation
    if (!newPractice.duration) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(newPractice.duration)) {
      newErrors.duration = 'Duration must be a number';
    } else if (newPractice.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    } else if (newPractice.duration > 480) {
      newErrors.duration = 'Duration cannot exceed 8 hours (480 minutes)';
    }

    // Max Participants validation
    if (!newPractice.maxParticipants) {
      newErrors.maxParticipants = 'Max participants is required';
    } else if (isNaN(newPractice.maxParticipants)) {
      newErrors.maxParticipants = 'Max participants must be a number';
    } else if (newPractice.maxParticipants <= 0) {
      newErrors.maxParticipants = 'Max participants must be greater than 0';
    } else if (newPractice.maxParticipants > 100) {
      newErrors.maxParticipants = 'Max participants cannot exceed 100';
    }

    // Description validation
    if (!newPractice.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (newPractice.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (newPractice.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePractice = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const requestData = {
        ...newPractice,
        requestedBy: 'TeamManager'
      };

      const response = await axios.post('http://localhost:4000/api/practices', requestData);
      
      if (response.data) {
        toast.success('Practice session created successfully!');
        setNewPractice({
          practiceName: '',
          practiceDate: '',
          practiceTime: '',
          practiceLocation: '',
          duration: '',
          maxParticipants: '',
          description: ''
        });
        setErrors({});
        fetchPractices();
      }
    } catch (error) {
      console.error('Error creating practice:', error);
      toast.error(error.response?.data?.message || 'Failed to create practice session');
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

  // Helper function to render member status badges
  const renderMemberStatus = (member) => (
    <div key={member._id} className="flex items-center space-x-2 mb-2">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
          {member.member?.fullName?.charAt(0) || '?'}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {member.member?.fullName || 'N/A'}
        </p>
      </div>
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        member.status === 'accepted' ? 'bg-green-100 text-green-800' :
        member.status === 'rejected' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {member.status || 'pending'}
      </span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* View Toggle Buttons */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white shadow-sm">
          <button
            onClick={() => setActiveView('display')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeView === 'display'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            View Practices
          </button>
          <button
            onClick={() => setActiveView('form')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeView === 'form'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Practice
          </button>
        </div>
      </div>

      {activeView === 'display' ? (
        // Practice Assignments Overview Section
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                <List className="mr-3 text-indigo-600" size={32} />
                Practice Assignments Overview
              </h2>
              <p className="mt-2 text-gray-600">View and manage all practice sessions and their assigned members</p>
            </div>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Refresh Data
            </button>
          </div>

          {assignmentsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {!practiceAssignments || practiceAssignments.length === 0 ? (
                <div className="col-span-full bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <List size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Practice Assignments</h3>
                  <p className="text-gray-500">There are no practice assignments to display at the moment.</p>
                </div>
              ) : (
                practiceAssignments.map((practice) => (
                  <div key={practice._id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800 truncate">
                          {practice.practiceName || 'Unnamed Practice'}
                        </h3>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                          {practice.assignedMembers?.length || 0} Members
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                          <span>{practice.practiceDate ? new Date(practice.practiceDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                          <span>{practice.practiceTime || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-5 w-5 mr-2 text-indigo-500" />
                          <span>{practice.practiceLocation || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Assigned Members</h4>
                        <div className="space-y-2">
                          {practice.assignedMembers && practice.assignedMembers.length > 0 ? (
                            practice.assignedMembers.map(member => renderMemberStatus(member))
                          ) : (
                            <p className="text-sm text-gray-500 italic">No members assigned yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        // Create New Practice Section
        <div className="space-y-8">
          {/* Create Practice Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                <PlusCircle className="mr-3 text-indigo-600" size={32} />
                Create New Practice Session
              </h2>
              <p className="mt-2 text-gray-600">Fill in the details below to create a new practice session</p>
            </div>

            <form onSubmit={handleCreatePractice} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Practice Name</label>
                  <input
                    type="text"
                    name="practiceName"
                    value={newPractice.practiceName}
                    onChange={handleNewPracticeChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.practiceName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter practice name"
                  />
                  {errors.practiceName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.practiceName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="practiceDate"
                    value={newPractice.practiceDate}
                    onChange={handleNewPracticeChange}
                    min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.practiceDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.practiceDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.practiceDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    name="practiceTime"
                    value={newPractice.practiceTime}
                    onChange={handleNewPracticeChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.practiceTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.practiceTime && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.practiceTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="practiceLocation"
                    value={newPractice.practiceLocation}
                    onChange={handleNewPracticeChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.practiceLocation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter practice location"
                  />
                  {errors.practiceLocation && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.practiceLocation}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={newPractice.duration}
                    onChange={handleNewPracticeChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter duration"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.duration}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={newPractice.maxParticipants}
                    onChange={handleNewPracticeChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter max participants"
                  />
                  {errors.maxParticipants && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.maxParticipants}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={newPractice.description}
                    onChange={handleNewPracticeChange}
                    rows="4"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter practice description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Create Practice Session
                </button>
              </div>
            </form>
          </div>

          {/* Assign Members Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Users className="mr-3 text-indigo-600" size={28} />
                  Assign Members to Practice
                </h2>
                <p className="mt-2 text-gray-600">Select members to assign to the practice session</p>
              </div>
              <Link
                to="/team/practice-requests"
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Bell className="h-5 w-5 mr-2" />
                View Practice Requests
              </Link>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Practice:</label>
              <select
                value={selectedPractice}
                onChange={handlePracticeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            )}

            <button
              onClick={handleAssignMembers}
              className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Assign Members
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeAssign; 