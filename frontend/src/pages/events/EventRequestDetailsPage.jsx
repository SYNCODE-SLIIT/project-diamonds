import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRequestsByOrganizer, deleteRequest } from '../../services/eventRequestService';
import { UserContext } from '../../context/userContext';
import { useContext } from 'react';
import assets from '../../assets/assets.js';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Tag, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package2, 
  UserCheck, 
  MessageSquare,
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import PackageDetailsModal from '../../components/event/PackageDetailsModal';
import ServiceDetailsModal from '../../components/event/ServiceDetailsModal';

const EventRequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingPackage, setViewingPackage] = useState(null);
  const [viewingService, setViewingService] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        if (!user?._id) return;
        
        const requests = await fetchRequestsByOrganizer(user._id);
        const currentRequest = requests.find(req => req._id === id);
        
        if (!currentRequest) {
          setError("Event request not found");
          setLoading(false);
          return;
        }
        
        setRequest(currentRequest);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError('Failed to load request details');
        setLoading(false);
      }
    };
    
    fetchRequestDetails();
  }, [id, user]);

  const handleDelete = async () => {
    try {
      await deleteRequest(id);
      navigate('/event-requests');
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Failed to delete request');
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4 mr-1" /> },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4 mr-1" /> },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertTriangle className="w-4 h-4 mr-1" /> },
      'pending-update': { bg: 'bg-orange-100', text: 'text-orange-800', icon: <Clock className="w-4 h-4 mr-1" /> }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this event request? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={() => setDeleteModalOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading event request details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/event-requests')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-yellow-100 text-yellow-700 p-6 rounded-lg shadow-md">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Request Not Found</h2>
          <p>The event request you're looking for could not be found.</p>
          <button 
            onClick={() => navigate('/event-requests')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 pt-20 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.loginCover})`
      }}>
      {/* Hero Section */}
      <div className="relative h-64 mt-12 bg-cover bg-center" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.event1})`
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-transparent"></div>
        <div className="container mx-auto px-6 h-full flex items-center relative z-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Event Request Details</h1>
            <p className="text-white/80 text-lg">Full breakdown of your booking request</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 -mt-16">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden backdrop-blur-sm border border-white/10 bg-opacity-95">
          {/* Event Details Card */}
          <div className="p-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{request.eventName}</h2>
                <div className="flex items-center text-gray-500 mb-4">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Created on {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <StatusBadge status={request.status} />
            </div>

            {request.status === 'approved' && request.approvalDate && (
              <div className="bg-green-50 p-3 rounded-lg flex items-center mb-6 border border-green-100">
                <CalendarCheck className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">
                  Approved on {new Date(request.approvalDate).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <div className="flex items-start">
                <div className="bg-red-50 rounded-full p-3 mr-4">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Event Date</h3>
                  <p className="text-gray-900">{new Date(request.eventDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-50 rounded-full p-3 mr-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Location</h3>
                  <p className="text-gray-900">{request.eventLocation}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-green-50 rounded-full p-3 mr-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Guest Count</h3>
                  <p className="text-gray-900">{request.guestCount}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-purple-50 rounded-full p-3 mr-4">
                  <Tag className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Event ID</h3>
                  <p className="text-gray-900">{request._id}</p>
                </div>
              </div>

              {request.reviewedBy && (
                <div className="flex items-start">
                  <div className="bg-indigo-50 rounded-full p-3 mr-4">
                    <UserCheck className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Reviewed By</h3>
                    <p className="text-gray-900">{request.reviewedBy}</p>
                  </div>
                </div>
              )}

              {request.approvalDate && (
                <div className="flex items-start">
                  <div className="bg-teal-50 rounded-full p-3 mr-4">
                    <CheckCircle className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Approval Date</h3>
                    <p className="text-gray-900">{new Date(request.approvalDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>

            {request.remarks && (
              <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-start">
                  <MessageSquare className="w-5 h-5 text-gray-500 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Remarks</h3>
                    <p className="text-gray-600">{request.remarks}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Package Section */}
          {request.packageID && (
            <div className="p-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Package2 className="w-5 h-5 mr-2" />
                Package Details
              </h3>
              
              <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">
                        {request.packageID.packageName}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Type: {request.packageID.type.charAt(0).toUpperCase() + request.packageID.type.slice(1)}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      Rs. {request.packageID.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 line-clamp-2 mb-4">
                    {request.packageID.description}
                  </p>
                  
                  <button
                    onClick={() => setViewingPackage(request.packageID)}
                    className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    View Package Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Services Section */}
          {request.additionalServices && request.additionalServices.length > 0 && (
            <div className="p-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Additional Services
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {request.additionalServices.map((service) => (
                  <div 
                    key={service.serviceID._id}
                    className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {service.serviceID.serviceName}
                      </h4>
                      <p className="text-red-600 font-medium mb-3">
                        Rs. {service.serviceID.price.toLocaleString()}
                      </p>
                      
                      <button
                        onClick={() => setViewingService(service.serviceID)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-8 border-t border-gray-100 flex flex-wrap justify-between gap-4">
            <button
              onClick={() => navigate('/event-requests')}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Requests
            </button>
            
            <div className="flex gap-3">
              {request.status === 'pending' && (
                <>
                  <button
                    onClick={() => navigate(`/event-requests/${id}/edit`)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Request
                  </button>
                  
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Package Details Modal */}
      {viewingPackage && (
        <PackageDetailsModal
          pkg={viewingPackage}
          onClose={() => setViewingPackage(null)}
        />
      )}

      {/* Service Details Modal */}
      {viewingService && (
        <ServiceDetailsModal
          service={viewingService}
          onClose={() => setViewingService(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && <DeleteConfirmationModal />}
    </div>
  );
};

export default EventRequestDetailsPage; 