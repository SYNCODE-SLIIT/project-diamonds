import React, { useState } from 'react';
import { UserPlus, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

const EventAssignment = () => {
  const [eventId, setEventId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAssign = async () => {
    // Basic validation
    if (!eventId || !memberId) {
      setMessage('Please enter both Event ID and Member ID');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:4000/api/admin/events/assign', {
        eventId,
        memberId
      });
      
      setMessage(res.data.message);
      // Clear inputs after successful assignment
      setEventId('');
      setMemberId('');
    } catch (error) {
      setMessage('Error assigning member to event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl">
      <div className="flex items-center mb-6">
        <UserPlus className="mr-3 text-blue-600" size={32} />
        <h3 className="text-2xl font-bold text-gray-800">Assign Member to Event</h3>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Event ID"
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserPlus className="text-gray-400" size={20} />
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
          onClick={handleAssign}
          disabled={isLoading}
          className={`w-full py-2 rounded-md text-white font-semibold transition-colors duration-300 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isLoading ? 'Assigning...' : 'Assign Member'}
        </button>

        {message && (
          <div className={`flex items-center p-3 rounded-md ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-600' 
              : 'bg-green-50 text-green-600'
          }`}>
            {message.includes('Error') ? (
              <AlertTriangle className="mr-2" size={20} />
            ) : (
              <CheckCircle className="mr-2" size={20} />
            )}
            <p className="text-sm">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAssignment;