import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Package2, 
  DollarSign,
  Info,
  FileText, 
  MessageSquare, 
  User, 
  Music,
  Globe,
  Lock,
  Sparkles,
  Receipt,
  CreditCard,
  Send,
  Plus,
  Trash2,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { fetchAllEvents, addNoteToEvent, updateEventNote, deleteEventNote } from '../../services/eventService';
import PackageDetailsModal from '../../components/event/PackageDetailsModal';
import ServiceDetailsModal from '../../components/event/ServiceDetailsModal';
import assets from '../../assets/assets.js';
import toast from 'react-hot-toast';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingPackage, setViewingPackage] = useState(null);
  const [viewingService, setViewingService] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [notes, setNotes] = useState([]);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  const [deletingNote, setDeletingNote] = useState(false);

  // Example performance data - in a real app this would come from the API
  const [performances, setPerformances] = useState([
    { id: 1, name: 'Opening Dance', duration: '15 mins', performers: 6, lead: 'John Smith', time: '19:00', status: 'confirmed' },
    { id: 2, name: 'Traditional Kandyan', duration: '25 mins', performers: 8, lead: 'Kumari Perera', time: '19:30', status: 'confirmed' },
    { id: 3, name: 'Modern Fusion', duration: '20 mins', performers: 4, lead: 'Amal Fernando', time: '20:15', status: 'pending' }
  ]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        
        const eventsData = await fetchAllEvents();
        const currentEvent = eventsData.find(e => e._id === id);
        
        if (!currentEvent) {
          setError("Event not found");
          setLoading(false);
          return;
        }
        
        setEvent(currentEvent);
        if (currentEvent.notes && currentEvent.notes.length > 0) {
          setNotes(currentEvent.notes);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id]);

  const handleSubmitNote = async () => {
    if (!newNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    try {
      setSubmittingNote(true);
      const noteData = {
        author: user?.fullName || 'Anonymous',
        authorId: user?._id,
        content: newNote
      };

      const response = await addNoteToEvent(id, noteData);
      
      // Update the notes state with the new note
      setNotes(response.allNotes);
      
      // Reset the form
      setNewNote('');
      setAddingNote(false);
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note. Please try again.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleEditNote = (index, content) => {
    setEditingNoteIndex(index);
    setEditedNoteContent(content);
  };

  const handleUpdateNote = async (index) => {
    if (!editedNoteContent.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    try {
      const response = await updateEventNote(id, index, editedNoteContent);
      setNotes(response.allNotes);
      setEditingNoteIndex(null);
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async (index) => {
    try {
      setDeletingNote(true);
      const response = await deleteEventNote(id, index);
      setNotes(response.allNotes);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note. Please try again.');
    } finally {
      setDeletingNote(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteIndex(null);
    setEditedNoteContent('');
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4 mr-1" /> },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertTriangle className="w-4 h-4 mr-1" /> },
      'change-requested': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <AlertTriangle className="w-4 h-4 mr-1" /> },
      pending: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Clock className="w-4 h-4 mr-1" /> }
    };
    
    const config = statusConfig[status] || statusConfig.confirmed;
    
    return (
      <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading event details...</p>
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
            onClick={() => navigate('/event-dashboard')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-yellow-100 text-yellow-700 p-6 rounded-lg shadow-md">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
          <p>The event you're looking for could not be found.</p>
          <button 
            onClick={() => navigate('/event-dashboard')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Calculate event total cost 
  const calculateTotalCost = () => {
    const packageCost = event.packageID?.price || 0;
    const additionalServicesCost = event.additionalServices?.reduce((sum, service) => {
      return sum + (service.serviceID?.price || 0);
    }, 0) || 0;
    
    // Calculate travel fees (example calculation - adjust as needed)
    const travelFees = event.travelDistance ? event.travelDistance * 100 : 1500; // Default travel fee or based on distance
    
    return {
      packageCost,
      additionalServicesCost,
      travelFees,
      total: packageCost + additionalServicesCost + travelFees
    };
  };
  
  const eventCost = calculateTotalCost();

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-24">
      {/* Back Button */}
      <div className="container mx-auto px-4 mb-6">
        <button 
          onClick={() => navigate('/event-dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </button>
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4">
        {/* Event Header Card */}
        <div className="bg-gradient-to-r from-red-800 to-red-600 text-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${event.eventType === 'public' ? 'bg-purple-700 text-white' : 'bg-blue-700 text-white'} mr-3`}>
                    {event.eventType === 'public' ? 
                      <><Globe className="w-3 h-3 mr-1" /> Public Event</> : 
                      <><Lock className="w-3 h-3 mr-1" /> Private Event</>
                    }
                  </span>
                  <StatusBadge status={event.status} />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">{event.eventName}</h1>
                <p className="text-white/80 mt-2">Event ID: {event._id}</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center">
                <div className="text-right">
                  <p className="text-white/80">Total Event Cost</p>
                  <p className="text-2xl font-bold">Rs. {eventCost.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-white/70" />
                <span>{formatDate(event.eventDate)}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-white/70" />
                <span>{event.eventTime ? formatTime(event.eventTime) : 'Time not specified'}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-white/70" />
                <span>{event.eventLocation}</span>
              </div>
              
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-white/70" />
                <span>{event.guestCount} guests</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Essential Information */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Info className="w-5 h-5 mr-2 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-800">Essential Information</h2>
                </div>
                
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 p-4">
                    <h3 className="text-sm text-gray-500 font-medium mb-2">Event Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Event Type</p>
                        <p className="font-medium">{event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <StatusBadge status={event.status} />
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Approval</p>
                        <p className="font-medium">{event.approvedBy || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Date Created</p>
                        <p className="font-medium">{new Date(event.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4">
                    <h3 className="text-sm text-gray-500 font-medium mb-2">Venue Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{event.eventLocation}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Guest Count</p>
                        <p className="font-medium">{event.guestCount} people</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p className="font-medium">{formatDate(event.eventDate)}</p>
                        <p className="font-medium">{event.eventTime ? formatTime(event.eventTime) : 'Time not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 mr-2 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-800">Event Description</h2>
                </div>
                
                <div className="prose max-w-none">
                  {event.additionalRequests ? (
                    <p>{event.additionalRequests}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided for this event.</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Performances */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Music className="w-5 h-5 mr-2 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-800">Performances</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {performances.map(performance => (
                        <tr key={performance.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{performance.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {performance.duration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {performance.performers}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {performance.lead}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {performance.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={performance.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {performances.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No performances have been scheduled yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Package Details */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Package2 className="w-5 h-5 mr-2 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-800">Package Details</h2>
                </div>
                
                {event.packageID ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.packageID.packageName}</h3>
                        <p className="text-gray-600 mb-3">{event.packageID.description}</p>
                        
                        {event.packageID.danceStyles && event.packageID.danceStyles.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500 mb-1">Dance Styles:</p>
                            <div className="flex flex-wrap gap-2">
                              {event.packageID.danceStyles.map((style, idx) => (
                                <span key={idx} className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  {style}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => setViewingPackage(event.packageID)}
                          className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          <Info className="w-4 h-4 mr-1" />
                          View Full Details
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Package Cost</p>
                        <p className="text-xl font-bold text-gray-900">Rs. {event.packageID.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No package information available.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Services */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Sparkles className="w-5 h-5 mr-2 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-800">Additional Services</h2>
                </div>
                
                {event.additionalServices && event.additionalServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.additionalServices.map((service) => (
                      <div key={service.serviceID._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">{service.serviceID.serviceName}</h3>
                            {service.serviceID.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.serviceID.description}</p>
                            )}
                            
                            <button
                              onClick={() => setViewingService(service.serviceID)}
                              className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                            >
                              <Info className="w-3 h-3 mr-1" />
                              View Details
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Cost</p>
                            <p className="font-bold text-gray-900">Rs. {service.serviceID.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No additional services were requested.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Sidebar */}
          <div>
            {/* Price Breakdown Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Receipt className="w-5 h-5 mr-2 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-800">Price Breakdown</h2>
                </div>
                
                <div className="space-y-3 mb-6">
                  {/* Package Cost */}
                  <div className="flex justify-between pb-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium">Package Fee</p>
                      <p className="text-sm text-gray-500">{event.packageID?.packageName || 'Package'}</p>
                    </div>
                    <p className="font-medium">Rs. {eventCost.packageCost.toLocaleString()}</p>
                  </div>
                  
                  {/* Additional Services Cost */}
                  {event.additionalServices && event.additionalServices.length > 0 && (
                    <div className="flex justify-between pb-3 border-b border-gray-100">
                      <div>
                        <p className="font-medium">Additional Services</p>
                        <p className="text-sm text-gray-500">{event.additionalServices.length} services</p>
                      </div>
                      <p className="font-medium">Rs. {eventCost.additionalServicesCost.toLocaleString()}</p>
                    </div>
                  )}
                  
                  {/* Travel Fees */}
                  <div className="flex justify-between pb-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium">Travel Fees</p>
                      <p className="text-sm text-gray-500">Rs. {eventCost.travelFees.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="flex justify-between pt-2">
                    <p className="font-bold text-lg">Total</p>
                    <p className="font-bold text-lg text-red-600">Rs. {eventCost.total.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                    <CreditCard className="w-5 h-5 text-gray-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Payment Information</h3>
                      <p className="text-sm text-gray-600">
                        Payment for this event has been processed and confirmed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Assigned Team Members */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 mr-2 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-800">Assigned Team</h2>
                </div>
                
                {event.membersAssigned && event.membersAssigned.length > 0 ? (
                  <div className="space-y-4">
                    {event.membersAssigned.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center mr-3">
                            <span className="text-red-700 font-medium">{member.memberId?.firstName?.charAt(0) || '?'}</span>
                          </div>
                          <div>
                            <p className="font-medium">{member.memberId?.firstName} {member.memberId?.lastName}</p>
                            <p className="text-sm text-gray-500">{member.memberId?.role || 'Team Member'}</p>
                          </div>
                        </div>
                        <StatusBadge status={member.status.toLowerCase()} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No team members have been assigned yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Notes/Comments */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-800">Event Notes</h2>
                  </div>
                  
                  <button 
                    onClick={() => setAddingNote(true)}
                    className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    disabled={addingNote}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Note
                  </button>
                </div>
                
                {/* Add Note Form */}
                {addingNote && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <textarea 
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Enter your note here..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[100px] mb-3"
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => {
                          setAddingNote(false);
                          setNewNote('');
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        disabled={submittingNote}
                      >
                        Cancel
                      </button>
                      
                      <button 
                        onClick={handleSubmitNote}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        disabled={submittingNote || !newNote.trim()}
                      >
                        {submittingNote ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Save Note
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* List of Notes */}
                <div className="space-y-4 mt-2">
                  {notes && notes.length > 0 ? (
                    notes.map((note, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500 relative">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-gray-900">{note.author}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-gray-500">
                              {new Date(note.createdAt).toLocaleString()}
                            </p>
                            {editingNoteIndex !== index && (
                              <div className="flex space-x-1 ml-2">
                                {(note.authorId === user?._id || note.author === user?.fullName) && (
                                  <>
                                    <button 
                                      onClick={() => handleEditNote(index, note.content)}
                                      className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                                      title="Edit note"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteNote(index)}
                                      className="text-gray-500 hover:text-red-600 transition-colors p-1"
                                      title="Delete note"
                                      disabled={deletingNote}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {editingNoteIndex === index ? (
                          <div>
                            <textarea 
                              value={editedNoteContent}
                              onChange={e => setEditedNoteContent(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[80px] mb-3"
                            />
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={handleCancelEdit}
                                className="flex items-center px-2 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleUpdateNote(index)}
                                className="flex items-center px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                disabled={!editedNoteContent.trim()}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700">{note.content}</p>
                        )}
                        
                        {note.updatedAt && (
                          <p className="text-xs text-gray-400 italic mt-2">
                            Edited on {new Date(note.updatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 italic">No notes have been added to this event yet.</p>
                      {!addingNote && (
                        <button 
                          onClick={() => setAddingNote(true)}
                          className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Add the first note
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
    </div>
  );
};

export default EventDetailPage; 