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
  const [editingSocialLink, setEditingSocialLink] = useState(null);
  const [editedSocialLinks, setEditedSocialLinks] = useState({});
  const [packageDetails, setPackageDetails] = useState(null);
  const [showPackageSelectionModal, setShowPackageSelectionModal] = useState(false);
  const [showServiceSelectionModal, setShowServiceSelectionModal] = useState(false);
  
  // States for editing event details
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedEventDetails, setEditedEventDetails] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [updatingEvent, setUpdatingEvent] = useState(false);
  
  // Check if we're in the admin path to determine where to navigate back to
  const isAdminPath = window.location.pathname.includes('/admin/');
  
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
      
      // Initialize edited event details with current values
      setEditedEventDetails({
        eventName: currentEvent.eventName || '',
        eventType: currentEvent.eventType || 'private',
        eventLocation: currentEvent.eventLocation || '',
        eventDate: currentEvent.eventDate ? new Date(currentEvent.eventDate) : null,
        eventTime: currentEvent.eventTime || { startDate: null, endDate: null },
        guestCount: currentEvent.guestCount || 0,
        additionalRequests: currentEvent.additionalRequests || ''
      });
      
      // Fetch event media
      try {
        const media = await fetchEventMedia(id);
        setEventMedia(media);
        
        // Initialize edited social links with current values
        if (media?.socialMediaLinks) {
          setEditedSocialLinks(media.socialMediaLinks);
        }
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
          weekday: 'short',
          month: 'short', 
          day: 'numeric',
          year: 'numeric',
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

  const saveSocialLink = async (platform) => {
    try {
      // Prevent saving if URL is malformed
      const url = editedSocialLinks[platform];
      if (url && !url.startsWith('https://') && !url.startsWith('http://')) {
        toast.error('Please enter a valid URL (starting with http:// or https://)');
        return;
      }
      
      // Create the updated social media links object
      const updatedLinks = {
        ...(eventMedia?.socialMediaLinks || {}),
        [platform]: url
      };
      
      // Make API call using the service function
      const response = await updateSocialMediaLinks(id, updatedLinks);
      
      if (response.success) {
        // Update the local state with the new social media links
        const updatedEventMedia = {
          ...eventMedia,
          socialMediaLinks: updatedLinks
        };
        
        setEventMedia(updatedEventMedia);
        toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} link updated!`);
        
        // Refresh data to ensure all state is consistent
        await refreshEventData(false);
      } else {
        toast.error('Failed to update social media link');
      }
      
      setEditingSocialLink(null);
    } catch (error) {
      console.error('Error updating social media link:', error);
      toast.error('An error occurred while updating the link');
    }
  };

  // Validate and save WhatsApp number
  const validateAndSaveWhatsApp = async () => {
    try {
      const phone = editedSocialLinks.whatsapp;
      
      if (!phone) {
        toast.error('Please enter a WhatsApp number');
        return;
      }
      
      // Basic validation for international phone number with country code
      // Should start with + followed by digits, spaces allowed
      const phoneRegex = /^\+\d{1,3}\s\d{2}\s\d{3}\s\d{4}$/;
      
      if (!phoneRegex.test(phone)) {
        toast.error('Please enter a valid phone number in the format: +XX XX XXX XXXX');
        return;
      }
      
      // Count total digits (excluding + and spaces)
      const digitCount = phone.replace(/[^\d]/g, '').length;
      
      // Country code (1-3 digits) + 9 digits = 10-12 total digits
      if (digitCount < 10 || digitCount > 12) {
        toast.error('Phone number should have correct number of digits (country code + 9 digits)');
        return;
      }
      
      // Create the updated social media links object
      const updatedLinks = {
        ...(eventMedia?.socialMediaLinks || {}),
        whatsapp: phone
      };
      
      // Make API call using the service function
      const response = await updateSocialMediaLinks(id, updatedLinks);
      
      if (response.success) {
        // Update the local state immediately
        const updatedEventMedia = {
          ...eventMedia,
          socialMediaLinks: updatedLinks
        };
        
        setEventMedia(updatedEventMedia);
        toast.success('WhatsApp number updated!');
        setEditingSocialLink(null);
        
        // Refresh data to ensure all state is consistent
        await refreshEventData(false);
      } else {
        toast.error('Failed to update WhatsApp number');
      }
    } catch (error) {
      console.error('Error updating WhatsApp number:', error);
      toast.error('An error occurred while updating the WhatsApp number');
    }
  };

  const handleWhatsAppNumberChange = (e) => {
    let input = e.target.value;
    
    // Only allow digits, plus sign, and spaces
    input = input.replace(/[^\d+\s]/g, '');
    
    // Ensure it starts with +
    if (input && !input.startsWith('+')) {
      input = '+' + input;
    }
    
    // Remove all spaces to start with a clean number
    const digitsOnly = input.replace(/\s/g, '');
    
    // Format the number with proper spacing
    let formatted = '';
    
    if (digitsOnly.length <= 1) {
      // Just the + sign
      formatted = digitsOnly;
    } else {
      // Extract country code (1-3 digits) and the rest of the number
      const countryCodeMatch = digitsOnly.match(/^\+(\d{1,3})/);
      
      if (countryCodeMatch) {
        const countryCode = countryCodeMatch[0]; // includes the + sign
        const restOfNumber = digitsOnly.substring(countryCode.length);
        
        // Add country code
        formatted = countryCode;
        
        // Add a space after country code if there are more digits
        if (restOfNumber.length > 0) {
          formatted += ' ';
          
          // Format the remaining digits as xx xxx xxxx
          if (restOfNumber.length <= 2) {
            // Just the first 2 digits
            formatted += restOfNumber;
          } else if (restOfNumber.length <= 5) {
            // First 2 digits + space + next digits
            formatted += restOfNumber.substring(0, 2) + ' ' + restOfNumber.substring(2);
          } else if (restOfNumber.length <= 9) {
            // First 2 digits + space + next 3 digits + space + last digits
            formatted += restOfNumber.substring(0, 2) + ' ' + 
                        restOfNumber.substring(2, 5) + ' ' + 
                        restOfNumber.substring(5);
          } else {
            // Limit to 9 digits after country code
            formatted += restOfNumber.substring(0, 2) + ' ' + 
                        restOfNumber.substring(2, 5) + ' ' + 
                        restOfNumber.substring(5, 9);
          }
        }
      } else {
        // Fallback if regex fails
        formatted = digitsOnly;
      }
    }
    
    setEditedSocialLinks({...editedSocialLinks, whatsapp: formatted});
  };

  const handleWhatsAppKeyDown = (e) => {
    if (e.key === 'Enter') {
      validateAndSaveWhatsApp();
    }
  };

  // Validate event details before saving
  const validateEventDetails = () => {
    const errors = {};
    
    // Event name validation
    if (editedEventDetails.eventName.trim().length < 2) {
      errors.eventName = 'Event name must be at least 2 characters.';
    }
    
    // Location validation
    if (editedEventDetails.eventLocation.trim().length < 2) {
      errors.eventLocation = 'Event location must be at least 2 characters.';
    }
    
    // Guest count validation
    if (!/^\d+$/.test(editedEventDetails.guestCount) || parseInt(editedEventDetails.guestCount) <= 0) {
      errors.guestCount = 'Guest count must be a positive whole number.';
    }
    
    // Event date validation
    if (!editedEventDetails.eventDate) {
      errors.eventDate = 'Event date is required.';
    } else {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const selectedDate = new Date(editedEventDetails.eventDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < currentDate) {
        errors.eventDate = 'Event date cannot be in the past.';
      }
    }
    
    // Event time validation
    if (editedEventDetails.eventTime) {
      const { startDate, endDate } = editedEventDetails.eventTime;
      
      if (!startDate) {
        errors.startDate = 'Start time is required.';
      }
      
      if (!endDate) {
        errors.endDate = 'End time is required.';
      }
      
      if (startDate && endDate) {
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        
        if (endDateTime <= startDateTime) {
          errors.endDate = 'End time must be after start time.';
        }
        
        // Check if start time is in the past for today's events
        const now = new Date();
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        
        if (editedEventDetails.eventDate) {
          const eventDate = new Date(editedEventDetails.eventDate);
          eventDate.setHours(0, 0, 0, 0);
          
          if (eventDate.getTime() === todayDate.getTime() && startDateTime < now) {
            errors.startDate = 'Start time cannot be in the past for today\'s event.';
          }
        }
      }
    } else {
      errors.startDate = 'Event times are required.';
    }
    
    // Description validation when editing description
    if (editingDescription && (!editedEventDetails.additionalRequests || editedEventDetails.additionalRequests.trim().length < 5)) {
      errors.additionalRequests = 'Description must be at least 5 characters.';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle change in event details form
  const handleEventDetailChange = (field, value) => {
    setEditedEventDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Live validation based on field type
    const errors = {...validationErrors};
    
    switch(field) {
      case 'eventName':
        if (!value || value.trim().length < 2) {
          errors.eventName = 'Event name must be at least 2 characters.';
        } else {
          delete errors.eventName;
        }
        break;
        
      case 'eventLocation':
        if (!value || value.trim().length < 2) {
          errors.eventLocation = 'Event location must be at least 2 characters.';
        } else {
          delete errors.eventLocation;
        }
        break;
        
      case 'guestCount':
        // Check if input is not a number or is negative or has decimal points
        if (!/^\d+$/.test(value) || parseInt(value) <= 0) {
          errors.guestCount = 'Guest count must be a positive whole number.';
        } else {
          delete errors.guestCount;
        }
        break;
        
      case 'additionalRequests':
        if (!value || value.trim().length < 5) {
          errors.additionalRequests = 'Description must be at least 5 characters.';
        } else {
          delete errors.additionalRequests;
        }
        break;
        
      default:
        // No validation for other fields
        break;
    }
    
    setValidationErrors(errors);
  };
  
  // Enhanced time change handler with real-time validation
  const handleTimeChange = (field, date) => {
    // If updating start time, ensure the date portion matches the event date
    if (field === 'startDate' && editedEventDetails.eventDate) {
      // Create a new date with the event date but keep the selected time
      const eventDate = new Date(editedEventDetails.eventDate);
      const selectedTime = date;
      
      // Set the hours, minutes, seconds from the selected time to the event date
      eventDate.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        selectedTime.getSeconds()
      );
      
      // Use this combined date as the start date
      date = eventDate;
      
      // Validate if time is in the past for today's date
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDateCopy = new Date(editedEventDetails.eventDate);
      eventDateCopy.setHours(0, 0, 0, 0);
      
      // Live validation for past time on today's date
      if (eventDateCopy.getTime() === today.getTime() && date < now) {
        setValidationErrors(prev => ({
          ...prev,
          startDate: 'Start time cannot be in the past for today\'s event.'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          startDate: undefined
        }));
      }
      
      // Automatically set end time to 1 hour after start time if no end time is set
      let endDate = editedEventDetails.eventTime?.endDate ? new Date(editedEventDetails.eventTime.endDate) : null;
      
      // If no end time or if existing end time is now before the new start time
      if (!endDate || endDate <= date) {
        endDate = new Date(date);
        endDate.setHours(endDate.getHours() + 1);
        
        // Update the end time along with the start time
        const updatedTimes = {
          startDate: date,
          endDate: endDate
        };
        
        setEditedEventDetails(prev => ({
          ...prev,
          eventTime: updatedTimes
        }));
        
        return; // Skip the rest of the function since we've already updated the state
      }
    }
    
    // For end time changes, we need to ensure it's after the start time
    if (field === 'endDate' && editedEventDetails.eventTime?.startDate) {
      const startDateTime = new Date(editedEventDetails.eventTime.startDate);
      
      // Check if end date/time is before start date/time
      if (date <= startDateTime) {
        // Set error
        setValidationErrors(prev => ({
          ...prev,
          endDate: 'End time must be after start time.'
        }));
        
        // If on the same day, automatically set the end time to 1 hour after start time
        if (date.toDateString() === startDateTime.toDateString()) {
          const correctedEndTime = new Date(startDateTime);
          correctedEndTime.setHours(correctedEndTime.getHours() + 1);
          
          // Update with the corrected time
          const updatedTimes = {
            ...editedEventDetails.eventTime,
            endDate: correctedEndTime
          };
          
          setEditedEventDetails(prev => ({
            ...prev,
            eventTime: updatedTimes
          }));
          
          return; // Skip the rest of the function
        }
      } else {
        // Clear error if end time is valid
        setValidationErrors(prev => ({
          ...prev,
          endDate: undefined
        }));
      }
    }
    
    const updatedTimes = {
      ...editedEventDetails.eventTime,
      [field]: date
    };
    
    setEditedEventDetails(prev => ({
      ...prev,
      eventTime: updatedTimes
    }));
    
    const errors = {...validationErrors};
    
    // Validate start and end times if both exist
    if (updatedTimes.startDate && updatedTimes.endDate) {
      const startDateTime = new Date(updatedTimes.startDate);
      const endDateTime = new Date(updatedTimes.endDate);
      
      if (endDateTime <= startDateTime) {
        errors.endDate = 'End time must be after start time.';
      } else {
        delete errors.endDate;
      }
    }
    
    setValidationErrors(errors);
  };

  // Function to handle date change with proper validation
  const handleDateChange = (date) => {
    setEditedEventDetails(prev => {
      // If we have a start time, update it to the new date while preserving the time
      let updatedEventTime = {...prev.eventTime};
      
      if (updatedEventTime.startDate) {
        const startDate = new Date(updatedEventTime.startDate);
        const newStartDate = new Date(date);
        
        // Keep the time part from the original start date, but update the date part
        newStartDate.setHours(
          startDate.getHours(),
          startDate.getMinutes(),
          startDate.getSeconds()
        );
        
        updatedEventTime.startDate = newStartDate;
        
        // If end date is before the new start date, update it too
        if (updatedEventTime.endDate) {
          const endDate = new Date(updatedEventTime.endDate);
          if (endDate < newStartDate) {
            // Create a new end date 1 hour after the start time
            const newEndDate = new Date(newStartDate);
            newEndDate.setHours(newEndDate.getHours() + 1);
            updatedEventTime.endDate = newEndDate;
          }
        }
      }
      
      return {
        ...prev,
        eventDate: date,
        eventTime: updatedEventTime
      };
    });
    
    const errors = {...validationErrors};
    
    // Validate that date is not in the past
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    if (date < currentDate) {
      errors.eventDate = 'Event date cannot be in the past.';
    } else {
      delete errors.eventDate;
    }
    
    setValidationErrors(errors);
  };

  // Save event details
  const saveEventDetails = async () => {
    // Validate the form
    if (!validateEventDetails()) {
      // Form has errors
      toast.error('Please fix the errors before saving.');
      return;
    }
    
    try {
      setUpdatingEvent(true);
      
      // Check if critical fields were changed to update status
      const criticalFieldsChanged = 
        event.eventLocation !== editedEventDetails.eventLocation ||
        event.guestCount.toString() !== editedEventDetails.guestCount.toString() ||
        new Date(event.eventDate).toDateString() !== new Date(editedEventDetails.eventDate).toDateString() ||
        JSON.stringify(event.eventTime) !== JSON.stringify(editedEventDetails.eventTime);
      
      // If critical fields changed and event is confirmed, update status to change-requested
      const updatedDetails = {
        ...editedEventDetails
      };
      
      if (criticalFieldsChanged && event.status === 'confirmed') {
        updatedDetails.status = 'change-requested';
      }
      
      const response = await updateEventDetails(id, updatedDetails);
      
      if (response.success) {
        // Update the local state with the complete event object
        setEvent({
          ...event,
          eventName: editedEventDetails.eventName,
          eventType: editedEventDetails.eventType,
          eventLocation: editedEventDetails.eventLocation,
          eventDate: editedEventDetails.eventDate,
          eventTime: editedEventDetails.eventTime,
          guestCount: editedEventDetails.guestCount,
          additionalRequests: editedEventDetails.additionalRequests,
          status: criticalFieldsChanged && event.status === 'confirmed' ? 'change-requested' : event.status
        });
        
        setEditingInfo(false);
        setEditingDescription(false);
        
        if (criticalFieldsChanged && event.status === 'confirmed') {
          toast.success('Event details updated! Status changed to "Change Requested"');
        } else {
          toast.success('Event details updated successfully!');
        }
        
        // Refresh all data to ensure consistency
        await refreshEventData(false);
      } else {
        toast.error(response.message || 'Failed to update event details.');
      }
    } catch (error) {
      console.error('Error updating event details:', error);
      toast.error(error.message || 'An error occurred while updating event details.');
    } finally {
      setUpdatingEvent(false);
    }
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
      
      {/* Feature Image Hero Section - removing the navbar space and increasing height to 75vh */}
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
        
        {/* Back button - moved down further */}
        <div className="absolute top-32 left-6 z-10">
          <button 
            onClick={() => navigate('/event-dashboard')}
            className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </button>
        </div>
        
        {/* Edit icon - moved down further */}
        <button
          onClick={triggerFileInput}
          disabled={uploadingImage || event.status === 'cancelled'}
          className={`absolute top-32 right-6 z-10 flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Change feature image"}
        >
          {uploadingImage ? (
            <span className="flex items-center">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              Uploading...
            </span>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Change Image
            </>
          )}
        </button>
        
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
                  
                  {!editingInfo ? (
                    <button 
                      onClick={() => setEditingInfo(true)}
                      className={`p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={event.status === 'cancelled'}
                      title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Edit event details"}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          // Reset form
                          setEditedEventDetails({
                            eventName: event.eventName || '',
                            eventType: event.eventType || 'private',
                            eventLocation: event.eventLocation || '',
                            eventDate: event.eventDate ? new Date(event.eventDate) : null,
                            eventTime: event.eventTime || { startDate: null, endDate: null },
                            guestCount: event.guestCount || 0,
                            additionalRequests: event.additionalRequests || ''
                          });
                          setEditingInfo(false);
                          setValidationErrors({});
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={updatingEvent}
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      <button 
                        onClick={saveEventDetails}
                        className="p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors"
                        disabled={updatingEvent}
                      >
                        {updatingEvent ? (
                          <div className="w-5 h-5 border-2 border-t-transparent border-green-500 rounded-full animate-spin"></div>
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Status Change Warning - Only show when editing */}
                {editingInfo && event.status === 'confirmed' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-700">
                        <strong>Important:</strong> Changes to location, guest count, event date or time will change the event status to "Change Requested" and require approval.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Event Name - Added at the top */}
                <div className="mb-6 border-b border-gray-200 pb-4">
                  <h3 className="text-sm text-gray-500 font-medium mb-2">Event Name</h3>
                  {!editingInfo ? (
                    <p className="text-lg font-semibold text-gray-900">{event.eventName}</p>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={editedEventDetails.eventName}
                        onChange={(e) => handleEventDetailChange('eventName', e.target.value)}
                        className={`w-full p-2 border ${validationErrors.eventName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500`}
                        placeholder="Enter event name"
                      />
                      {validationErrors.eventName && (
                        <p className="text-sm text-red-500 mt-1">{validationErrors.eventName}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 p-4">
                    <h3 className="text-sm text-gray-500 font-medium mb-2">Event Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Event Type</p>
                        {!editingInfo ? (
                          <p className="font-medium">{event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}</p>
                        ) : (
                          <div className="mt-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="event-type-private"
                                name="event-type"
                                value="private"
                                checked={editedEventDetails.eventType === 'private'}
                                onChange={() => handleEventDetailChange('eventType', 'private')}
                                className="h-4 w-4 text-red-600 focus:ring-red-500"
                              />
                              <label htmlFor="event-type-private" className="text-sm text-gray-700">Private</label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="event-type-public"
                                name="event-type"
                                value="public"
                                checked={editedEventDetails.eventType === 'public'}
                                onChange={() => handleEventDetailChange('eventType', 'public')}
                                className="h-4 w-4 text-red-600 focus:ring-red-500"
                              />
                              <label htmlFor="event-type-public" className="text-sm text-gray-700">Public</label>
                            </div>
                          </div>
                        )}
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
                        {!editingInfo ? (
                          <p className="font-medium">{event.eventLocation}</p>
                        ) : (
                          <div>
                            <input
                              type="text"
                              value={editedEventDetails.eventLocation}
                              onChange={(e) => handleEventDetailChange('eventLocation', e.target.value)}
                              className={`w-full p-2 border ${validationErrors.eventLocation ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500`}
                              placeholder="Enter event location"
                            />
                            {validationErrors.eventLocation && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.eventLocation}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Guest Count</p>
                        {!editingInfo ? (
                          <p className="font-medium">{event.guestCount} people</p>
                        ) : (
                          <div>
                            <input
                              type="text"
                              pattern="[0-9]*"
                              inputMode="numeric"
                              value={editedEventDetails.guestCount}
                              onChange={(e) => {
                                // Only allow positive integers
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                  handleEventDetailChange('guestCount', value);
                                }
                              }}
                              className={`w-full p-2 border ${validationErrors.guestCount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500`}
                              placeholder="Enter guest count"
                            />
                            {validationErrors.guestCount && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.guestCount}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Event Date</p>
                        {!editingInfo ? (
                          <p className="font-medium">{formatDate(event.eventDate)}</p>
                        ) : (
                          <div>
                            <div className={`border ${validationErrors.eventDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 bg-white`}>
                              <DatePicker
                                selected={editedEventDetails.eventDate}
                                onChange={handleDateChange}
                                minDate={new Date()}
                                dateFormat="MMMM d, yyyy"
                                className="w-full focus:outline-none"
                              />
                            </div>
                            {validationErrors.eventDate && (
                              <p className="text-sm text-red-500 mt-1">{validationErrors.eventDate}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Event Time</p>
                        {!editingInfo ? (
                          <p className="font-medium">{event.eventTime ? formatTime(event.eventTime) : 'Time not specified'}</p>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-gray-500">Start Time (on event date)</label>
                              <div className={`border ${validationErrors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 bg-white mt-1`}>
                                <DatePicker
                                  selected={editedEventDetails.eventTime?.startDate ? new Date(editedEventDetails.eventTime.startDate) : null}
                                  onChange={(date) => handleTimeChange('startDate', date)}
                                  showTimeSelect
                                  showTimeSelectOnly
                                  timeFormat="h:mm aa"
                                  timeIntervals={15}
                                  timeCaption="Time"
                                  className="w-full focus:outline-none"
                                  placeholderText="Select start time"
                                  dateFormat="h:mm aa"
                                  disabled={!editedEventDetails.eventDate}
                                />
                              </div>
                              {validationErrors.startDate && (
                                <p className="text-sm text-red-500 mt-1">{validationErrors.startDate}</p>
                              )}
                              {!editedEventDetails.eventDate && (
                                <p className="text-xs text-amber-500 mt-1">Please select an event date first</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="text-xs text-gray-500">End Date & Time</label>
                              <div className={`border ${validationErrors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 bg-white mt-1`}>
                                <DatePicker
                                  selected={editedEventDetails.eventTime?.endDate ? new Date(editedEventDetails.eventTime.endDate) : null}
                                  onChange={(date) => handleTimeChange('endDate', date)}
                                  showTimeSelect
                                  dateFormat="MMMM d, yyyy h:mm aa"
                                  timeFormat="h:mm aa"
                                  timeIntervals={15}
                                  timeCaption="Time"
                                  className="w-full focus:outline-none"
                                  placeholderText="Select end date and time"
                                  minDate={editedEventDetails.eventTime?.startDate ? new Date(editedEventDetails.eventTime.startDate) : editedEventDetails.eventDate}
                                  disabled={!editedEventDetails.eventTime?.startDate}
                                />
                              </div>
                              {validationErrors.endDate && (
                                <p className="text-sm text-red-500 mt-1">{validationErrors.endDate}</p>
                              )}
                              {!editedEventDetails.eventTime?.startDate && (
                                <p className="text-xs text-amber-500 mt-1">Please select a start time first</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 italic">
                              Note: Start time will use the event date. End time can be on event date or later.
                              Changing these details will set the event status to "Change Requested".
                            </p>
                          </div>
                        )}
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
                  
                  {!editingDescription ? (
                    <button 
                      onClick={() => setEditingDescription(true)}
                      className={`p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={event.status === 'cancelled'}
                      title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Edit description"}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          // Reset form
                          setEditedEventDetails(prev => ({
                            ...prev,
                            additionalRequests: event.additionalRequests || ''
                          }));
                          setEditingDescription(false);
                          setValidationErrors(prev => ({
                            ...prev,
                            additionalRequests: null
                          }));
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={updatingEvent}
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      <button 
                        onClick={saveEventDetails}
                        className="p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors"
                        disabled={updatingEvent || validationErrors.additionalRequests}
                      >
                        {updatingEvent ? (
                          <div className="w-5 h-5 border-2 border-t-transparent border-green-500 rounded-full animate-spin"></div>
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="prose max-w-none">
                  {!editingDescription ? (
                    event.additionalRequests ? (
                      <p>{event.additionalRequests}</p>
                    ) : (
                      <p className="text-gray-500 italic">No description provided for this event.</p>
                    )
                  ) : (
                    <div>
                      <textarea
                        value={editedEventDetails.additionalRequests || ''}
                        onChange={(e) => handleEventDetailChange('additionalRequests', e.target.value)}
                        className={`w-full p-3 min-h-[120px] border ${validationErrors.additionalRequests ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500`}
                        placeholder="Enter event description (minimum 5 characters)"
                      />
                      {validationErrors.additionalRequests && (
                        <p className="text-sm text-red-500 mt-1">{validationErrors.additionalRequests}</p>
                      )}
                    </div>
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
                  
                  <button 
                    onClick={() => setShowPackageSelectionModal(true)}
                    className={`p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Change Package"}
                    disabled={event.status === 'cancelled'}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
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
                  
                  <button 
                    onClick={() => setShowServiceSelectionModal(true)}
                    className={`p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Edit Services"}
                    disabled={event.status === 'cancelled'}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
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
                  
                  <button 
                    onClick={() => posterInputRef.current.click()}
                    className={`mt-4 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={event.status === 'cancelled'}
                    title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Upload Poster"}
                  >
                    <Plus className="w-4 h-4 mr-1 inline" />
                    Upload Poster
                  </button>
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
                    <button 
                      className={`mt-4 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => posterInputRef.current.click()}
                      disabled={event.status === 'cancelled'}
                      title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Upload Poster"}
                    >
                      <Plus className="w-4 h-4 mr-1 inline" />
                      Upload Poster
                    </button>
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
                  
                  <button 
                    onClick={() => imagesInputRef.current.click()}
                    className={`flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={event.status === 'cancelled'}
                    title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Add Images"}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Images
                  </button>
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
                    <button 
                      onClick={() => imagesInputRef.current.click()}
                      className={`mt-4 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={event.status === 'cancelled'}
                      title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Upload Images"}
                    >
                      <Plus className="w-4 h-4 mr-1 inline" />
                      Upload Images
                    </button>
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
                  
                  <button 
                    onClick={() => videosInputRef.current.click()}
                    className={`flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={event.status === 'cancelled'}
                    title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Add Videos"}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Videos
                  </button>
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
                    <button 
                      onClick={() => videosInputRef.current.click()}
                      className={`mt-4 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={event.status === 'cancelled'}
                      title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Upload Videos"}
                    >
                      <Plus className="w-4 h-4 mr-1 inline" />
                      Upload Videos
                    </button>
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
                      
                      <button 
                        className={`text-gray-500 hover:text-blue-600 transition-colors ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => setEditingSocialLink('facebook')}
                        disabled={event.status === 'cancelled'}
                        title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Edit Facebook link"}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {editingSocialLink === 'facebook' && (
                      <div className="mt-3 flex gap-2">
                        <input 
                          type="text" 
                          value={editedSocialLinks.facebook || ''}
                          onChange={(e) => setEditedSocialLinks({...editedSocialLinks, facebook: e.target.value})}
                          placeholder="https://facebook.com/yourpage"
                          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button 
                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                          onClick={() => saveSocialLink('facebook')}
                        >
                          Save
                        </button>
                        <button 
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                          onClick={() => setEditingSocialLink(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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
                      
                      <button 
                        className={`text-gray-500 hover:text-purple-600 transition-colors ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => setEditingSocialLink('instagram')}
                        disabled={event.status === 'cancelled'}
                        title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Edit Instagram link"}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {editingSocialLink === 'instagram' && (
                      <div className="mt-3 flex gap-2">
                        <input 
                          type="text" 
                          value={editedSocialLinks.instagram || ''}
                          onChange={(e) => setEditedSocialLinks({...editedSocialLinks, instagram: e.target.value})}
                          placeholder="https://instagram.com/yourhandle"
                          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button 
                          className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md text-sm"
                          onClick={() => saveSocialLink('instagram')}
                        >
                          Save
                        </button>
                        <button 
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                          onClick={() => setEditingSocialLink(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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
                      
                      <button 
                        className={`text-gray-500 hover:text-red-600 transition-colors ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => setEditingSocialLink('youtube')}
                        disabled={event.status === 'cancelled'}
                        title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Edit YouTube link"}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {editingSocialLink === 'youtube' && (
                      <div className="mt-3 flex gap-2">
                        <input 
                          type="text" 
                          value={editedSocialLinks.youtube || ''}
                          onChange={(e) => setEditedSocialLinks({...editedSocialLinks, youtube: e.target.value})}
                          placeholder="https://youtube.com/channel/your-channel"
                          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <button 
                          className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                          onClick={() => saveSocialLink('youtube')}
                        >
                          Save
                        </button>
                        <button 
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                          onClick={() => setEditingSocialLink(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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
                      
                      <button 
                        className={`text-gray-500 hover:text-sky-600 transition-colors ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => setEditingSocialLink('twitter')}
                        disabled={event.status === 'cancelled'}
                        title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Edit Twitter link"}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {editingSocialLink === 'twitter' && (
                      <div className="mt-3 flex gap-2">
                        <input 
                          type="text" 
                          value={editedSocialLinks.twitter || ''}
                          onChange={(e) => setEditedSocialLinks({...editedSocialLinks, twitter: e.target.value})}
                          placeholder="https://twitter.com/yourhandle"
                          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button 
                          className="px-3 py-1 bg-black text-white rounded-md text-sm"
                          onClick={() => saveSocialLink('twitter')}
                        >
                          Save
                        </button>
                        <button 
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                          onClick={() => setEditingSocialLink(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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
                      
                      <button 
                        className={`text-gray-500 hover:text-green-600 transition-colors ${event.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => setEditingSocialLink('whatsapp')}
                        disabled={event.status === 'cancelled'}
                        title={event.status === 'cancelled' ? "Cannot edit cancelled events" : "Edit WhatsApp number"}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {editingSocialLink === 'whatsapp' && (
                      <div className="mt-3 flex flex-col">
                        <div className="mb-1">
                          <input 
                            type="tel" 
                            value={editedSocialLinks.whatsapp || ''}
                            onChange={handleWhatsAppNumberChange}
                            onKeyDown={handleWhatsAppKeyDown}
                            placeholder="+94 77 678 3345"
                            maxLength={19} // +xxx(space)xx(space)xxx(space)xxxx = max 19 chars
                            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Format: +[country code] xx xxx xxxx (e.g., +94 77 678 3345)
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button 
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                            onClick={() => validateAndSaveWhatsApp()}
                          >
                            Save
                          </button>
                          <button 
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                            onClick={() => setEditingSocialLink(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
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

      {/* Package Selection Modal */}
      {showPackageSelectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Change Package</h2>
                <button 
                  onClick={() => setShowPackageSelectionModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <PackageSelectionContent 
                eventId={id} 
                currentPackageId={event?.packageID?._id} 
                onClose={() => setShowPackageSelectionModal(false)}
                onPackageSelected={() => {
                  setShowPackageSelectionModal(false);
                  refreshEventData(true);
                }}
                event={event}
              />
            </div>
          </div>
        </div>
      )}

      {/* Service Selection Modal */}
      {showServiceSelectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Additional Services</h2>
                <button 
                  onClick={() => setShowServiceSelectionModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <ServiceSelectionContent 
                eventId={id} 
                currentServices={event?.additionalServices || []} 
                onClose={() => setShowServiceSelectionModal(false)}
                onServicesUpdated={() => {
                  setShowServiceSelectionModal(false);
                  refreshEventData(true);
                }}
                event={event}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Package Selection Content Component
const PackageSelectionContent = ({ eventId, currentPackageId, onClose, onPackageSelected, event }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(currentPackageId);
  const [updating, setUpdating] = useState(false);
  const [showCreateCustom, setShowCreateCustom] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await getPackages();
        // Filter only system packages (assuming there's a field to identify them)
        // If there's no specific field, you might need to adjust this filter
        const systemPackages = data.filter(pkg => pkg.type === 'system' || !pkg.type);
        setPackages(systemPackages);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleUpdatePackage = async () => {
    if (!selectedPackageId) {
      toast.error('Please select a package');
      return;
    }

    try {
      setUpdating(true);
      // Use the updateEventDetails function from eventService
      const updateData = { 
        packageID: selectedPackageId 
      };
      
      // If event is confirmed, change status to change-requested
      if (currentPackageId !== selectedPackageId && event.status === 'confirmed') {
        updateData.status = 'change-requested';
      }
      
      const response = await updateEventDetails(eventId, updateData);
      
      if (response.success) {
        if (currentPackageId !== selectedPackageId && event.status === 'confirmed') {
          toast.success('Package updated! Status changed to "Change Requested"');
        } else {
          toast.success('Package updated successfully!');
        }
        onPackageSelected();
      } else {
        toast.error(response.message || 'Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('An error occurred while updating the package');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateCustomPackage = () => {
    // Switch to custom package creation view
    setShowCreateCustom(true);
  };

  const handleBackToPackages = () => {
    // Go back to package selection
    setShowCreateCustom(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">{error}</p>
        <button 
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  if (showCreateCustom) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={handleBackToPackages}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Packages
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Custom Package Creation</h3>
          <p className="text-sm text-gray-600 mb-4">
            This feature allows you to create a tailored package specifically for this event.
            Please note that custom packages need to be approved by the management team.
          </p>
          <p className="text-sm font-medium text-red-600">
            Custom package creation is under development. Please contact our team directly for custom package requests.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={handleBackToPackages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Select a package from our standard offerings. Need something custom? Click "Create Custom Package" below.
        </p>

        {/* Status Change Warning - only show for confirmed events */}
        {event?.status === 'confirmed' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-700">
                <strong>Important:</strong> Changing the package will set the event status to "Change Requested" and require approval.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {packages.map((pkg) => (
          <div 
            key={pkg._id} 
            className={`border rounded-lg p-4 cursor-pointer transition-all
              ${selectedPackageId === pkg._id 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50/30'}`}
            onClick={() => setSelectedPackageId(pkg._id)}
          >
            <div className="flex gap-4">
              {pkg.image && (
                <img 
                  src={pkg.image} 
                  alt={pkg.packageName} 
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{pkg.packageName}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm font-medium text-gray-700">
                    Rs. {pkg.price.toLocaleString()}
                  </p>
                  {selectedPackageId === pkg._id && (
                    <CheckCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Create Custom Package Option */}
        <div 
          className="border-2 border-dashed border-red-300 rounded-lg p-4 cursor-pointer hover:bg-red-50/30 transition-all"
          onClick={handleCreateCustomPackage}
        >
          <div className="flex flex-col items-center justify-center h-full py-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-400 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Create Custom Package</h3>
            <p className="text-sm text-gray-600">
              Design a tailored package for this event
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          disabled={updating}
        >
          Cancel
        </button>
        <button 
          onClick={handleUpdatePackage}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          disabled={updating || !selectedPackageId || selectedPackageId === currentPackageId}
        >
          {updating ? (
            <span className="flex items-center">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              Updating...
            </span>
          ) : 'Update Package'}
        </button>
      </div>
    </div>
  );
};

// Service Selection Content Component
const ServiceSelectionContent = ({ eventId, currentServices, onClose, onServicesUpdated, event }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const servicesData = await getAdditionalServices();
        setServices(servicesData);
        
        // Set initial selected services based on current services
        if (currentServices && currentServices.length > 0) {
          const initialSelected = currentServices.map(service => service.serviceID._id);
          setSelectedServices(initialSelected);
        }
      } catch (err) {
        console.error('Error fetching additional services:', err);
        setError('Failed to load additional services. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [currentServices]);

  const toggleServiceSelection = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleUpdateServices = async () => {
    try {
      setUpdating(true);
      
      // Format the selected services for the API
      const formattedServices = selectedServices.map(serviceId => ({
        serviceID: serviceId
      }));
      
      // Check if services have changed
      const servicesChanged = isServiceChanged();
      
      // Create update data
      const updateData = { 
        additionalServices: formattedServices 
      };
      
      // If services changed and event is confirmed, update status to change-requested
      if (servicesChanged && event.status === 'confirmed') {
        updateData.status = 'change-requested';
      }
      
      // Use updateEventDetails to update the additional services
      const response = await updateEventDetails(eventId, updateData);
      
      if (response.success) {
        if (servicesChanged && event.status === 'confirmed') {
          toast.success('Services updated! Status changed to "Change Requested"');
        } else {
          toast.success('Services updated successfully!');
        }
        onServicesUpdated();
      } else {
        toast.error(response.message || 'Failed to update services');
      }
    } catch (error) {
      console.error('Error updating services:', error);
      toast.error('An error occurred while updating services');
    } finally {
      setUpdating(false);
    }
  };

  const isServiceChanged = () => {
    if (!currentServices) return selectedServices.length > 0;
    
    const currentServiceIds = currentServices.map(service => service.serviceID._id);
    
    // Check if arrays have different lengths
    if (currentServiceIds.length !== selectedServices.length) return true;
    
    // Check if all current services are in selected services and vice versa
    return !currentServiceIds.every(id => selectedServices.includes(id)) || 
           !selectedServices.every(id => currentServiceIds.includes(id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">{error}</p>
        <button 
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Select the additional services you'd like to add to this event:
      </p>
      
      {/* Status Change Warning - only show for confirmed events */}
      {event?.status === 'confirmed' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-700">
              <strong>Important:</strong> Changing additional services will set the event status to "Change Requested" and require approval.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {services.map((service) => (
          <div 
            key={service._id} 
            className={`border rounded-lg p-4 cursor-pointer transition-all
              ${selectedServices.includes(service._id) 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`}
            onClick={() => toggleServiceSelection(service._id)}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{service.serviceName}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                <p className="text-sm font-medium text-gray-700 mt-2">
                  Rs. {service.price.toLocaleString()}
                </p>
              </div>
              <div className="flex-shrink-0">
                {selectedServices.includes(service._id) ? (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show total cost */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total for selected services:</span>
          <span className="font-bold text-lg">Rs. {
            services
              .filter(service => selectedServices.includes(service._id))
              .reduce((sum, service) => sum + service.price, 0)
              .toLocaleString()
          }</span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          disabled={updating}
        >
          Cancel
        </button>
        <button 
          onClick={handleUpdateServices}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={updating || !isServiceChanged()}
        >
          {updating ? (
            <span className="flex items-center">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              Updating...
            </span>
          ) : 'Update Services'}
        </button>
      </div>
    </div>
  );
};

export default EventDetailPage; 