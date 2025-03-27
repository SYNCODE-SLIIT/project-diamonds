import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import axios from 'axios';
import { EyeIcon } from 'lucide-react';

import assets from '../../assets/assets.js';
import EventDetailsModal from './EventDetailsModal.jsx'; // You need to create this

const MyEvents = () => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);


  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/admin/events/organizer/${user._id}`);
        setEvents(res.data);
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    };
    if (user?._id) fetch();
  }, [user]);

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.loginCover})`
      }}
    >
      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-8 max-w-7xl w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">My Events</h2>

        {events.length === 0 ? (
          <p className="text-center text-gray-500">No events found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div
                key={event._id}
                className="bg-white rounded-lg p-6 border border-gray-300 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{event.eventName}</h3>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-1"><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600 mb-1"><strong>Location:</strong> {event.eventLocation}</p>
                <p className="text-sm text-gray-600 mb-1"><strong>Guests:</strong> {event.guestCount}</p>
                <p className="text-sm text-gray-600"><strong>Status:</strong> <span className="capitalize font-medium">{event.status}</span></p>
                
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default MyEvents;