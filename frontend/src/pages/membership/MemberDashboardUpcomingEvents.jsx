import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance.js';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { UserContext } from '../../context/userContext';

const MemberDashboardUpcomingEvents = () => {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext); // Use context to get current user
  
  useEffect(() => {
    if (user) {
      fetchApprovedEvents();
    }
  }, [user]);

  const fetchApprovedEvents = async () => {
    try {
      // Fetch only approved events from backend
      const response = await axiosInstance.get('/api/assignments/approved');
      // Only show events for this member
      const memberApproved = response.data.filter(req => String(req.member?._id) === String(user.profileId));
      setApprovedEvents(memberApproved);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching approved events:', error);
      toast.error('Failed to load upcoming events.');
      setApprovedEvents([]);
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch (err) {
      return dateString || 'Date not specified';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Upcoming Events</h1>
      
      {approvedEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <Calendar className="w-12 h-12 mx-auto text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Upcoming Events</h2>
          <p className="text-gray-500">You don't have any confirmed events scheduled at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {approvedEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-green-500"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {event.event?.eventName || 'Event'}
              </h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-green-600" />
                  <span>
                    {formatDate(event.event?.eventDate)}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-green-600" />
                  <span>
                    {event.event?.eventTime || 'Time not specified'}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-green-600" />
                  <span>
                    {event.event?.eventLocation || 'Location not specified'}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-green-600" />
                  <span>
                    Guests: {event.event?.guestCount || 'Not specified'}
                  </span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Confirmed
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberDashboardUpcomingEvents;