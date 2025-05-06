import React, { useEffect, useState, useContext } from 'react';
import {
  fetchRequestsByOrganizer,
  deleteRequest
} from '../../services/eventRequestService';
import { UserContext } from '../../context/userContext';
import assets from '../../assets/assets.js';
import EditEventRequestModal from './EditEventRequestModal';
import { Calendar, CheckCircle, Clock, FileCheck, Search, Filter, Calendar as CalendarIcon, MapPin, Users, MessageSquare } from 'lucide-react';

const OrganizerEventRequests = () => {
  const { user } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const organizerID = user?._id;

  const fetchData = async () => {
    try {
      const data = await fetchRequestsByOrganizer(organizerID);
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizerID) {
      fetchData();
    }
  }, [organizerID]);

  const handleEdit = (request) => {
    setRequestToEdit(request);
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await deleteRequest(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting request:', err);
        alert('Failed to delete request');
      }
    }
  };

  // Apply all filters (status, search, date)
  const filteredRequests = requests.filter(req => {
    // Status filter
    if (filter !== 'all' && req.status !== filter) return false;
    
    // Search filter (case insensitive)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        req.eventName?.toLowerCase().includes(term) ||
        req.eventLocation?.toLowerCase().includes(term) ||
        req.remarks?.toLowerCase().includes(term);
      
      if (!matchesSearch) return false;
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const eventDate = new Date(req.eventDate);
      const currentDate = new Date();
      
      if (dateFilter === 'day') {
        return eventDate.toDateString() === currentDate.toDateString();
      } else if (dateFilter === 'month') {
        return (
          eventDate.getMonth() === currentDate.getMonth() && 
          eventDate.getFullYear() === currentDate.getFullYear()
        );
      } else if (dateFilter === 'year') {
        return eventDate.getFullYear() === currentDate.getFullYear();
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat pt-20"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.loginCover})`
      }}>
      
      {/* Hero Section with Timeline */}
      <div className="w-full bg-white bg-opacity-95 pt-12 pb-16 px-4 shadow-lg mt-15">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Event Request Journey</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Track your event requests through our streamlined process, from initial booking to final confirmation.
            </p>
          </div>

          {/* Timeline Steps */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 max-w-5xl mx-auto mt-12 mb-4 relative">
            {/* Connection Lines (only visible on md screens and up) */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 z-0"></div>
            
            {/* Step 1: Booking */}
            <div className="relative z-10 flex flex-col items-center w-64 transform transition-all duration-300 hover:-translate-y-2">
              <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-100">
                <div className="bg-blue-100 text-blue-600 rounded-full p-3 inline-block mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-blue-800 mb-2">Booking</h3>
                <p className="text-gray-600 text-sm">
                  Create and submit your event request with all the necessary details.
                </p>
              </div>
              <div className="hidden md:block h-8 w-8 bg-blue-500 rounded-full mt-4 z-20 border-4 border-white shadow-sm"></div>
            </div>
            
            {/* Step 2: Review */}
            <div className="relative z-10 flex flex-col items-center w-64 transform transition-all duration-300 hover:-translate-y-2">
              <div className="w-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6 border border-purple-100">
                <div className="bg-purple-100 text-purple-600 rounded-full p-3 inline-block mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-purple-800 mb-2">Review</h3>
                <p className="text-gray-600 text-sm">
                  Your request is reviewed by our team to assess feasibility and requirements.
                </p>
              </div>
              <div className="hidden md:block h-8 w-8 bg-purple-500 rounded-full mt-4 z-20 border-4 border-white shadow-sm"></div>
            </div>
            
            {/* Step 3: Approval */}
            <div className="relative z-10 flex flex-col items-center w-64 transform transition-all duration-300 hover:-translate-y-2">
              <div className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-md p-6 border border-indigo-100">
                <div className="bg-indigo-100 text-indigo-600 rounded-full p-3 inline-block mb-4">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-indigo-800 mb-2">Approval</h3>
                <p className="text-gray-600 text-sm">
                  Your request is approved with finalized details, pricing, and services.
                </p>
              </div>
              <div className="hidden md:block h-8 w-8 bg-indigo-500 rounded-full mt-4 z-20 border-4 border-white shadow-sm"></div>
            </div>
            
            {/* Step 4: Confirmed */}
            <div className="relative z-10 flex flex-col items-center w-64 transform transition-all duration-300 hover:-translate-y-2">
              <div className="w-full bg-gradient-to-br from-green-50 to-teal-50 rounded-lg shadow-md p-6 border border-green-100">
                <div className="bg-green-100 text-green-600 rounded-full p-3 inline-block mb-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Confirmed</h3>
                <p className="text-gray-600 text-sm">
                  Event is confirmed and scheduled. We're ready to make your event a success!
                </p>
              </div>
              <div className="hidden md:block h-8 w-8 bg-green-500 rounded-full mt-4 z-20 border-4 border-white shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Requests List */}
      <div className="flex justify-center items-center py-12">
        <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 max-w-6xl w-full mx-4 transform transition-all duration-500 hover:shadow-xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 relative">
            <span className="inline-block relative">
              My Event Requests
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            </span>
          </h2>

          {/* Search and Date Filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search by event name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            </div>
            
            {/* Date Filter */}
            <div className="flex items-center bg-gray-100 rounded-lg p-2 w-full md:w-auto">
              <Filter className="text-gray-500 w-5 h-5 mr-2" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-gray-700 font-medium"
              >
                <option value="all">All Dates</option>
                <option value="day">Today</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center mb-8 flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2 mx-2 mb-2 rounded-full transition-all duration-300 font-semibold ${
                  filter === status
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your event requests...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg">
              <p>{error}</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center text-gray-500 p-12 bg-gray-50 rounded-lg border border-gray-200">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-xl">No event requests found matching your filters.</p>
              <p className="mt-2">Try adjusting your search criteria or create a new event request.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-0 right-0 w-20 h-20 ${
                    req.status === 'approved' 
                      ? 'bg-green-500' 
                      : req.status === 'pending'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  } transform rotate-45 translate-x-8 -translate-y-8`}></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {req.eventName}
                    </h3>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full capitalize z-10 ${
                        req.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : req.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
                      <p><strong>Date:</strong> {new Date(req.eventDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                      <p><strong>Location:</strong> {req.eventLocation}</p>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-purple-500" />
                      <p><strong>Guests:</strong> {req.guestCount}</p>
                    </div>
                  </div>

                  {req.remarks && (
                    <div className="flex items-start bg-gray-50 p-3 rounded-lg mb-4">
                      <MessageSquare className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                      <p className="text-gray-500 italic text-sm">
                        "{req.remarks}"
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-3">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleEdit(req)}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(req._id)}
                          className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && requestToEdit && (
        <EditEventRequestModal
          request={requestToEdit}
          onClose={() => {
            setEditModalOpen(false);
            setRequestToEdit(null);
          }}
          onSuccess={() => {
            fetchData();
            setEditModalOpen(false);
            setRequestToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default OrganizerEventRequests;