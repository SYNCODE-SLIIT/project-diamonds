import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
import assets from '../../assets/assets.js';

const MyEvents = () => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`api/admin/events/organizer/${user._id}`);
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
                          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.loginCover})` }}
          
    >
      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-8 max-w-7xl w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">My Events</h2>

        {events.length === 0 ? (
          <p className="text-center text-gray-500">No events found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event._id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{event.eventName}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Location:</strong> {event.eventLocation}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Guests:</strong> {event.guestCount}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> <span className="capitalize font-medium">{event.status}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;