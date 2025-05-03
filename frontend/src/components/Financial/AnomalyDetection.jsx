import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const AnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    dateRange: 'all',
    search: ''
  });

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    try {
      const response = await axiosInstance.get('/api/finance/anomalies');
      if (response.data.success) {
        setAnomalies(response.data.anomalies);
        setStats(response.data.stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      toast.error('Failed to fetch anomalies');
      setLoading(false);
    }
  };

  const handleViewTransaction = async (anomaly) => {
    if (!anomaly._id) {
      toast.error('Invalid transaction ID');
      return;
    }

    setTransactionLoading(true);
    try {
      const response = await axiosInstance.get(`/api/finance/transaction/${anomaly._id}`);
      
      if (!response.data) {
        throw new Error('No transaction data received');
      }

      setSelectedAnomaly({
        ...anomaly,
        transactionDetails: response.data
      });
      setShowTransactionModal(true);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch transaction details');
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleResolveAnomaly = async (anomalyId) => {
    try {
      const response = await axiosInstance.post(`/api/finance/anomalies/${anomalyId}/resolve`);
      
      if (response.data.success) {
        // Update the local state to reflect the resolved status
        setAnomalies(anomalies.map(anomaly => 
          anomaly._id === anomalyId 
            ? { ...anomaly, anomalyStatus: 'resolved' }
            : anomaly
        ));
        
        toast.success('Anomaly resolved successfully');
        setShowTransactionModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to resolve anomaly');
      }
    } catch (error) {
      console.error('Error resolving anomaly:', error);
      toast.error(error.response?.data?.message || 'Failed to resolve anomaly');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'resolved':
        return 'bg-green-100 border-green-500 text-green-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (filters.severity !== 'all' && anomaly.severity !== filters.severity) return false;
    if (filters.type !== 'all' && !anomaly.anomalyTypes.includes(filters.type)) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        anomaly.user?.fullName?.toLowerCase().includes(searchLower) ||
        anomaly.user?.email?.toLowerCase().includes(searchLower) ||
        anomaly.anomalyTypes.some(type => type.toLowerCase().includes(searchLower))
      );
    }
    return true;
  }).sort((a, b) => {
    // Sort resolved anomalies to the bottom
    if (a.anomalyStatus === 'resolved' && b.anomalyStatus !== 'resolved') return 1;
    if (a.anomalyStatus !== 'resolved' && b.anomalyStatus === 'resolved') return -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 py-8 px-4 md:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Anomaly Detection</h1>
        <p className="text-gray-600">Monitor and manage suspicious financial activities</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalTransactions}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <box-icon name="transfer" color="#2563eb" size="lg"></box-icon>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anomalies Detected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.anomalyCount}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <box-icon name="error" color="#dc2626" size="lg"></box-icon>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anomaly Rate</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.anomalyPercentage}%</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <box-icon name="chart" color="#d97706" size="lg"></box-icon>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 hover:shadow-md transition-shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="amount">Amount</option>
              <option value="frequency">Frequency</option>
              <option value="time">Time</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by user name, email, or type..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Anomalies Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnomalies.map((anomaly, index) => (
              <div
                key={anomaly._id || index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {anomaly.user?.fullName || anomaly.user?.email || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(anomaly.date).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    anomaly.anomalyStatus === 'resolved' ? 'bg-green-100 text-green-800' :
                    anomaly.severity === 'high' ? 'bg-red-100 text-red-800' :
                    anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {anomaly.anomalyStatus === 'resolved' ? 'Resolved' : anomaly.severity}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {anomaly.anomalyTypes.map((type, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-700">
                    Amount: RS.{anomaly.totalAmount}
                  </p>

                  {anomaly.details?.note && (
                    <p className="text-sm text-gray-600 italic">
                      {anomaly.details.note}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => handleViewTransaction(anomaly)}
                      disabled={transactionLoading}
                      className={`px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                        transactionLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {transactionLoading ? 'Loading...' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredAnomalies.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <box-icon name="search" size="lg" color="#6b7280"></box-icon>
            <p className="mt-4 text-gray-500">No anomalies match the selected filters</p>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedAnomaly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Transaction Details</h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <box-icon name="x" size="lg"></box-icon>
              </button>
            </div>

            {transactionLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Transaction Information */}
                <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-700 mb-3">Transaction Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium">RS.{selectedAnomaly.transactionDetails?.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium">{selectedAnomaly.transactionDetails?.transactionType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{new Date(selectedAnomaly.transactionDetails?.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium">{selectedAnomaly.transactionDetails?.payment?.status || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-700 mb-3">User Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedAnomaly.transactionDetails?.user?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedAnomaly.transactionDetails?.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedAnomaly.transactionDetails?.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {selectedAnomaly.transactionDetails?.documents?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-700 mb-3">Supporting Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedAnomaly.transactionDetails.documents.map((doc, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{doc.type}</p>
                              <p className="text-sm text-gray-500">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Anomaly Details */}
                <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-700 mb-3">Anomaly Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Severity</p>
                      <p className="font-medium">{selectedAnomaly.severity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Types</p>
                      <p className="font-medium">{selectedAnomaly.anomalyTypes.join(', ')}</p>
                    </div>
                    {selectedAnomaly.details?.note && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Note</p>
                        <p className="font-medium">{selectedAnomaly.details.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowTransactionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              {selectedAnomaly.anomalyStatus !== 'resolved' && (
                <button
                  onClick={() => handleResolveAnomaly(selectedAnomaly._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Resolve Anomaly
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyDetection; 