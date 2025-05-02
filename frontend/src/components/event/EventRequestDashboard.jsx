import React, { useEffect, useState } from 'react';
import { fetchAllRequests } from '../../services/eventRequestService';
import EventRequestModal from './EventRequestModal';
import { EyeIcon } from 'lucide-react';

const EventRequestDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await fetchAllRequests(selectedStatus !== 'all' ? selectedStatus : '');
      setRequests(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Event Requests</h2>

      <div className="mb-4">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded mr-2 ${
              selectedStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map(req => (
          <div key={req._id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
            <h3 className="text-lg font-semibold">{req.eventName}</h3>
            <p className="text-sm text-gray-600">Date: {new Date(req.eventDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Guests: {req.guestCount}</p>
            <p className="text-sm text-gray-600">
              Status: <span className={`font-semibold ${
                req.status === 'pending' ? 'text-yellow-500' :
                req.status === 'approved' ? 'text-green-600' :
                'text-red-600'
              }`}>{req.status}</span>
            </p>
            <button
              onClick={() => setSelectedRequest(req)}
              className="mt-3 flex items-center gap-2 text-blue-600 hover:underline"
            >
              <EyeIcon className="w-4 h-4" /> View Details
            </button>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <EventRequestModal
          request={selectedRequest}
          onClose={() => {
            setSelectedRequest(null);
            fetchRequests();
          }}
        />
      )}
    </div>
  );
};

export default EventRequestDashboard;