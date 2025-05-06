import React, { useState, useEffect } from 'react';
import BudgetForm from '../../components/Financial/BudgetForm';
import axiosInstance from '../../utils/axiosInstance';

const AdminBudgetRequests = () => {
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch budget requests from backend
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/api/finance/getb');
        // Assuming res.data.data is an array of budget requests
        const all = Array.isArray(res.data.data) ? res.data.data : [];
        setPendingRequests(all.filter(r => r.status === 'pending'));
        setApprovedRequests(all.filter(r => r.status === 'approved'));
        setRejectedRequests(all.filter(r => r.status === 'rejected'));
      } catch (err) {
        setError('Failed to fetch budget requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [showBudgetModal]); // refetch after modal closes (new request)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Budget Requests</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
          onClick={() => setShowBudgetModal(true)}
        >
          Request Budget
        </button>
      </div>
      {showBudgetModal && (
        <BudgetForm onClose={() => setShowBudgetModal(false)} />
      )}
      {loading ? (
        <div className="text-center py-8">Loading budget requests...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Pending Budget Requests</h3>
            {pendingRequests.length === 0 ? (
              <div className="text-gray-500">No pending requests.</div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(req => (
                  <div key={req._id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow">
                    <div className="font-bold">Amount: RS. {req.allocatedBudget}</div>
                    <div>Reason: {req.reason}</div>
                    <div>Status: <span className="font-semibold text-yellow-700">{req.status}</span></div>
                    <div>Date: {new Date(req.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Approved Requests */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Approved Budget Requests</h3>
            {approvedRequests.length === 0 ? (
              <div className="text-gray-500">No approved requests.</div>
            ) : (
              <div className="space-y-4">
                {approvedRequests.map(req => (
                  <div key={req._id} className="bg-green-50 border-l-4 border-green-400 p-4 rounded shadow">
                    <div className="font-bold">Amount: RS. {req.allocatedBudget}</div>
                    <div>Reason: {req.reason}</div>
                    <div>Status: <span className="font-semibold text-green-700">{req.status}</span></div>
                    <div>Date: {new Date(req.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Rejected Requests */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Rejected Budget Requests</h3>
            {rejectedRequests.length === 0 ? (
              <div className="text-gray-500">No rejected requests.</div>
            ) : (
              <div className="space-y-4">
                {rejectedRequests.map(req => (
                  <div key={req._id} className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow">
                    <div className="font-bold">Amount: RS. {req.allocatedBudget}</div>
                    <div>Reason: {req.reason}</div>
                    <div>Status: <span className="font-semibold text-red-700">{req.status}</span></div>
                    <div>Date: {new Date(req.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBudgetRequests; 