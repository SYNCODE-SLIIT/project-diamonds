import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { Bell, Users, Calendar, MapPin } from 'lucide-react';

const EventAssign = () => {
  const [events, setEvents] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [assignedBy, setAssignedBy] = useState('TeamManager');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, membersResponse] = await Promise.all([
          axios.get('http://localhost:4000/api/events/approved'),
          axios.get('http://localhost:4000/api/member-applications/approved')
        ]);
        setEvents(eventsResponse.data);
        setAllMembers(membersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      setLoading(true);
      axios.get(`http://localhost:4000/api/assignments/${selectedEvent}/assignments`)
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
  }, [selectedEvent]);

  const availableMembers = allMembers.filter(mem => {
    if (!mem || !mem._id) return false;
    return !assignedMembers.some(amem => 
      amem && amem.memberID && amem.memberID._id === mem._id
    );
  });

  const handleEventChange = (event) => {
    setSelectedEvent(event.target.value);
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

  const handleAssignMembers = async () => {
    if (selectedEvent && selectedMembers.length > 0) {
      try {
        await axios.post('http://localhost:4000/api/assignments/assign', {
          eventID: selectedEvent,
          memberIDs: selectedMembers,
          assignedBy: assignedBy,
        });
        
        await Swal.fire({
          title: 'Success!',
          text: 'Members have been assigned successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#4F46E5',
          timer: 3000,
          timerProgressBar: true,
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });

        const response = await axios.get(`http://localhost:4000/api/assignments/${selectedEvent}/assignments`);
        setAssignedMembers(response.data);
        setSelectedMembers([]);
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to assign members. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#EF4444'
        });
        console.error('Error assigning members:', error);
      }
    } else {
      Swal.fire({
        title: 'Warning!',
        text: 'Please select an event and members to assign.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#F59E0B'
      });
    }
  };

  const selectedEventDetails = events.find(event => event._id === selectedEvent);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Assign Members to Event</h2>
        <Link
          to="/team/assignment-requests"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Bell className="h-5 w-5 mr-2" />
          View Assignment Requests
        </Link>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600">Select Event:</label>
        <select
          value={selectedEvent}
          onChange={handleEventChange}
          className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select Event</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>
              {event.eventName}
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && !loading && (
        <div>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Date: {new Date(selectedEventDetails?.eventDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Location: {selectedEventDetails?.eventLocation}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2" />
                <span>Guest Count: {selectedEventDetails?.guestCount}</span>
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
              <p className="text-gray-500 col-span-full">No members available for this event.</p>
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
  );
};

export default EventAssign;