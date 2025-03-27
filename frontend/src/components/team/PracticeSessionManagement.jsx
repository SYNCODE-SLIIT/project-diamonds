import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  PlusCircle, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

const PracticeSessionManagement = () => {
  const [sessionDate, setSessionDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [sessionMessage, setSessionMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [assignMessage, setAssignMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSession = async () => {
    // Validate inputs
    if (!sessionDate || !location) {
      setSessionMessage('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setSessionMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/admin/practice-sessions/create', {
        sessionDate,
        location,
        description
      });
      
      setSessionMessage(res.data.message);
      // Clear inputs after successful creation
      setSessionDate('');
      setLocation('');
      setDescription('');
    } catch (error) {
      setSessionMessage('Error creating practice session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignMember = async () => {
    // Validate inputs
    if (!sessionId || !memberId) {
      setAssignMessage('Please enter both Session ID and Member ID');
      return;
    }

    setIsLoading(true);
    setAssignMessage('');

    try {
      const res = await axios.post('http://localhost:4000/api/admin/practice-sessions/assign', {
        sessionId,
        memberId
      });
      
      setAssignMessage(res.data.message);
      // Clear inputs after successful assignment
      setSessionId('');
      setMemberId('');
    } catch (error) {
      setAssignMessage('Error assigning member to session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6">
      {/* Create Practice Session Section */}
      <div className="border-b pb-6">
        <div className="flex items-center mb-4">
          <Calendar className="mr-3 text-blue-600" size={32} />
          <h3 className="text-2xl font-bold text-gray-800">Create Practice Session</h3>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="text-gray-400" size={20} />
            </div>
            <input
              type="datetime-local"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />

          <button 
            onClick={handleCreateSession}
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-2 rounded-md text-white font-semibold transition-colors duration-300 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            <PlusCircle className="mr-2" size={20} />
            {isLoading ? 'Creating...' : 'Create Session'}
          </button>

          {sessionMessage && (
            <div className={`flex items-center p-3 rounded-md ${
              sessionMessage.includes('Error') 
                ? 'bg-red-50 text-red-600' 
                : 'bg-green-50 text-green-600'
            }`}>
              {sessionMessage.includes('Error') ? (
                <AlertTriangle className="mr-2" size={20} />
              ) : (
                <CheckCircle className="mr-2" size={20} />
              )}
              <p className="text-sm">{sessionMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Assign Member Section */}
      <div>
        <div className="flex items-center mb-4">
          <Users className="mr-3 text-green-600" size={32} />
          <h3 className="text-2xl font-bold text-gray-800">Assign Member to Session</h3>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Session ID"
              value={sessionId}
              onChange={e => setSessionId(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Member ID"
              value={memberId}
              onChange={e => setMemberId(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            onClick={handleAssignMember}
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-2 rounded-md text-white font-semibold transition-colors duration-300 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
            }`}
          >
            <Users className="mr-2" size={20} />
            {isLoading ? 'Assigning...' : 'Assign Member'}
          </button>

          {assignMessage && (
            <div className={`flex items-center p-3 rounded-md ${
              assignMessage.includes('Error') 
                ? 'bg-red-50 text-red-600' 
                : 'bg-green-50 text-green-600'
            }`}>
              {assignMessage.includes('Error') ? (
                <AlertTriangle className="mr-2" size={20} />
              ) : (
                <CheckCircle className="mr-2" size={20} />
              )}
              <p className="text-sm">{assignMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeSessionManagement;