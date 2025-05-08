import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Send,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { fetchAllEvents, addNoteToEvent, updateEventNote, deleteEventNote, updateEventStatus } from '../../services/eventService';
import { fetchEventMedia } from '../../services/eventMediaService';
import { getPackageById } from '../../services/packageService';
import PackageDetailsModal from '../../components/event/PackageDetailsModal';
import ServiceDetailsModal from '../../components/event/ServiceDetailsModal';
import toast from 'react-hot-toast';

// Default feature image from Cloudinary
const DEFAULT_FEATURE_IMAGE_URL = "https://res.cloudinary.com/du5c9fw6s/image/upload/v1746620459/default_event_j82gdq.jpg";

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [event, setEvent] = useState(null);
  const [eventMedia, setEventMedia] = useState(null);
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
  const [packageDetails, setPackageDetails] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(false);
  
  // Function to refresh event data when needed
  const refreshEventData = async (showLoadingState = false) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      
      // Fetch event details
      const eventsData = await fetchAllEvents();
      const currentEvent = eventsData.find(e => e._id === id);
      
      if (!currentEvent) {
        setError("Event not found");
        if (showLoadingState) {
          setLoading(false);
        }
        return;
      }
      
      // Update event state
      setEvent(currentEvent);
      
      // Update notes state if available
      if (currentEvent.notes && currentEvent.notes.length > 0) {
        setNotes(currentEvent.notes);
      }
      
      // Fetch event media
      try {
        const media = await fetchEventMedia(id);
        setEventMedia(media);
      } catch (mediaError) {
        console.error('Error fetching event media:', mediaError);
        // Continue even if media fetch fails
      }
      
      if (showLoadingState) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error refreshing event data:', err);
      if (showLoadingState) {
        setError('Failed to load event details');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchEventDetailsAndMedia = async () => {
      try {
        setLoading(true);
        
        await refreshEventData(false);
        
        // Fetch package details if available
        if (event?.packageID && event.packageID._id) {
          try {
            // Try to get detailed package data
            const packageData = await getPackageById(event.packageID._id);
            setPackageDetails(packageData);
            
            // If successful, we'll update the event object with the complete package details
            if (packageData) {
              setEvent(prev => ({
                ...prev,
                packageID: {
                  ...prev.packageID,
                  performances: packageData.performances?.map(p => ({
                    ...p,
                    status: 'confirmed' // All package performances are considered confirmed
                  })) || []
                }
              }));
            }
          } catch (packageError) {
            console.error('Error fetching package details:', packageError);
            // Continue even if package fetch fails
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
        setLoading(false);
      }
    };

    fetchEventDetailsAndMedia();
  }, [id]);

  // Handle note submission
  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      setSubmittingNote(true);
      await addNoteToEvent(event._id, newNote);
      toast.success('Note added successfully');
      
      // Update the UI
      setNotes([
        ...notes,
        {
          content: newNote,
          createdBy: {
            _id: user._id,
            name: user.name,
            role: user.role
          },
          createdAt: new Date().toISOString()
        }
      ]);
      
      // Reset the form
      setNewNote('');
      setAddingNote(false);
    } catch (error) {
      toast.error('Failed to add note');
      console.error('Error adding note:', error);
    } finally {
      setSubmittingNote(false);
    }
  };

  // Handle note editing
  const handleEditNote = (index, content) => {
    setEditingNoteIndex(index);
    setEditedNoteContent(content);
  };

  // Handle note update
  const handleUpdateNote = async (index) => {
    if (!editedNoteContent.trim()) return;
    
    try {
      const noteId = notes[index]._id;
      await updateEventNote(event._id, noteId, editedNoteContent);
      
      // Update state
      const updatedNotes = [...notes];
      updatedNotes[index].content = editedNoteContent;
      setNotes(updatedNotes);
      
      // Reset
      setEditingNoteIndex(null);
      setEditedNoteContent('');
      
      toast.success('Note updated');
    } catch (error) {
      toast.error('Failed to update note');
      console.error('Error updating note:', error);
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (index) => {
    try {
      setDeletingNote(true);
      const noteId = notes[index]._id;
      await deleteEventNote(event._id, noteId);
      
      // Update state
      const updatedNotes = [...notes];
      updatedNotes.splice(index, 1);
      setNotes(updatedNotes);
      
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
      console.error('Error deleting note:', error);
    } finally {
      setDeletingNote(false);
    }
  };

  // Accept changes to event
  const handleAcceptChanges = async () => {
    if (event.status !== 'change-requested') return;
    
    try {
      setProcessingStatus(true);
      await updateEventStatus(event._id, 'confirmed');
      toast.success('Changes accepted successfully');
      
      // Update local state
      setEvent(prev => ({
        ...prev,
        status: 'confirmed'
      }));
    } catch (error) {
      toast.error('Failed to accept changes');
      console.error('Error accepting changes:', error);
    } finally {
      setProcessingStatus(false);
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatMonthDay = (dateString) => {
    if (!dateString) return { month: 'TBD', day: 'TBD' };
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate()
    };
  };

  const formatTime = (timeObj) => {
    if (!timeObj || !timeObj.startDate || !timeObj.endDate) return 'Time not set';
    
    const startTime = new Date(timeObj.startDate);
    const endTime = new Date(timeObj.endDate);
    
    return `${startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not set';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor, textColor, icon;
    
    switch (status) {
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        icon = <Clock className="w-3 h-3 mr-1" />;
        break;
      case 'confirmed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = <CheckCircle className="w-3 h-3 mr-1" />;
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        icon = <X className="w-3 h-3 mr-1" />;
        break;
      case 'change-requested':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        icon = <AlertTriangle className="w-3 h-3 mr-1" />;
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = <Info className="w-3 h-3 mr-1" />;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    let total = 0;
    
    // Base package price
    if (event.packageID && event.packageID.price) {
      total += event.packageID.price;
    }
    
    // Travel fees
    if (event.packageID && event.packageID.travelFees) {
      total += event.packageID.travelFees;
    }
    
    // Additional services
    if (event.additionalServices && event.additionalServices.length > 0) {
      event.additionalServices.forEach(service => {
        if (service.serviceID && service.serviceID.price) {
          total += service.serviceID.price;
        }
      });
    }
    
    return total;
  };

  // If loading or error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The event you're looking for doesn't exist or you don't have permission to view it."}</p>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <input 
        type="file" 
        className="hidden" 
        accept="image/*" 
      />
      
      {/* Feature Image Hero Section */}
      <div className="relative w-full h-[75vh]">
        {/* Feature Image with fallback */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${eventMedia?.featureImage || DEFAULT_FEATURE_IMAGE_URL})` 
          }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        </div>
        
        {/* Back button */}
        <div className="absolute top-32 left-6 z-10">
          <button 
            onClick={() => navigate('/events')}
            className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </button>
        </div>
        
        {/* Event info overlay (bottom left) */}
        <div className="absolute bottom-8 left-8 z-10 max-w-2xl">
          <div className="flex items-center mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${event.eventType === 'public' ? 'bg-purple-700 text-white' : 'bg-blue-700 text-white'} mr-3`}>
              {event.eventType === 'public' ? 
                <><Globe className="w-3 h-3 mr-1" /> Public Event</> : 
                <><Lock className="w-3 h-3 mr-1" /> Private Event</>
              }
            </span>
            <StatusBadge status={event.status} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{event.eventName}</h1>
          
          <div className="flex items-center text-white/90">
            <MapPin className="w-5 h-5 mr-2 text-white/70" />
            <span>{event.eventLocation}</span>
          </div>
        </div>
        
        {/* Date overlay (bottom right) */}
        <div className="absolute bottom-8 right-8 z-10">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg text-center">
            {event.eventDate && (
              <>
                <p className="text-white/80 uppercase text-sm font-medium">{formatMonthDay(event.eventDate).month}</p>
                <p className="text-white text-3xl font-bold">{formatMonthDay(event.eventDate).day}</p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Status banner for cancelled or change-requested events */}
      {(event.status === 'cancelled' || event.status === 'change-requested') && (
        <div className={`w-full py-3 px-6 flex items-center justify-center 
          ${event.status === 'cancelled' ? 'bg-red-600' : 'bg-yellow-600'} text-white`}>
          {event.status === 'cancelled' ? (
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
              <span className="font-bold">This event has been cancelled</span>
            </div>
          ) : (
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
              <span className="font-bold">Changes have been requested for this event</span>
            </div>
          )}
        </div>
      )}
      
      {/* Change-requested accept changes section */}
      {event.status === 'change-requested' && (
        <div className="bg-yellow-50 border border-yellow-200 mx-auto max-w-6xl mt-6 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-start mb-4 sm:mb-0">
              <Info className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800">Changes have been requested for this event</h3>
                <p className="text-yellow-700 mt-1">
                  Please review the updated event details and accept the changes if they meet your requirements.
                </p>
              </div>
            </div>
            <button
              onClick={handleAcceptChanges}
              disabled={processingStatus}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {processingStatus ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Essential Information */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Info className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-800">Essential Information</h2>
                  </div>
                </div>
                
                {/* Event Name */}
                <div className="mb-6 border-b border-gray-200 pb-4">
                  <h3 className="text-sm text-gray-500 font-medium mb-2">Event Name</h3>
                  <p className="text-lg font-semibold text-gray-900">{event.eventName}</p>
                </div>
                
                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  {/* Date */}
                  <div>
                    <h3 className="text-sm text-gray-500 font-medium mb-2">Event Date</h3>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-gray-800">{formatDate(event.eventDate)}</span>
                    </div>
                  </div>
                  
                  {/* Time */}
                  <div>
                    <h3 className="text-sm text-gray-500 font-medium mb-2">Event Time</h3>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-gray-800">{formatTime(event.eventTime)}</span>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div>
                    <h3 className="text-sm text-gray-500 font-medium mb-2">Location</h3>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-gray-800">{event.eventLocation}</span>
                    </div>
                  </div>
                  
                  {/* Guests */}
                  <div>
                    <h3 className="text-sm text-gray-500 font-medium mb-2">Expected Guests</h3>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-gray-800">{event.guestCount || 'Not specified'}</span>
                    </div>
                  </div>
                  
                  {/* Event Type */}
                  <div>
                    <h3 className="text-sm text-gray-500 font-medium mb-2">Event Type</h3>
                    <div className="flex items-center">
                      {event.eventType === 'public' ? (
                        <>
                          <Globe className="w-5 h-5 text-red-500 mr-2" />
                          <span className="text-gray-800">Public Event</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 text-red-500 mr-2" />
                          <span className="text-gray-800">Private Event</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div>
                    <h3 className="text-sm text-gray-500 font-medium mb-2">Status</h3>
                    <StatusBadge status={event.status} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Package Details */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Package2 className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-800">Package Details</h2>
                  </div>
                </div>
                
                {event.packageID ? (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{event.packageID.packageName}</h3>
                        <p className="text-gray-600 mt-1">{event.packageID.description}</p>
                      </div>
                      <div className="mt-3 md:mt-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-red-50 text-red-700">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Rs. {event.packageID.price?.toLocaleString() || 'Custom'}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setViewingPackage(event.packageID)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center"
                    >
                      <Info className="w-4 h-4 mr-1" />
                      View Package Details
                    </button>
                    
                    {/* Performances Section */}
                    {event.packageID.performances && event.packageID.performances.length > 0 && (
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                          <Music className="w-4 h-4 mr-1 text-red-500" />
                          Performances
                        </h3>
                        <div className="space-y-3">
                          {event.packageID.performances.map((performance, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-800">{performance.type}</span>
                                <span className="text-gray-600 text-sm">{performance.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-500">No package selected for this event</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Services */}
            {event.additionalServices && event.additionalServices.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-red-600" />
                      <h2 className="text-xl font-bold text-gray-800">Additional Services</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {event.additionalServices.map((service, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">{service.serviceID.serviceName}</h3>
                          <p className="text-gray-600 text-sm mt-1">{service.serviceID.description}</p>
                        </div>
                        <div className="flex items-center mt-3 sm:mt-0">
                          <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-sm font-medium mr-3">
                            Rs. {service.serviceID.price?.toLocaleString()}
                          </span>
                          <button 
                            onClick={() => setViewingService(service.serviceID)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Info className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Additional Requests */}
            {event.additionalRequests && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-800">Additional Requests</h2>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{event.additionalRequests}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Summary and Notes */}
          <div>
            {/* Event Summary */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="bg-red-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white">Event Summary</h2>
              </div>
              <div className="p-6">
                <div className="mb-4 flex justify-between">
                  <span className="text-gray-700">Package</span>
                  <span className="font-medium text-gray-900">
                    {event.packageID ? `Rs. ${event.packageID.price?.toLocaleString() || 'Custom'}` : 'No package'}
                  </span>
                </div>
                
                {event.additionalServices && event.additionalServices.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Additional Services</span>
                      <span className="font-medium text-gray-900">
                        Rs. {event.additionalServices.reduce((sum, service) => 
                          sum + (service.serviceID.price || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Service breakdown */}
                    <div className="ml-4 text-sm space-y-1 mt-2">
                      {event.additionalServices.map((service, index) => (
                        <div key={index} className="flex justify-between text-gray-600">
                          <span>{service.serviceID.serviceName}</span>
                          <span>Rs. {service.serviceID.price?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {event.packageID?.travelFees > 0 && (
                  <div className="mb-4 flex justify-between">
                    <span className="text-gray-700">Travel Fees</span>
                    <span className="font-medium text-gray-900">
                      Rs. {event.packageID.travelFees.toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-red-600">
                    Rs. {calculateTotalCost().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Event Notes */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-red-600" />
                  Notes & Updates
                </h2>
                
                {!addingNote && (
                  <button 
                    onClick={() => setAddingNote(true)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    + Add Note
                  </button>
                )}
              </div>
              
              <div className="p-6">
                {/* Add note form */}
                {addingNote && (
                  <div className="mb-6 border-b border-gray-200 pb-6">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this event..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={4}
                    ></textarea>
                    
                    <div className="flex justify-end mt-3 space-x-3">
                      <button 
                        onClick={() => {
                          setAddingNote(false);
                          setNewNote('');
                        }}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      
                      <button 
                        onClick={handleSubmitNote}
                        disabled={!newNote.trim() || submittingNote}
                        className={`px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center ${!newNote.trim() || submittingNote ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {submittingNote ? (
                          <>
                            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Notes list */}
                {notes.length > 0 ? (
                  <div className="space-y-4">
                    {notes.map((note, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        {editingNoteIndex === index ? (
                          <div>
                            <textarea
                              value={editedNoteContent}
                              onChange={(e) => setEditedNoteContent(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3"
                              rows={3}
                            ></textarea>
                            
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => {
                                  setEditingNoteIndex(null);
                                  setEditedNoteContent('');
                                }}
                                className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                              
                              <button 
                                onClick={() => handleUpdateNote(index)}
                                disabled={!editedNoteContent.trim()}
                                className={`px-2 py-1 text-xs bg-green-600 rounded text-white hover:bg-green-700 ${!editedNoteContent.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="font-medium text-gray-700">
                                  {note.createdBy.name} 
                                  <span className="text-gray-500 text-xs ml-1">({note.createdBy.role})</span>
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(note.createdAt).toLocaleString()}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
                            
                            {note.createdBy._id === user._id && (
                              <div className="flex justify-end mt-2 space-x-2">
                                <button 
                                  onClick={() => handleEditNote(index, note.content)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                                
                                <button 
                                  onClick={() => handleDeleteNote(index)}
                                  disabled={deletingNote}
                                  className="text-xs text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No notes yet. Add a note to keep track of important details or updates.
                  </div>
                )}
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

export default EventDetailsPage; 