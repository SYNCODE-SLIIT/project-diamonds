import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRequestsByOrganizer, updateRequest } from '../../services/eventRequestService';
import { getPackages } from '../../services/packageService';
import { getAdditionalServices } from '../../services/additionalServiceService';
import { UserContext } from '../../context/userContext';
import assets from '../../assets/assets.js';
import { 
  CalendarCheckIcon, 
  Package2Icon, 
  PlusIcon, 
  CheckIcon, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  AlertTriangle 
} from 'lucide-react';
import PackageDetailsModal from '../../components/event/PackageDetailsModal';

const EventRequestEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [step, setStep] = useState(1);
  const [originalRequest, setOriginalRequest] = useState(null);
  const [systemPackages, setSystemPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [viewingPackage, setViewingPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    eventName: '',
    eventLocation: '',
    guestCount: '',
    eventDate: '',
    eventType: 'private',
    eventTime: {
      startDate: '',
      endDate: ''
    },
    remarks: '',
    selectedPackageID: '',
    selectedServices: [],
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch the original request and reference data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?._id) return;
        
        // Fetch event request
        const requests = await fetchRequestsByOrganizer(user._id);
        const currentRequest = requests.find(req => req._id === id);
        
        if (!currentRequest) {
          setError("Event request not found");
          setLoading(false);
          return;
        }
        
        setOriginalRequest(currentRequest);
        
        // Convert old format to new if needed
        let startDate, endDate;
        
        if (currentRequest.eventTime.startDate) {
          startDate = currentRequest.eventTime.startDate;
          endDate = currentRequest.eventTime.endDate;
        } else if (currentRequest.eventTime.start) {
          // Convert old format (time only) to date-time
          const eventDate = new Date(currentRequest.eventDate);
          
          // Start time
          const [startHours, startMinutes] = currentRequest.eventTime.start.split(':').map(Number);
          startDate = new Date(eventDate);
          startDate.setHours(startHours, startMinutes, 0);
          
          // End time
          const [endHours, endMinutes] = currentRequest.eventTime.end.split(':').map(Number);
          endDate = new Date(eventDate);
          endDate.setHours(endHours, endMinutes, 0);
          
          // If end time is before start time, it's likely the next day
          if (endDate < startDate) {
            endDate.setDate(endDate.getDate() + 1);
          }
        }
        
        // Initialize form data
        setFormData({
          eventName: currentRequest.eventName,
          eventLocation: currentRequest.eventLocation,
          guestCount: currentRequest.guestCount,
          eventDate: currentRequest.eventDate?.slice(0, 10),
          eventType: currentRequest.eventType || 'private',
          eventTime: {
            startDate: startDate ? new Date(startDate).toISOString().slice(0, 16) : '',
            endDate: endDate ? new Date(endDate).toISOString().slice(0, 16) : ''
          },
          remarks: currentRequest.remarks || '',
          selectedPackageID: currentRequest.packageID?._id || '',
          selectedServices: currentRequest.additionalServices?.map(s => s.serviceID._id) || [],
        });
        
        // Fetch packages and services
        const pkgs = await getPackages();
        setSystemPackages(pkgs.filter(p => p.status === 'approved'));
        
        const srvs = await getAdditionalServices();
        setServices(srvs.filter(s => s.status === 'available'));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load request data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'eventDate') {
      // When event date changes, update both the eventDate and the date portion of startDate
      setFormData(prev => {
        // Get the current time portion from startDate
        let updatedStartDate = prev.eventTime.startDate;
        
        if (value) {
          const currentStartDateTime = new Date(prev.eventTime.startDate);
          // Create a new date with the selected date but keep the current time
          const newStartDate = new Date(value);
          newStartDate.setHours(
            currentStartDateTime.getHours(),
            currentStartDateTime.getMinutes(),
            0, 0
          );
          updatedStartDate = newStartDate.toISOString().slice(0, 16);
        }
        
        return {
          ...prev,
          [name]: value,
          eventTime: {
            ...prev.eventTime,
            startDate: updatedStartDate
          }
        };
      });
    } else if (name === 'eventTime.startDate') {
      const [field, subfield] = name.split('.');
      
      // When changing start time, ensure the date portion matches the event date
      if (formData.eventDate) {
        const selectedDateTime = new Date(value);
        const eventDate = new Date(formData.eventDate);
        
        // If the date portion of startDate doesn't match eventDate, adjust it
        if (selectedDateTime.getDate() !== eventDate.getDate() ||
            selectedDateTime.getMonth() !== eventDate.getMonth() ||
            selectedDateTime.getFullYear() !== eventDate.getFullYear()) {
          
          // Create a new date with the event date but keep the selected time
          eventDate.setHours(
            selectedDateTime.getHours(),
            selectedDateTime.getMinutes(),
            0, 0
          );
          
          const updatedStartDate = eventDate.toISOString().slice(0, 16);
          
          setFormData(prev => ({
            ...prev,
            [field]: {
              ...prev[field],
              [subfield]: updatedStartDate
            }
          }));
          
          return;
        }
      }
      
      // Normal processing for start time when event date matches
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subfield]: value
        }
      }));
    } else if (name === 'eventTime.endDate') {
      const [field, subfield] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subfield]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.eventName.trim()) {
      newErrors.eventName = 'Event name is required';
    }

    if (!formData.eventLocation.trim()) {
      newErrors.eventLocation = 'Event location is required';
    }

    if (!formData.guestCount || formData.guestCount < 1) {
      newErrors.guestCount = 'Guest count must be at least 1';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else {
      // Validate event date is not in the past and at least 5 days from today
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      const minDate = new Date();
      minDate.setDate(today.getDate() + 5);
      
      if (selectedDate < minDate) {
        newErrors.eventDate = 'Please book at least 5 days in advance';
      }
    }
    
    if (!formData.eventTime.startDate) {
      newErrors['eventTime.startDate'] = 'Start date and time is required';
    } else {
      // Validate start date/time is not in the past
      const startDate = new Date(formData.eventTime.startDate);
      const today = new Date();
      const minDate = new Date();
      minDate.setDate(today.getDate() + 5);
      
      if (startDate < minDate) {
        newErrors['eventTime.startDate'] = 'Please book event start at least 5 days in advance';
      }
    }
    
    if (!formData.eventTime.endDate) {
      newErrors['eventTime.endDate'] = 'End date and time is required';
    }
    
    // Validate that start date matches event date
    if (formData.eventDate && formData.eventTime.startDate) {
      const eventDate = new Date(formData.eventDate);
      const startDate = new Date(formData.eventTime.startDate);
      
      // Check if the date parts match
      if (eventDate.getDate() !== startDate.getDate() || 
          eventDate.getMonth() !== startDate.getMonth() || 
          eventDate.getFullYear() !== startDate.getFullYear()) {
        newErrors['eventTime.startDate'] = 'Start date must match the event date';
      }
    }
    
    // Validate that end time is after start time
    if (formData.eventTime.startDate && formData.eventTime.endDate) {
      const startDate = new Date(formData.eventTime.startDate);
      const endDate = new Date(formData.eventTime.endDate);
      
      if (endDate <= startDate) {
        newErrors['eventTime.endDate'] = 'End date/time must be after start date/time';
      }
      
      // Check minimum duration (10 minutes)
      const diffMs = endDate - startDate;
      const diffMinutes = diffMs / (1000 * 60);
      
      if (diffMinutes < 10) {
        newErrors['eventTime.endDate'] = 'Event must last at least 10 minutes';
      }
      
      // Verify that end date is not before event date
      if (formData.eventDate) {
        const eventDate = new Date(formData.eventDate);
        // Reset time to beginning of day for comparison
        eventDate.setHours(0, 0, 0, 0);
        
        const endDateTime = new Date(formData.eventTime.endDate);
        const endDateDay = endDateTime.getDate();
        const endDateMonth = endDateTime.getMonth();
        const endDateYear = endDateTime.getFullYear();
        
        const eventDateDay = eventDate.getDate();
        const eventDateMonth = eventDate.getMonth();
        const eventDateYear = eventDate.getFullYear();
        
        // If end date is before event date
        if (new Date(endDateYear, endDateMonth, endDateDay) < new Date(eventDateYear, eventDateMonth, eventDateDay)) {
          newErrors['eventTime.endDate'] = 'End date cannot be before the event date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.selectedPackageID) {
      newErrors.selectedPackageID = 'Please select a package';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation between steps
  const nextStep = () => {
    let isValid = false;
    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  // Toggle service selection
  const toggleService = (serviceId) => {
    setFormData(prev => {
      const services = [...prev.selectedServices];
      
      if (services.includes(serviceId)) {
        return {
          ...prev,
          selectedServices: services.filter(id => id !== serviceId)
        };
      } else {
        return {
          ...prev,
          selectedServices: [...services, serviceId]
        };
      }
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Create payload
      const payload = {
        eventName: formData.eventName,
        eventLocation: formData.eventLocation,
        eventType: formData.eventType,
        eventTime: formData.eventTime,
        guestCount: Number(formData.guestCount),
        eventDate: formData.eventDate,
        packageID: formData.selectedPackageID,
        additionalServices: formData.selectedServices.map(id => ({ serviceID: id })),
        remarks: formData.remarks
      };
      
      // Call API
      await updateRequest(id, payload);
      
      // Redirect on success
      navigate(`/event-requests/${id}`);
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Main UI Components
  const ProgressIndicator = () => {
    const steps = [
      { number: 1, title: 'Enter Event Details', icon: <CalendarCheckIcon className="w-6 h-6" /> },
      { number: 2, title: 'Select Package', icon: <Package2Icon className="w-6 h-6" /> },
      { number: 3, title: 'Add Additional Services', icon: <PlusIcon className="w-6 h-6" /> },
      { number: 4, title: 'Confirmation', icon: <CheckIcon className="w-6 h-6" /> }
    ];

    const getStepStatus = (stepNumber) => {
      if (stepNumber < step) return 'completed';
      if (stepNumber === step) return 'current';
      return 'upcoming';
    };

    return (
      <div className="bg-gradient-to-r from-red-900 to-red-700 text-white rounded-xl">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Edit Event Request</h2>
              <p className="text-sm text-white/80">Update the details of your event request</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center relative">
            {steps.map((stepItem, index) => {
              const status = getStepStatus(stepItem.number);
              
              return (
                <div key={stepItem.number} className="flex flex-col items-center z-10 w-1/4">
                  {/* Step Card */}
                  <div 
                    className={`
                      w-full max-w-[200px] aspect-[3/2] rounded-lg mb-3 p-4 flex flex-col justify-between
                      ${status === 'current' ? 'bg-white/25 shadow-md' : 
                        status === 'completed' ? 'bg-white/20' : 'bg-white/10'}
                      transition-all duration-300 transform
                      ${status === 'current' ? 'scale-110' : 'scale-100'}
                      backdrop-blur-sm border border-white/10 hover:border-white/20
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center justify-center bg-red-800/80 rounded-full w-8 h-8 shadow-sm">
                        {status === 'completed' ? 
                          <CheckIcon className="w-5 h-5 text-white" /> :
                          <div className="text-white font-medium">{stepItem.icon}</div>
                        }
                      </div>
                      <span className="text-white/90 text-xs font-medium">Step {stepItem.number}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mt-2">{stepItem.title}</h3>
                  </div>
                  
                  {/* Status Label */}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full 
                    ${status === 'completed' ? 'bg-green-800/30 text-green-100' : 
                     status === 'current' ? 'bg-white/20 text-white' : 
                     'bg-white/10 text-white/70'}`}>
                    {status === 'completed' ? 'Completed' : 
                     status === 'current' ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              );
            })}
            
            {/* Connector Lines */}
            <div className="absolute top-[30%] left-0 w-full h-[2px] flex justify-between z-0">
              <div className={`w-1/3 h-full ${step > 1 ? 'bg-white' : 'bg-white/30'} transition-colors duration-300`}></div>
              <div className={`w-1/3 h-full ${step > 2 ? 'bg-white' : 'bg-white/30'} transition-colors duration-300`}></div>
              <div className={`w-1/3 h-full ${step > 3 ? 'bg-white' : 'bg-white/30'} transition-colors duration-300`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading event request data...</p>
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

  return (
    <div className="min-h-screen pt-20 pb-16 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.loginCover})`
      }}>
      <div className="max-w-6xl mx-auto mt-12">
        <ProgressIndicator />

        <div className="bg-white shadow-xl rounded-xl p-8">
          {error && (
            <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p>{error}</p>
            </div>
          )}

          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Event Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">Event Name</label>
                  <input 
                    name="eventName" 
                    value={formData.eventName} 
                    onChange={handleChange} 
                    placeholder="Enter event name" 
                    className={`w-full border p-3 rounded-lg ${
                      errors.eventName ? 'border-red-500' : 'border-gray-300'
                    }`} 
                  />
                  {errors.eventName && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Event Location</label>
                  <input 
                    name="eventLocation" 
                    value={formData.eventLocation} 
                    onChange={handleChange} 
                    placeholder="Enter location" 
                    className={`w-full border p-3 rounded-lg ${
                      errors.eventLocation ? 'border-red-500' : 'border-gray-300'
                    }`} 
                  />
                  {errors.eventLocation && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventLocation}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Guest Count</label>
                  <input 
                    name="guestCount" 
                    type="number" 
                    value={formData.guestCount} 
                    onChange={handleChange} 
                    placeholder="Number of guests" 
                    className={`w-full border p-3 rounded-lg ${
                      errors.guestCount ? 'border-red-500' : 'border-gray-300'
                    }`} 
                  />
                  {errors.guestCount && (
                    <p className="text-red-500 text-sm mt-1">{errors.guestCount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Event Date</label>
                  <input 
                    name="eventDate" 
                    type="date" 
                    value={formData.eventDate} 
                    onChange={handleChange} 
                    min={new Date().toISOString().split('T')[0]} 
                    className={`w-full border p-3 rounded-lg ${
                      errors.eventDate ? 'border-red-500' : 'border-gray-300'
                    }`} 
                  />
                  {errors.eventDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">Event Type</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="eventType"
                        value="private"
                        checked={formData.eventType === 'private'}
                        onChange={handleChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Private</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="eventType"
                        value="public"
                        checked={formData.eventType === 'public'}
                        onChange={handleChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Public</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.eventType === 'public' 
                      ? 'Public events can be displayed on the website and offer ticket sales.' 
                      : 'Private events are hidden from public listings.'}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Start Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="eventTime.startDate" 
                    value={formData.eventTime.startDate} 
                    min={formData.eventDate ? `${formData.eventDate}T00:00` : undefined}
                    max={formData.eventDate ? `${formData.eventDate}T23:59` : undefined}
                    onChange={handleChange} 
                    className={`w-full border p-3 rounded-lg ${errors['eventTime.startDate'] ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors['eventTime.startDate'] && <p className="text-red-500 text-sm mt-1">{errors['eventTime.startDate']}</p>}
                  <p className="text-xs text-gray-500 mt-1">Start time will use the event date selected above</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="eventTime.endDate" 
                    value={formData.eventTime.endDate} 
                    min={formData.eventTime.startDate || (formData.eventDate ? `${formData.eventDate}T00:00` : undefined)}
                    onChange={handleChange} 
                    className={`w-full border p-3 rounded-lg ${errors['eventTime.endDate'] ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors['eventTime.endDate'] && <p className="text-red-500 text-sm mt-1">{errors['eventTime.endDate']}</p>}
                  <p className="text-xs text-gray-500 mt-1">For overnight events, select different dates</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">Remarks (Optional)</label>
                  <textarea 
                    name="remarks" 
                    value={formData.remarks} 
                    onChange={handleChange} 
                    placeholder="Any additional information or special requests" 
                    className="w-full border border-gray-300 p-3 rounded-lg" 
                    rows="4" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Package Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Select Package</h3>
              
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {systemPackages.map(pkg => (
                    <div
                      key={pkg._id}
                      className={`border rounded-lg overflow-hidden shadow-md group cursor-pointer transition-all hover:shadow-lg
                        ${formData.selectedPackageID === pkg._id
                          ? 'border-blue-500 ring-2 ring-blue-500'
                          : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                      {/* Package Image */}
                      <div className="relative h-48 bg-gray-200">
                        <img 
                          src={pkg.image || assets.event_booking} 
                          alt={pkg.packageName} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        
                        {/* View Details Button */}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setViewingPackage(pkg);
                          }}
                          className="absolute top-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white text-gray-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>

                      {/* Package Details */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800 text-lg">{pkg.packageName}</h4>
                          
                          {/* Radio Button */}
                          <input
                            type="radio"
                            name="selectedPackageID"
                            value={pkg._id}
                            onChange={handleChange}
                            checked={formData.selectedPackageID === pkg._id}
                            className="mt-1"
                          />
                        </div>

                        <p className="text-red-600 font-medium mb-2">Rs. {pkg.price.toLocaleString()}</p>

                        {/* Description */}
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {pkg.description}
                        </p>

                        {/* Dance Styles */}
                        {pkg.danceStyles?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Dance Styles:</p>
                            <div className="flex flex-wrap gap-1">
                              {pkg.danceStyles.slice(0, 3).map((style, idx) => (
                                <span 
                                  key={idx} 
                                  className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700"
                                >
                                  {style}
                                </span>
                              ))}
                              {pkg.danceStyles.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{pkg.danceStyles.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {errors.selectedPackageID && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mt-4">
                  <p>{errors.selectedPackageID}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Additional Services */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Additional Services</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {services.map(service => (
                  <label 
                    key={service._id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
                      ${formData.selectedServices.includes(service._id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.selectedServices.includes(service._id)}
                        onChange={() => toggleService(service._id)}
                        className="mr-3 h-5 w-5 text-blue-600 rounded"
                      />
                      <div>
                        <h4 className="font-bold text-gray-800">{service.serviceName}</h4>
                        <p className="text-sm text-red-600 font-medium">Rs. {service.price.toLocaleString()}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                        )}
                        {service.category && (
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {service.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Review & Confirm</h3>
              
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Event Details</h4>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Event Name</p>
                    <p className="font-medium text-gray-800">{formData.eventName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-800">{formData.eventLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-800">{new Date(formData.eventDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Guest Count</p>
                    <p className="font-medium text-gray-800">{formData.guestCount}</p>
                  </div>
                </div>
                
                {formData.remarks && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Remarks</p>
                    <p className="text-gray-700">{formData.remarks}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Package</h4>
                {formData.selectedPackageID ? (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        {systemPackages.find(p => p._id === formData.selectedPackageID)?.packageName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {systemPackages.find(p => p._id === formData.selectedPackageID)?.description}
                      </p>
                    </div>
                    <p className="font-bold text-red-600">
                      Rs. {systemPackages.find(p => p._id === formData.selectedPackageID)?.price.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No package selected</p>
                )}
              </div>

              {formData.selectedServices.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Additional Services</h4>
                  <ul className="space-y-3">
                    {formData.selectedServices.map(serviceId => {
                      const service = services.find(s => s._id === serviceId);
                      return service ? (
                        <li key={serviceId} className="flex justify-between">
                          <span className="text-gray-800">{service.serviceName}</span>
                          <span className="font-medium text-red-600">Rs. {service.price.toLocaleString()}</span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                    <span className="font-medium text-gray-800">Total Additional Services</span>
                    <span className="font-bold text-red-600">
                      Rs. {formData.selectedServices.reduce((sum, serviceId) => {
                        const service = services.find(s => s._id === serviceId);
                        return sum + (service?.price || 0);
                      }, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-bold text-gray-800">Estimated Total</h4>
                  <p className="text-xl font-bold text-red-600">
                    Rs. {(
                      (systemPackages.find(p => p._id === formData.selectedPackageID)?.price || 0) +
                      formData.selectedServices.reduce((sum, serviceId) => {
                        const service = services.find(s => s._id === serviceId);
                        return sum + (service?.price || 0);
                      }, 0)
                    ).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Final pricing may vary based on specific requirements and admin approval.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Step
              </button>
            ) : (
              <button
                onClick={() => navigate(`/event-requests/${id}`)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Details
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            )}
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
    </div>
  );
};

export default EventRequestEditPage; 