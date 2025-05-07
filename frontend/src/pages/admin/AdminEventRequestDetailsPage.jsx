import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAllRequests, updateStatus } from '../../services/eventRequestService';
import { findOrganizerByUserId, getOrganizerById } from '../../services/organizerService';
import { UserContext } from '../../context/userContext';
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
  CheckSquare,
  XSquare,
  Building,
  User,
  CalendarCheck,
  Phone,
  Mail,
  Globe,
  Briefcase
} from 'lucide-react';
import PackageDetailsModal from '../../components/event/PackageDetailsModal';
import ServiceDetailsModal from '../../components/event/ServiceDetailsModal';

const AdminEventRequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [request, setRequest] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [organizerLoading, setOrganizerLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizerError, setOrganizerError] = useState(null);
  const [viewingPackage, setViewingPackage] = useState(null);
  const [viewingService, setViewingService] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveNote, setApproveNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const requests = await fetchAllRequests();
        const currentRequest = requests.find(req => req._id === id);
        
        if (!currentRequest) {
          setError("Event request not found");
          setLoading(false);
          return;
        }
        
        setRequest(currentRequest);
        setLoading(false);
        
        // After we have the request, fetch the organizer details
        fetchOrganizerDetails(currentRequest.organizerID);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError('Failed to load request details');
        setLoading(false);
      }
    };
    
    const fetchOrganizerDetails = async (organizerId) => {
      setOrganizerLoading(true);
      try {
        let organizerData;
        try {
          // First attempt: treat organizerId as User._id
          organizerData = await findOrganizerByUserId(organizerId);
        } catch (userErr) {
          console.warn('findOrganizerByUserId failed, falling back to getOrganizerById:', userErr);
          // Fallback: treat organizerId as Organizer._id
          organizerData = await getOrganizerById(organizerId);
        }
        setOrganizer(organizerData);
        setOrganizerError(null);
      } catch (err) {
        console.error('Error fetching organizer details:', err);
        setOrganizerError('Failed to load organizer details');
      } finally {
        setOrganizerLoading(false);
      }
    };
    
    fetchRequestDetails();
  }, [id]);

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await updateStatus(id, 'approved', user?._id || 'admin', '', approveNote);
      // Refresh the request data
      const requests = await fetchAllRequests();
      const updatedRequest = requests.find(req => req._id === id);
      setRequest(updatedRequest);
      setShowApproveModal(false);
      setApproveNote('');
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setSubmitting(true);
      await updateStatus(id, 'rejected', user?._id || 'admin', rejectReason);
      setShowRejectModal(false);
      
      // Refresh the request data
      const requests = await fetchAllRequests();
      const updatedRequest = requests.find(req => req._id === id);
      setRequest(updatedRequest);
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading request details...</p>
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
            onClick={() => navigate('/admin/event-requests')}
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
            onClick={() => navigate('/admin/event-requests')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                <div className="bg-purple-50 rounded-full p-3 mr-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Guest Count</h3>
                  <p className="text-gray-900">{request.guestCount}</p>
                </div>
              </div>
            </div>

            {request.remarks && (
              <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-gray-500" />
                  Remarks
                </h3>
                <p className="text-gray-800">{request.remarks}</p>
              </div>
            )}

            {/* Organizer Information */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Organizer Information</h3>
              {organizerLoading ? (
                <div className="bg-gray-50 p-6 rounded-lg flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Loading organizer details...</span>
                </div>
              ) : organizerError ? (
                <div className="bg-red-50 p-6 rounded-lg text-red-600">
                  <p className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {organizerError}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Organizer ID: {request.organizerID}</p>
                  </div>
                </div>
              ) : organizer ? (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start">
                      <User className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-800">{organizer.fullName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Building className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Organization</p>
                        <p className="font-medium text-gray-800">
                          {organizer.organizationName || "Not specified"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">{organizer.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Contact Number</p>
                        <p className="font-medium text-gray-800">
                          {organizer.contactNumber || "Not provided"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Business Address</p>
                        <p className="font-medium text-gray-800">
                          {organizer.businessAddress || "Not provided"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Globe className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        {organizer.website ? (
                          <a 
                            href={organizer.website.startsWith('http') ? organizer.website : `https://${organizer.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {organizer.website}
                          </a>
                        ) : (
                          <p className="font-medium text-gray-800">Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {organizer.organizationDescription && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-start">
                        <Briefcase className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Organization Description</p>
                          <p className="text-gray-800">{organizer.organizationDescription}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-gray-500">
                  <p>No organizer details available. ID: {request.organizerID}</p>
                </div>
              )}
            </div>

            {/* Package Information */}
            {request.packageID && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Package Information</h3>
                  <button 
                    onClick={() => setViewingPackage(request.packageID)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <Package2 className="w-4 h-4 mr-1" /> View Package Details
                  </button>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{request.packageID.packageName}</h4>
                  <p className="text-gray-700 mb-2">{request.packageID.description}</p>
                  
                  {request.packageID.danceStyles && request.packageID.danceStyles.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Dance Styles:</p>
                      <div className="flex flex-wrap gap-1">
                        {request.packageID.danceStyles.map((style, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-700">
                      <strong>Price:</strong> <span className="text-red-600 font-semibold">Rs. {request.packageID.price?.toLocaleString() || 'N/A'}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Services */}
            {request.additionalServices && request.additionalServices.length > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Services</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.additionalServices.map((service, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">{service.serviceID.serviceName}</h4>
                        <button 
                          onClick={() => setViewingService(service.serviceID)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Details
                        </button>
                      </div>
                      <p className="text-red-600 font-medium text-sm mt-1">
                        Rs. {service.serviceID.price?.toLocaleString() || 'N/A'}
                      </p>
                      {service.serviceID.description && (
                        <p className="text-gray-700 text-sm mt-2">{service.serviceID.description}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-gray-100 rounded-lg flex justify-between items-center">
                  <span className="font-medium text-gray-800">Total Additional Services:</span>
                  <span className="font-bold text-red-600">
                    Rs. {request.additionalServices.reduce((sum, s) => sum + (s.serviceID.price || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Estimated Total */}
            <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-blue-900">Estimated Total</h3>
                <p className="text-xl font-bold text-red-600">
                  Rs. {(
                    (request.packageID?.price || 0) +
                    request.additionalServices?.reduce((sum, s) => sum + (s.serviceID?.price || 0), 0)
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 border-t border-gray-100 flex flex-wrap justify-between gap-4">
            <button
              onClick={() => navigate('/admin/event-requests')}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Requests
            </button>
            
            <div className="flex gap-3">
              {request.status === 'pending' && (
                <>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    disabled={submitting}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckSquare className="w-5 h-5 mr-2" />
                    Approve Request
                  </button>
                  
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={submitting}
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XSquare className="w-5 h-5 mr-2" />
                    Reject Request
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

      {/* Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Approve Event Request</h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to approve "{request?.eventName}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Reject Event Request</h3>
            <p className="mb-4 text-gray-700">
              Please provide a reason for rejecting "{request?.eventName}":
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
                {submitting ? 'Processing...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventRequestDetailsPage; 