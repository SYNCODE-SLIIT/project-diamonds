import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import { EyeIcon } from 'lucide-react';
import { fetchAllEvents } from '../../services/eventService'; // update import

const EventsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetchAllEvents();
      console.log('Fetched Events:', res);
      setEvents(res);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    const now = new Date();

    const filtered = events.filter(event => {
      if (filter === 'ongoing') {
        return new Date(event.eventDate) >= now && event.status === 'confirmed';
      }
      if (filter === 'completed') {
        return new Date(event.eventDate) < now;
      }
      if (filter === 'change-requested') {
        return event.status === 'change-requested';
      }
      return true;
    });

    setFilteredEvents(filtered);
  }, [filter, events]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Approved Events</h2>

      <div className="mb-4 space-x-2">
        {['all', 'ongoing', 'completed', 'change-requested'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded ${
              filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map(event => (
          <div key={event._id} className="border rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold">{event.eventName}</h3>
            <p className="text-sm text-gray-600">Date: {new Date(event.eventDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Location: {event.eventLocation}</p>
            <p className="text-sm text-gray-600">Guests: {event.guestCount}</p>
            <p className="text-sm text-gray-600">Status: 
              <span className={`font-semibold ml-1 ${
                event.status === 'change-requested' ? 'text-yellow-500' :
                event.status === 'cancelled' ? 'text-red-500' : 'text-green-600'
              }`}>
                {event.status}
              </span>
            </p>
            <button className="mt-3 flex items-center gap-2 text-blue-600 hover:underline">
              <EyeIcon className="w-4 h-4" /> View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsDashboard;