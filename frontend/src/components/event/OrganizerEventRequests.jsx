import React, { useEffect, useState, useContext } from 'react';
import {
  fetchRequestsByOrganizer,
  deleteRequest
} from '../../services/eventRequestService';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';

const OrganizerEventRequests = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FIXED: Use user._id which matches organizerID in DB
  const organizerID = user?._id;

  const fetchData = async () => {
    try {
      if (!organizerID) {
        setError('Organizer ID not found');
        setLoading(false);
        return;
      }

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
    navigate(`/event-request/edit/${request._id}`, { state: { request } });
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

  const filteredRequests =
    filter === 'all'
      ? requests
      : requests.filter((req) => req.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-24">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        My Event Requests
      </h2>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-6">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-5 py-2 mx-2 rounded-full transition-all font-semibold ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading event requests...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filteredRequests.length === 0 ? (
        <p className="text-center text-gray-500">No requests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-800">
                  {req.eventName}
                </h3>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full capitalize ${
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
              <p className="text-gray-600 mb-1">
                <strong>Date:</strong>{' '}
                {new Date(req.eventDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Location:</strong> {req.eventLocation}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Guests:</strong> {req.guestCount}
              </p>

              {req.remarks && (
                <p className="text-gray-500 italic text-sm mb-2">
                  “{req.remarks}”
                </p>
              )}

              <div className="flex justify-end gap-3 pt-3">
                {req.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleEdit(req)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(req._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
  );
};

export default OrganizerEventRequests;