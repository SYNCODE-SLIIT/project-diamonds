import React, { useEffect, useState } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import RefundStatus from '../../components/Expense/RefundStatus';
import { LuArrowLeft } from 'react-icons/lu';
import { Link } from 'react-router-dom';

const RefundHistory = () => {
  // Make sure the user is authenticated before rendering this page
  const { user } = useUserAuth();

  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);

  // Fetch all refunds for the current user
  const fetchRefunds = async () => {
    if (!user?._id) {
      console.log('No user ID available');
      setRefunds([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/finance/getr');
      if (response.data && response.data.success) {
        // Filter refunds for current user only
        const userRefunds = response.data.data.filter(refund => refund.user._id === user._id);
        console.log('Found refunds for current user:', userRefunds.length);
        setRefunds(userRefunds);
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast.error("Failed to fetch refund history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="my-5 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link to="/dashboard/expense" className="text-gray-600 hover:text-gray-800">
            <LuArrowLeft />
          </Link>
          <h2 className="text-2xl font-semibold">Refund History</h2>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Loading refund history...</p>
        </div>
      ) : refunds.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">You haven't requested any refunds yet.</p>
        </div>
      ) : selectedRefund ? (
        <div>
          <button 
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
            onClick={() => setSelectedRefund(null)}
          >
            <LuArrowLeft /> Back to Refund History
          </button>
          <RefundStatus refund={selectedRefund} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {refunds.map((refund) => (
            <div 
              key={refund._id} 
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRefund(refund)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium">Refund Request #{refund._id.slice(-6)}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(refund.processedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(refund.status)}`}>
                  {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Amount: <span className="font-medium">RS. {refund.refundAmount}</span></p>
                  <p className="text-sm text-gray-600">Reason: <span className="font-medium">{refund.reason}</span></p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RefundHistory; 