import React, { useEffect, useState, useContext } from 'react';
import { EyeIcon, Search, Filter, Calendar, MapPin, Users, Clock, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchAllEvents } from '../../services/eventService';
import { UserContext } from '../../context/userContext';

const EventsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    status: 'all',
    dateRange: 'all',
    eventType: 'all'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetchAllEvents();
      setEvents(res);
      setFilteredEvents(res);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort events whenever the filter criteria or events change
  useEffect(() => {
    if (!events.length) return;

    let result = [...events];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(event => 
        (event.eventName?.toLowerCase().includes(search)) || 
        (event.eventDescription?.toLowerCase().includes(search)) ||
        (event.eventLocation?.toLowerCase().includes(search))
      );
    }
    
    // Apply status filter
    if (filterOptions.status !== 'all') {
      result = result.filter(event => event.status === filterOptions.status);
    }
    
    // Apply date range filter
    const now = new Date();
    if (filterOptions.dateRange !== 'all') {
      result = result.filter(event => {
        const eventDate = new Date(event.eventDate);
        switch (filterOptions.dateRange) {
          case 'upcoming':
            return eventDate > now;
          case 'past':
            return eventDate < now;
          case 'today':
            return eventDate.toDateString() === now.toDateString();
          default:
            return true;
        }
      });
    }
    
    // Apply event type filter
    if (filterOptions.eventType !== 'all') {
      result = result.filter(event => event.eventType === filterOptions.eventType);
    }
    
    setFilteredEvents(result);
  }, [searchTerm, filterOptions, events]);

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'confirmed': { bg: 'bg-green-100', text: 'text-green-700' },
      'change-requested': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-700' },
      'pending': { bg: 'bg-blue-100', text: 'text-blue-700' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`text-sm font-medium px-3 py-1 rounded-full capitalize z-10 ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  const handleViewDetails = (eventId, e) => {
    e.stopPropagation();
    
    // We're in the admin side, so always navigate to admin events
    navigate(`/admin/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Events Dashboard</h1>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterOptions.status}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, status: e.target.value }))}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="change-requested">Change Requested</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={filterOptions.dateRange}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, dateRange: e.target.value }))}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="today">Today</option>
            </select>

            {/* Event Type Filter */}
            <select
              value={filterOptions.eventType}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, eventType: e.target.value }))}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="wedding">Wedding</option>
              <option value="corporate">Corporate</option>
              <option value="birthday">Birthday</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map(event => (
            <div
              key={event._id}
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden cursor-pointer"
              onClick={() => handleViewDetails(event._id, { stopPropagation: () => {} })}
            >
              {/* Status Indicator */}
              <div className={`absolute top-0 right-0 w-20 h-20 ${
                event.status === 'confirmed' 
                  ? 'bg-green-500' 
                  : event.status === 'change-requested'
                  ? 'bg-yellow-500'
                  : event.status === 'cancelled'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              } transform rotate-45 translate-x-8 -translate-y-8`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {event.eventName}
                </h3>
                <StatusBadge status={event.status} />
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                  <p><strong>Location:</strong> {event.eventLocation}</p>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-purple-500" />
                  <p><strong>Guests:</strong> {event.guestCount}</p>
                </div>

                {event.eventType && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <p><strong>Type:</strong> <span className="capitalize">{event.eventType}</span></p>
                  </div>
                )}
              </div>

              {event.remarks && (
                <div className="flex items-start bg-gray-50 p-3 rounded-lg mb-4">
                  <MessageSquare className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                  <p className="text-gray-500 italic text-sm line-clamp-2">
                    "{event.remarks}"
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-3">
                <button 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                  onClick={(e) => handleViewDetails(event._id, e)}
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsDashboard;