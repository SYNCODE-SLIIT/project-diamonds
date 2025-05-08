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
  Receipt,
  CreditCard,
  Send,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Upload,
  Camera,
  Video,
  Link as LinkIcon,
  Phone,
  Save,
  CalendarIcon,
  RefreshCw
} from 'lucide-react';
import { 
  Facebook,
  Instagram,
  Youtube,
  Twitter
} from 'lucide-react';
import { fetchAllEvents, addNoteToEvent, updateEventNote, deleteEventNote, updateEventDetails } from '../../services/eventService';
import { fetchEventMedia, uploadEventFeatureImage, updateSocialMediaLinks } from '../../services/eventMediaService';
import { getPackageById, getPackages } from '../../services/packageService';
import { getAdditionalServices } from '../../services/additionalServiceService';
import PackageDetailsModal from '../../components/event/PackageDetailsModal';
import ServiceDetailsModal from '../../components/event/ServiceDetailsModal';
import assets from '../../assets/assets.js';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Default feature image from Cloudinary
const DEFAULT_FEATURE_IMAGE_URL = "https://res.cloudinary.com/du5c9fw6s/image/upload/v1746620459/default_event_j82gdq.jpg";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const fileInputRef = useRef(null);
  const posterInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const videosInputRef = useRef(null);
  
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [packageDetails, setPackageDetails] = useState(null);
  
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
              console.log("Package performances:", packageData.performances);
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

  // Add additional useEffect to load package details when event data is loaded
  useEffect(() => {
    if (event && event.packageID && event.packageID._id && (!event.packageID.performances || event.packageID.performances.length === 0)) {
      // If we have an event with package ID but no performances, load package details
      loadPackageDetails();
    }
  }, [event]);

  // Add a separate function to specifically load package performances
  const loadPackageDetails = async () => {
    if (event?.packageID && event.packageID._id) {
      try {
        toast.loading('Loading package details...', { id: 'package-loading' });
        console.log("Fetching package details for ID:", event.packageID._id);
        
        const packageData = await getPackageById(event.packageID._id);
        
        if (packageData) {
          console.log("Received package data:", packageData);
          console.log("Package ID:", packageData.packageID);
          console.log("Package Name:", packageData.packageName);
          console.log("Description:", packageData.description);
          console.log("Performances:", packageData.performances);
          console.log("Dance Styles:", packageData.danceStyles);
          console.log("Team Involvement:", packageData.teamInvolvement);
          console.log("Booking Terms:", packageData.bookingTerms);
          console.log("Price:", packageData.price);
          console.log("Image:", packageData.image);
          console.log("Type:", packageData.type);
          console.log("Status:", packageData.status);
          
          // Store complete package details
          setPackageDetails(packageData);
          
          // Update event with the complete package data
          setEvent(prev => ({
            ...prev,
            packageID: {
              ...packageData,
              performances: packageData.performances?.map(p => ({
                ...p,
                status: 'confirmed' // All package performances are considered confirmed
              })) || []
            }
          }));
          
          toast.success('Package details loaded successfully!', { id: 'package-loading' });
        } else {
          console.error("Package data is empty or undefined");
          toast.error('Failed to load package details.', { id: 'package-loading' });
        }
      } catch (error) {
        console.error('Error loading package details:', error);
        toast.error('Error loading package details: ' + error.message, { id: 'package-loading' });
      }
    } else {
      console.error("No package ID available", event?.packageID);
      toast.error('No package assigned to this event.', { id: 'package-loading' });
    }
  };

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
      
      // Update both the notes state and the event state with the new notes
      setNotes(response.allNotes);
      
      // Update the event object as well to keep it in sync
      setEvent({
        ...event,
        notes: response.allNotes
      });
      
      // Reset the form
      setNewNote('');
      setAddingNote(false);
      toast.success('Note added successfully');
      
      // Refresh event data to ensure all state is consistent
      await refreshEventData(false);
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
      
      // Update both states
      setNotes(response.allNotes);
      
      // Update the event object as well to keep it in sync
      setEvent({
        ...event,
        notes: response.allNotes
      });
      
      setEditingNoteIndex(null);
      toast.success('Note updated successfully');
      
      // Refresh event data to ensure all state is consistent
      await refreshEventData(false);
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async (index) => {
    try {
      setDeletingNote(true);
      const response = await deleteEventNote(id, index);
      
      // Update both states
      setNotes(response.allNotes);
      
      // Update the event object as well to keep it in sync
      setEvent({
        ...event,
        notes: response.allNotes
      });
      
      toast.success('Note deleted successfully');
      
      // Refresh event data to ensure all state is consistent
      await refreshEventData(false);
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

  // Handle feature image upload
  const handleFeatureImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP)');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      setUploadingImage(true);
      const response = await uploadEventFeatureImage(id, file);
      
      if (response.success) {
        // Update the event media state with the new feature image
        const updatedEventMedia = {
          ...eventMedia,
          featureImage: response.data.featureImage
        };
        
        setEventMedia(updatedEventMedia);
        toast.success('Feature image updated successfully!');
        
        // Refresh event data to ensure all state is consistent
        await refreshEventData(false);
      } else {
        toast.error('Failed to update feature image');
      }
    } catch (error) {
      console.error('Error uploading feature image:', error);
      toast.error('An error occurred while uploading the image');
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format month and day for the feature image overlay
  const formatMonthDay = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return { month, day };
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
            onClick={() => navigate('/admin/events')}
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
            onClick={() => navigate('/admin/events')}
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
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hidden file inputs for image/media uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFeatureImageUpload} 
      />
      
      <input 
        type="file" 
        ref={posterInputRef} 
        className="hidden" 
        accept="image/*" 
      />
      
      <input 
        type="file" 
        ref={imagesInputRef} 
        className="hidden" 
        accept="image/*" 
        multiple 
      />
      
      <input 
        type="file" 
        ref={videosInputRef} 
        className="hidden" 
        accept="video/*" 
        multiple 
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
        
        {/* Back button on top of the feature image */}
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => navigate('/admin/events')}
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
      
      {/* Status banner for cancelled or change-requested events - moved below feature image */}
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
      
      {/* Changes approval section - displayed only for events with change-requested status */}
      {event.status === 'change-requested' && (
        <div className="bg-yellow-50 border border-yellow-200 mx-auto max-w-6xl mt-6 p-6 rounded-lg">
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
            <div className="flex items-start">
              <Info className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 text-lg mb-1">Requested Changes</h3>
                <p className="text-gray-700">
                  The organizer has requested changes to this event. Review the details and approve the changes if everything looks correct.
                </p>
              </div>
            </div>
            <button 
              onClick={async () => {
                try {
                  // Show loading toast
                  toast.loading('Approving changes...', { id: 'approve-changes' });
                  
                  // Update event status to confirmed
                  const response = await updateEventDetails(id, { status: 'confirmed' });
                  
                  if (response.success) {
                    // Update the local state
                    setEvent({
                      ...event,
                      status: 'confirmed'
                    });
                    
                    toast.success('Changes approved successfully!', { id: 'approve-changes' });
                    
                    // Refresh event data
                    await refreshEventData(true);
                  } else {
                    toast.error(response.message || 'Failed to approve changes', { id: 'approve-changes' });
                  }
                } catch (error) {
                  console.error('Error approving changes:', error);
                  toast.error('An error occurred while approving changes', { id: 'approve-changes' });
                }
              }}
              className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center transition-colors"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Approve Changes
            </button>
          </div>
        </div>
      )}
      
      {/* Message for cancelled events explaining editing restrictions */}
      {event.status === 'cancelled' && (
        <div className="bg-red-50 border border-red-200 mx-auto max-w-6xl mt-6 p-4 rounded-lg">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">This event has been cancelled</h3>
              <p className="text-red-700 mt-1">
                All editing functionality has been disabled. Cancelled events cannot be modified.
                Please contact support if you need to reactivate this event.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content - increased space below the feature image */}
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
                  
                  {/* Edit button removed */}
                </div>
                
                {/* Event Name - Added at the top */}
                <div className="mb-6 border-b border-gray-200 pb-4">
                  <h3 className="text-sm text-gray-500 font-medium mb-2">Event Name</h3>
                  <p className="text-lg font-semibold text-gray-900">{event.eventName}</p>
                </div>
                
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 p-4">
                    <h3 className="text-sm text-gray-500 font-medium mb-2">Event Details</h3>
                    <div className="space-y-4">
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
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{event.eventLocation}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Guest Count</p>
                        <p className="font-medium">{event.guestCount} people</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Event Date</p>
                        <p className="font-medium">{formatDate(event.eventDate)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Event Time</p>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-800">Event Description</h2>
                  </div>
                  
                  {/* Edit button removed */}
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Music className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-800">Performances</h2>
                  </div>
                  
                  {event.packageID?._id && (
                    <button 
                      onClick={loadPackageDetails}
                      className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh Performances
                    </button>
                  )}
                </div>
                
                {event.packageID?.performances && event.packageID.performances.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {event.packageID.performances.map((performance, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{performance.name || performance.type || 'Standard Performance'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {performance.duration || '30 mins'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={performance.status || 'confirmed'} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    {event.packageID?._id ? (
                      <div>
                        <p className="text-gray-500 mb-3">No performances data found for this package.</p>
                        <button 
                          onClick={loadPackageDetails}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Load Performance Details
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500">No package selected for this event.</p>
                    )}
                  </div>
                )}
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
                  
                  {/* Edit button removed */}
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-800">Additional Services</h2>
                  </div>
                  
                  {/* Edit button removed */}
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
            
            {/* Poster Carousel */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-800">Event Poster</h2>
                  </div>
                  
                  {/* Upload button removed */}
                </div>
                
                {eventMedia?.poster ? (
                  <div className="aspect-[3/4] w-full">
                    <img 
                      src={eventMedia.poster} 
                      alt="Event poster" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">No poster uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Event Images Gallery */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-800">Event Images</h2>
                  </div>
                  
                  {/* Upload button removed */}
                </div>
                
                {eventMedia?.eventImages && eventMedia.eventImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {eventMedia.eventImages.map((image, index) => (
                      <div key={index} className="aspect-square">
                        <img 
                          src={image} 
                          alt={`Event image ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Camera className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">No event images uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Event Videos Carousel */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Video className="w-5 h-5 mr-2 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-800">Event Videos</h2>
                  </div>
                  
                  {/* Upload button removed */}
                </div>
                
                {eventMedia?.eventVideos && eventMedia.eventVideos.length > 0 ? (
                  <div className="space-y-4">
                    {eventMedia.eventVideos.map((video, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden">
                        <video 
                          src={video} 
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Video className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">No event videos uploaded yet</p>
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
            
            {/* Social Media Links */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <Globe className="w-5 h-5 mr-2 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-800">Social Media Links</h2>
                </div>
                
                {/* Social Media Link Cards */}
                <div className="space-y-4">
                  {/* Facebook */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3">
                          <Facebook className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Facebook</h3>
                          {eventMedia?.socialMediaLinks?.facebook ? (
                            <a 
                              href={eventMedia.socialMediaLinks.facebook} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              Click to view
                            </a>
                          ) : (
                            <p className="text-sm text-gray-500">Not provided</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Edit button removed */}
                    </div>
                  </div>
                  
                  {/* Instagram */}
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 text-white flex items-center justify-center mr-3">
                          <Instagram className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Instagram</h3>
                          {eventMedia?.socialMediaLinks?.instagram ? (
                            <a 
                              href={eventMedia.socialMediaLinks.instagram}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm text-purple-600 hover:underline flex items-center"
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              Click to view
                            </a>
                          ) : (
                            <p className="text-sm text-gray-500">Not provided</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Edit button removed */}
                    </div>
                  </div>
                  
                  {/* YouTube */}
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center mr-3">
                          <Youtube className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">YouTube</h3>
                          {eventMedia?.socialMediaLinks?.youtube ? (
                            <a 
                              href={eventMedia.socialMediaLinks.youtube}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm text-red-600 hover:underline flex items-center"
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              Click to view
                            </a>
                          ) : (
                            <p className="text-sm text-gray-500">Not provided</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Edit button removed */}
                    </div>
                  </div>
                  
                  {/* Twitter/X */}
                  <div className="bg-gradient-to-r from-sky-50 to-gray-100 rounded-lg p-4 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center mr-3">
                          <Twitter className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Twitter/X</h3>
                          {eventMedia?.socialMediaLinks?.twitter ? (
                            <a 
                              href={eventMedia.socialMediaLinks.twitter}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm text-sky-600 hover:underline flex items-center"
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              Click to view
                            </a>
                          ) : (
                            <p className="text-sm text-gray-500">Not provided</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Edit button removed */}
                    </div>
                  </div>
                  
                  {/* WhatsApp */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center mr-3">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">WhatsApp</h3>
                          {eventMedia?.socialMediaLinks?.whatsapp ? (
                            <a 
                              href={`https://wa.me/${eventMedia.socialMediaLinks.whatsapp.replace(/\D/g, '')}`}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm text-green-600 hover:underline flex items-center"
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              {eventMedia.socialMediaLinks.whatsapp}
                            </a>
                          ) : (
                            <p className="text-sm text-gray-500">Not provided</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Edit button removed */}
                    </div>
                  </div>
                </div>
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
                    className={`flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={addingNote || event.status === 'cancelled'}
                    title={event.status === 'cancelled' ? "Cannot add notes to cancelled events" : "Add Note"}
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
                                {(note.authorId === user?._id || note.author === user?.fullName) && event.status !== 'cancelled' && (
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