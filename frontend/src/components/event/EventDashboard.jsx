import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import assets from '../../assets/assets.js';

// Create a date utility function at the top of the file
const getDateWithoutTime = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

// Event Card Component - Redesigned to match the image layout
const EventCard = ({ event }) => {
  const date = new Date(event.eventDate);
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = date.getDate();

  // Dynamically determine completion status based on date
  const today = getDateWithoutTime(new Date());
  const eventDate = getDateWithoutTime(date);
  const completionStatus = eventDate < today ? 'completed' : 'upcoming';
  
  // Format time for display
  const formatTime = (timeObj) => {
    if (!timeObj) return 'Time not specified';
    
    // Check if we have new date-time format
    if (timeObj.startDate && timeObj.endDate) {
      const startDate = new Date(timeObj.startDate);
      const endDate = new Date(timeObj.endDate);
      
      // Format function
      const formatDateTime = (date) => {
        const options = { 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        };
        return date.toLocaleString('en-US', options);
      };
      
      // Check if dates are the same, only show time for end date if same day
      const sameDay = startDate.toDateString() === endDate.toDateString();
      
      if (sameDay) {
        return `${formatDateTime(startDate)} - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      } else {
        return `${formatDateTime(startDate)} - ${formatDateTime(endDate)}`;
      }
    }
    
    // Legacy format fallback
    return `${timeObj.start || '00:00'} - ${timeObj.end || '00:00'}`;
  };
  
  // Set badge color based on status
  const getBadgeColor = () => {
    if (event.status === 'cancelled') return 'bg-red-500 text-white';
    if (event.status === 'change-requested') return 'bg-yellow-500 text-white';
    if (completionStatus === 'completed') return 'bg-blue-500 text-white';
    return 'bg-green-500 text-white';
  };
  
  // Get status text
  const getStatusText = () => {
    if (event.status === 'cancelled') return 'Cancelled';
    if (event.status === 'change-requested') return 'Change Requested';
    return completionStatus.charAt(0).toUpperCase() + completionStatus.slice(1);
  };

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="flex flex-col md:flex-row h-full">
        {/* Left side - Date box and event image */}
        <div className="relative md:w-1/3 lg:w-1/4">
          {/* Status badge */}
          <div className={`absolute top-0 left-0 ${getBadgeColor()} py-1 px-3 rounded-br-lg z-10 m-2`}>
            {getStatusText()}
          </div>
          
          {/* Date box */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-bl-lg shadow flex flex-col items-center justify-center m-2 z-10">
            <span className="text-xs font-bold text-red-500">{month}</span>
            <span className="text-xl font-bold text-gray-800">{day}</span>
          </div>
          
          {/* Image */}
          <img
            className="w-full h-full object-cover"
            src={assets.event_banner}
            alt={event.eventName}
          />
        </div>
        
        {/* Right side - Event details */}
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-2xl font-bold text-gray-800">{event.eventName}</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${event.eventType === 'public' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                {event.eventType === 'public' ? 'Public Event' : 'Private Event'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-700 font-medium">{event.eventLocation}</p>
              </div>
              
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 font-medium">
                  {event.eventTime ? formatTime(event.eventTime) : `${date.getHours()}:00 - ${date.getHours() + 2}:00`}
                </p>
              </div>
              
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-700 font-medium">{event.guestCount} guests</p>
              </div>
              
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-gray-700 font-medium">{event.packageID?.packageName || 'Unknown Package'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">{event._id}</p>
            
            <Link 
              to={`/event-dashboard/${event._id}`} 
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
            >
              View Details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toggle Tabs Component
const ToggleTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => setActiveTab('events')}
        className={`px-8 py-4 rounded-full text-base font-medium transition-all ${
          activeTab === 'events'
            ? 'bg-white text-gray-800 shadow-lg'
            : 'bg-transparent text-white hover:bg-white hover:bg-opacity-20'
        }`}
      >
        My Events
      </button>
      <button
        onClick={() => setActiveTab('analytics')}
        className={`px-8 py-4 rounded-full text-base font-medium transition-all ${
          activeTab === 'analytics'
            ? 'bg-white text-gray-800 shadow-lg'
            : 'bg-transparent text-white hover:bg-white hover:bg-opacity-20'
        }`}
      >
        Analytics
      </button>
    </div>
  );
};

// Search and Filter Component
const SearchAndFilter = ({ searchTerm, setSearchTerm, filterOptions, setFilterOptions, sortOption, setSortOption }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Search */}
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pl-10 bg-gray-50"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter by Event Type */}
        <div className="min-w-[150px]">
          <select
            value={filterOptions.eventType || 'all'}
            onChange={(e) => setFilterOptions({...filterOptions, eventType: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-gray-50"
          >
            <option value="all">All Types</option>
            <option value="public">Public Events</option>
            <option value="private">Private Events</option>
          </select>
        </div>

        {/* Filter by Completion Status */}
        <div className="min-w-[150px]">
          <select
            value={filterOptions.completionStatus}
            onChange={(e) => setFilterOptions({...filterOptions, completionStatus: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-gray-50"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="change-requested">Change Requested</option>
          </select>
        </div>

        {/* Filter by Date Range */}
        <div className="min-w-[150px]">
          <select
            value={filterOptions.dateRange}
            onChange={(e) => setFilterOptions({...filterOptions, dateRange: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-gray-50"
          >
            <option value="all">All Dates</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="next3Months">Next 3 Months</option>
            <option value="past">Past Events</option>
          </select>
        </div>
        
        {/* Sort Order */}
        <div className="min-w-[180px]">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-gray-50"
          >
            <option value="dateAsc">Date (Upcoming First)</option>
            <option value="dateDesc">Date (Recent First)</option>
            <option value="nameAsc">Name (A-Z)</option>
            <option value="nameDesc">Name (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Main EventDashboard Component
const EventDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    completionStatus: 'all',
    dateRange: 'all',
    eventType: 'all'
  });
  const [sortOption, setSortOption] = useState('dateAsc');

  // Helper function to consistently check if an event is upcoming or completed
  const isUpcomingEvent = (event) => {
    const eventDate = getDateWithoutTime(event.eventDate);
    const today = getDateWithoutTime(new Date());
    // Events on today's date are considered upcoming
    return eventDate >= today && event.status !== 'cancelled';
  };

  const isCompletedEvent = (event) => {
    const eventDate = getDateWithoutTime(event.eventDate);
    const today = getDateWithoutTime(new Date());
    // Events before today are considered completed
    return eventDate < today && event.status !== 'cancelled';
  };

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user?._id) return;
      
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/admin/events/organizer/${user._id}`);
        setEvents(res.data);
        setFilteredEvents(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [user]);

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
    
    // Apply completion status filter
    if (filterOptions.completionStatus !== 'all') {
      if (filterOptions.completionStatus === 'upcoming') {
        result = result.filter(isUpcomingEvent);
      } else if (filterOptions.completionStatus === 'completed') {
        result = result.filter(isCompletedEvent);
      } else if (filterOptions.completionStatus === 'cancelled') {
        result = result.filter(event => event.status === 'cancelled');
      } else if (filterOptions.completionStatus === 'change-requested') {
        result = result.filter(event => event.status === 'change-requested');
      }
    }
    
    // Apply event type filter
    if (filterOptions.eventType !== 'all') {
      result = result.filter(event => event.eventType === filterOptions.eventType);
    }
    
    // Apply date range filter
    if (filterOptions.dateRange !== 'all') {
      const today = getDateWithoutTime(new Date());
      
      switch (filterOptions.dateRange) {
        case 'thisWeek': {
          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + 7);
          result = result.filter(event => {
            const eventDate = getDateWithoutTime(event.eventDate);
            return eventDate >= today && eventDate <= endOfWeek;
          });
          break;
        }
        case 'thisMonth': {
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          result = result.filter(event => {
            const eventDate = getDateWithoutTime(event.eventDate);
            return eventDate >= today && eventDate <= endOfMonth;
          });
          break;
        }
        case 'next3Months': {
          const threeMonthsLater = new Date(today);
          threeMonthsLater.setMonth(today.getMonth() + 3);
          result = result.filter(event => {
            const eventDate = getDateWithoutTime(event.eventDate);
            return eventDate >= today && eventDate <= threeMonthsLater;
          });
          break;
        }
        case 'past': {
          result = result.filter(event => {
            const eventDate = getDateWithoutTime(event.eventDate);
            return eventDate < today;
          });
          break;
        }
        default:
          break;
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'dateAsc':
          return new Date(a.eventDate) - new Date(b.eventDate);
        case 'dateDesc':
          return new Date(b.eventDate) - new Date(a.eventDate);
        case 'nameAsc':
          return a.eventName?.localeCompare(b.eventName || '');
        case 'nameDesc':
          return b.eventName?.localeCompare(a.eventName || '');
        default:
          return 0;
      }
    });
    
    setFilteredEvents(result);
  }, [events, searchTerm, filterOptions, sortOption]);

  // Check if event_booking exists in the assets
  console.log("Event booking image:", assets.event_booking);

  return (
    <div className="min-h-screen relative">
      {/* Background image covering entire screen */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${assets.event_booking})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Main content container */}
      <div className="relative z-10 min-h-screen">
        {/* Header Section */}
        <div className="container mx-auto px-4 pt-32 pb-10 max-w-[80%]">
          <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="inline-flex items-center px-4 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Events Manager</span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-3">Your Events</h1>
              <p className="text-gray-200 text-xl max-w-xl">Manage, monitor, and review your personal event activity all in one place.</p>
            </div>
          </div>
          
          {/* Toggle Buttons */}
          <ToggleTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        {/* Content Section */}
        <div className="container mx-auto px-0 py-6 max-w-[80%]">
          <div className="bg-gray-100 bg-opacity-95 rounded-xl p-8 shadow-xl">
            {/* Events Section */}
            {activeTab === 'events' && (
              <div>
                {/* Event Summary Stats */}
                {!loading && !error && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
                      <div>
                        <p className="text-gray-600 font-medium">Upcoming Events</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">
                          {events.filter(isUpcomingEvent).length}
                        </p>
                      </div>
                      <div className="p-4 bg-green-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
                      <div>
                        <p className="text-gray-600 font-medium">Completed Events</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">
                          {events.filter(isCompletedEvent).length}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
                      <div>
                        <p className="text-gray-600 font-medium">Public Events</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">
                          {events.filter(event => event.eventType === 'public').length}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
                      <div>
                        <p className="text-gray-600 font-medium">Total Guests</p>
                        <p className="text-4xl font-bold text-gray-900 mt-2">
                          {events.reduce((sum, event) => sum + (event.guestCount || 0), 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-amber-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              
                {/* Search and Filter Bar */}
                <SearchAndFilter 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterOptions={filterOptions}
                  setFilterOptions={setFilterOptions}
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                />

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="space-y-4">
                    {filteredEvents.map(event => (
                      <EventCard key={event._id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500 text-lg">
                      {searchTerm || filterOptions.completionStatus !== 'all' || filterOptions.dateRange !== 'all' 
                        ? 'No events match your search criteria.' 
                        : 'No events found.'}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Analytics Section (placeholder for future) */}
            {activeTab === 'analytics' && (
              <div className="bg-white p-8 rounded-lg shadow-md">
                <p className="text-gray-500 text-center text-lg">Analytics feature coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDashboard; 