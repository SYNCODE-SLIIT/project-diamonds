import React, { useEffect, useState, useContext } from 'react';
import { fetchAllRequests, updateStatus } from '../../services/eventRequestService';
import { UserContext } from '../../context/userContext';
import { 
  Calendar, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  EyeIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EventRequestDashboard = () => {
  const { user } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllRequests(filter !== 'all' ? filter : '');
      setRequests(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load event requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleApprove = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to approve this event request?')) {
      try {
        setSubmitting(true);
        await updateStatus(id, 'approved', user?._id || 'admin');
        await fetchData();
      } catch (err) {
        console.error('Error approving request:', err);
        alert('Failed to approve request');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const openRejectModal = (request, e) => {
    e.stopPropagation();
    setRequestToReject(request);
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setSubmitting(true);
      await updateStatus(requestToReject._id, 'rejected', user?._id || 'admin', rejectReason);
      setShowRejectModal(false);
      setRequestToReject(null);
      setRejectReason('');
      await fetchData();
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request');
    } finally {
      setSubmitting(false);
    }
  };

  // Apply all filters (search, date)
  const filteredRequests = requests.filter(req => {
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Event Requests Management</h2>

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
      <div className="flex flex-wrap mb-6">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-5 py-2 mx-2 mb-2 rounded-lg transition-all duration-300 font-semibold ${
              filter === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading event requests...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg">
          <p>{error}</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center text-gray-500 p-12 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-xl">No event requests found matching your filters.</p>
          <p className="mt-2">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden cursor-pointer"
              onClick={() => navigate(`/admin/event-requests/${req._id}`)}
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
                  <p className="text-gray-500 italic text-sm line-clamp-2">
                    "{req.remarks}"
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                {req.status === 'pending' && (
                  <>
                    <button
                      onClick={(e) => handleApprove(req._id, e)}
                      disabled={submitting}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={(e) => openRejectModal(req, e)}
                      disabled={submitting}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </>
                )}
                {req.status !== 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/event-requests/${req._id}`);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Reject Event Request</h3>
            <p className="mb-4">
              Please provide a reason for rejecting "{requestToReject?.eventName}":
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] mb-4"
              required
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRequestToReject(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRequestDashboard;