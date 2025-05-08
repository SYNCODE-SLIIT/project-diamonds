import React, { useState, useEffect, useContext } from 'react';
import { getPackages } from '../../services/packageService';
import { getAdditionalServices } from '../../services/additionalServiceService';
import { submitEventRequest } from '../../services/eventRequestService';
import { UserContext } from '../../context/userContext';
import { XIcon, CheckIcon, AlertTriangleIcon, EyeIcon,  PlusIcon, CalendarCheckIcon, BookOpenIcon, Package2Icon } from 'lucide-react';
import PackageDetailsModal from './PackageDetailsModal.jsx';
import CustomPackageModal from './CustomPackageModal.jsx';


const EventRequestForm = () => {
  const { user } = useContext(UserContext);
  const organizerID = user?._id;
  const [step, setStep] = useState(1);
  const [viewingPackage, setViewingPackage] = useState(null);
const [showCustomModal, setShowCustomModal] = useState(false);
  
  // Separate state for original packages list and filtered packages
  const [allPackages, setAllPackages] = useState([]);
  const [systemPackages, setSystemPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('dateDesc');
  
  // Initialize with tomorrow's date + time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
  
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(17, 0, 0, 0); // 5:00 PM
  
  // Get today's date in YYYY-MM-DD format for min attribute on date inputs
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  const nowFormatted = today.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

  // Calculate min booking date (5 days from now)
  const minBookingDate = new Date();
  minBookingDate.setDate(minBookingDate.getDate() + 5);
  const minBookingDateFormatted = minBookingDate.toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    eventName: '',
    eventLocation: '',
    guestCount: '',
    eventDate: '',
    eventType: 'private',
    eventTime: {
      startDate: tomorrow.toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:MM
      endDate: tomorrowEnd.toISOString().slice(0, 16)
    },
    remarks: '',
    selectedPackageID: '',
    selectedServices: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pkgs = await getPackages();
        const filteredPkgs = pkgs.filter(p => p.type === 'system' && p.status === 'approved');
        setAllPackages(filteredPkgs); // Store original list
        setSystemPackages(filteredPkgs); // Initial display list
        const services = await getAdditionalServices();
        setServices(services.filter(s => s.status === 'available'));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // New function to filter and sort packages
  const filterAndSortPackages = (search, sort) => {
    let filtered = [...allPackages];
    
    // Apply search filter if search term exists
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(pkg => 
        pkg.packageName.toLowerCase().includes(searchLower) || 
        (pkg.danceStyles && pkg.danceStyles.some(style => 
          style.toLowerCase().includes(searchLower)
        ))
      );
    }
    
    // Apply sorting
    if (sort === 'priceAsc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'priceDesc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'dateAsc') {
      filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sort === 'dateDesc') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    
    return filtered;
  };

  const handleCustomPackageCreated = (newPackage) => {
    setAllPackages(prev => [...prev, newPackage]); // Add to original list
    setSystemPackages(prev => [...prev, newPackage]); // Add to displayed list
    setFormData(prev => ({ ...prev, selectedPackageID: newPackage._id }));
    setShowCustomModal(false);
    setStep(3); // proceed to next step
  };

  // Validation Functions
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'eventName':
        if (!value.trim()) {
          error = 'Event name is required';
        } else if (value.trim().length < 2) {
          error = 'Event name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          error = 'Event name must be less than 100 characters';
        }
        break;
      
      case 'eventLocation':
        if (!value.trim()) {
          error = 'Event location is required';
        } else if (value.trim().length < 2) {
          error = 'Event location must be at least 2 characters';
        } else if (value.trim().length > 200) {
          error = 'Event location must be less than 200 characters';
        }
        break;
      
      case 'guestCount':
        if (!value) {
          error = 'Guest count is required';
        } else if (!/^\d+$/.test(value)) {
          error = 'Guest count must be a positive integer';
        } else if (parseInt(value) <= 0) {
          error = 'Guest count must be at least 1';
        }
        break;
      
      case 'eventDate':
        if (!value) {
          error = 'Event date is required';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set to beginning of day for comparison
          
          if (selectedDate < today) {
            error = 'Event date cannot be in the past';
          } else {
            const minDate = new Date();
            minDate.setDate(today.getDate() + 5);
            minDate.setHours(0, 0, 0, 0); // Set to beginning of day
            
            if (selectedDate < minDate) {
              error = 'Please book at least 5 days in advance';
            }
          }
        }
        break;
      
      case 'eventTime.startDate':
        if (!value) {
          error = 'Start date and time is required';
        } else {
          const startDate = new Date(value);
          const now = new Date();
          
          if (startDate < now) {
            error = 'Start time cannot be in the past';
          } else {
            const minDate = new Date();
            minDate.setDate(minDate.getDate() + 5);
            
            if (startDate < minDate) {
              error = 'Please book event start at least 5 days in advance';
            }
            
            // Verify that start date matches event date if event date is set
            if (formData.eventDate) {
              const eventDate = new Date(formData.eventDate);
              const startDateDay = startDate.getDate();
              const startDateMonth = startDate.getMonth();
              const startDateYear = startDate.getFullYear();
              
              const eventDateDay = eventDate.getDate();
              const eventDateMonth = eventDate.getMonth();
              const eventDateYear = eventDate.getFullYear();
              
              if (startDateDay !== eventDateDay || 
                  startDateMonth !== eventDateMonth || 
                  startDateYear !== eventDateYear) {
                error = 'Start date must match the event date';
              }
            }
          }
        }
        break;
      
      case 'eventTime.endDate':
        if (!value) {
          error = 'End date and time is required';
        } else {
          const endDate = new Date(value);
          const now = new Date();
          
          if (endDate < now) {
            error = 'End time cannot be in the past';
          } else if (formData.eventTime.startDate) {
            // Validate end time is after start time and at least 10 minutes difference
            const startDate = new Date(formData.eventTime.startDate);
            
            if (endDate <= startDate) {
              error = 'End time must be after start time';
            } else {
              // Calculate difference in minutes
              const diffMs = endDate - startDate;
              const diffMinutes = diffMs / (1000 * 60);
              
              if (diffMinutes < 10) {
                error = 'Event must last at least 10 minutes';
              }
            }

            // Verify that end date is not before event date
            if (formData.eventDate) {
              const eventDate = new Date(formData.eventDate);
              // Reset time to beginning of day for comparison
              eventDate.setHours(0, 0, 0, 0);
              
              const endDateTime = new Date(value);
              const endDateDay = endDateTime.getDate();
              const endDateMonth = endDateTime.getMonth();
              const endDateYear = endDateTime.getFullYear();
              
              const eventDateDay = eventDate.getDate();
              const eventDateMonth = eventDate.getMonth();
              const eventDateYear = eventDate.getFullYear();
              
              // If end date is before event date
              if (new Date(endDateYear, endDateMonth, endDateDay) < new Date(eventDateYear, eventDateMonth, eventDateDay)) {
                error = 'End date cannot be before the event date';
              }
            }
          }
        }
        break;
      
      case 'remarks':
        if (value.trim().length > 0 && value.trim().length < 5) {
          error = 'Description must be at least 5 characters';
        }
        break;
      
      default:
        break;
    }

    return error;
  };

  const validateStep1 = () => {
    const updatedErrors = { ...errors };
    let isValid = true;

    // Validate each field
    ['eventName', 'eventLocation', 'guestCount', 'eventDate'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        updatedErrors[field] = error;
        isValid = false;
      } else {
        delete updatedErrors[field];
      }
    });

    // Validate time fields
    ['eventTime.startDate', 'eventTime.endDate'].forEach(field => {
      const [parent, child] = field.split('.');
      const error = validateField(field, formData[parent][child]);
      if (error) {
        updatedErrors[field] = error;
        isValid = false;
      } else {
        delete updatedErrors[field];
      }
    });
    
    // Validate remarks if filled
    if (formData.remarks.trim().length > 0) {
      const error = validateField('remarks', formData.remarks);
      if (error) {
        updatedErrors.remarks = error;
        isValid = false;
      } else {
        delete updatedErrors.remarks;
      }
    }
  
    setErrors(updatedErrors);
    return isValid;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.selectedPackageID) {
      newErrors.selectedPackageID = 'Please select a package';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const prevStep = () => setStep(prev => prev - 1);

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
      
      // Mark both fields as touched
      setTouched(prev => ({
        ...prev,
        [name]: true,
        'eventTime.startDate': true
      }));
      
      // Validate this field and startDate
      const fieldError = validateField(name, value);
      const startDateError = value ? validateField('eventTime.startDate', formData.eventTime.startDate) : '';
      
      setErrors(prev => ({
        ...prev,
        [name]: fieldError,
        'eventTime.startDate': startDateError
      }));
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
          
          // Mark as touched
          setTouched(prev => ({
            ...prev,
            [name]: true
          }));
          
          // Validate with the corrected date
          const fieldError = validateField(name, updatedStartDate);
          
          // If end time was changed, we need to revalidate it after changing start time
          if (formData.eventTime.endDate) {
            const endTimeError = validateField('eventTime.endDate', formData.eventTime.endDate);
            setErrors(prev => ({
              ...prev,
              [name]: fieldError,
              'eventTime.endDate': endTimeError
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              [name]: fieldError
            }));
          }
          
          return;
        }
      }
      
      // Normal processing for start time when event date matches
      const updatedEventTime = {
        ...formData[field],
        [subfield]: value
      };
      
      setFormData(prev => ({
        ...prev,
        [field]: updatedEventTime
      }));
      
      // Mark as touched
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
      
      // Validate this field
      const fieldError = validateField(name, value);
      
      // If end time was changed, we need to revalidate it after changing start time
      if (name === 'eventTime.startDate' && formData.eventTime.endDate) {
        const endTimeError = validateField('eventTime.endDate', formData.eventTime.endDate);
        setErrors(prev => ({
          ...prev,
          [name]: fieldError,
          'eventTime.endDate': endTimeError
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          [name]: fieldError
        }));
      }
    } else if (name === 'eventTime.endDate') {
      const [field, subfield] = name.split('.');
      const updatedEventTime = {
        ...formData[field],
        [subfield]: value
      };
      
      setFormData(prev => ({
        ...prev,
        [field]: updatedEventTime
      }));
      
      // Mark as touched
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
      
      // Validate this field
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Mark as touched
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
      
      // Validate this field
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    
    // Mark field as touched on blur
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate all fields when the first field is touched
    if (Object.keys(touched).length === 0) {
      validateStep1();
    }
  };

  const toggleService = (id) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(id)
        ? prev.selectedServices.filter(s => s !== id)
        : [...prev.selectedServices, id]
    }));
  };

  const handleSubmit = async () => {
    if (!organizerID) {
      setMessage("You must be logged in to submit an event request.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        organizerID,
        packageID: formData.selectedPackageID,
        additionalServices: formData.selectedServices.map(s => ({ serviceID: s })),
        eventName: formData.eventName,
        eventLocation: formData.eventLocation,
        eventType: formData.eventType,
        eventTime: formData.eventTime,
        guestCount: Number(formData.guestCount),
        eventDate: formData.eventDate,
        remarks: formData.remarks,
      };

      await submitEventRequest(payload);
      setMessage("Event request submitted successfully!");
      setStep(1);
      setFormData({
        eventName: '',
        eventLocation: '',
        guestCount: '',
        eventDate: '',
        eventType: 'private',
        eventTime: {
          startDate: tomorrow.toISOString().slice(0, 16),
          endDate: tomorrowEnd.toISOString().slice(0, 16)
        },
        remarks: '',
        selectedPackageID: '',
        selectedServices: [],
      });
    } catch (error) {
      setMessage(error.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const ProgressIndicator = () => {
    const steps = [
      { number: 1, title: 'Enter Event Details', icon: 'calendar' },
      { number: 2, title: 'Select Package', icon: 'package' },
      { number: 3, title: 'Add Additional Services', icon: 'plus-circle' },
      { number: 4, title: 'Confirmation', icon: 'check-circle' }
    ];

    const getStepStatus = (stepNumber) => {
      if (stepNumber < step) return 'completed';
      if (stepNumber === step) return 'current';
      return 'upcoming';
    };

    const getIcon = (iconName, status) => {
      const iconSize = "w-6 h-6";
      const iconColor = status === 'upcoming' ? 'text-white/60' : 'text-white';
      
      switch(iconName) {
        case 'calendar':
          return <CalendarCheckIcon className={`${iconSize} ${iconColor}`} />;
        case 'package':
          return <Package2Icon className={`${iconSize} ${iconColor}`} />;
        case 'plus-circle':
          return <PlusIcon className={`${iconSize} ${iconColor}`} />;
        case 'check-circle':
          return <CheckIcon className={`${iconSize} ${iconColor}`} />;
        default:
          return <CheckIcon className={`${iconSize} ${iconColor}`} />;
      }
    };

    return (
      <div className="bg-gradient-to-r from-red-900 to-red-700 text-white rounded-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Book a Dance Team</h2>
              <p className="text-sm text-white/80">Fill in the details to book your dance team</p>
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
                          <div className="text-white font-medium">{getIcon(stepItem.icon, status)}</div>
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

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl">
      <ProgressIndicator />

      <div className="p-8">
      {step === 1 && (
          <h3 className="text-2xl font-semibold text-red-900 mb-6">Enter Event Details</h3>
        )}
        {step === 2 && (
          <h3 className="text-2xl font-semibold text-red-900 mb-6">Select Your Dance Package</h3>
        )}
        {step === 3 && (
          <h3 className="text-2xl font-semibold text-red-900 mb-6">Add Additional Services</h3>
        )}
        {step === 4 && (
          <h3 className="text-2xl font-semibold text-red-900 mb-6">Review Your Booking</h3>
        )}

        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Event Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input 
                  id="eventName"
                  name="eventName" 
                  value={formData.eventName} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  placeholder="Enter your event name (2-100 characters)" 
                  className={`input col-span-2 border p-2 rounded w-full ${
                    errors.eventName && touched.eventName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.eventName && touched.eventName && (
                  <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {!errors.eventName && formData.eventName.length > 0 ? 
                    `${formData.eventName.length}/100 characters` : 
                    ""}
                </p>
              </div>
              <div className="col-span-2">
                <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Location <span className="text-red-500">*</span>
                </label>
                <input 
                  id="eventLocation"
                  name="eventLocation" 
                  value={formData.eventLocation} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  placeholder="Enter venue location (2-200 characters)" 
                  className={`input border p-2 rounded w-full ${
                    errors.eventLocation && touched.eventLocation ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.eventLocation && touched.eventLocation && (
                  <p className="text-red-500 text-sm mt-1">{errors.eventLocation}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {!errors.eventLocation && formData.eventLocation.length > 0 ? 
                    `${formData.eventLocation.length}/200 characters` : 
                    ""}
                </p>
              </div>
              <div>
                <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests <span className="text-red-500">*</span>
                </label>
                <input 
                  id="guestCount"
                  type="number" 
                  name="guestCount" 
                  value={formData.guestCount} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  placeholder="Enter number of guests" 
                  min="1"
                  className={`input border p-2 rounded w-full ${
                    errors.guestCount && touched.guestCount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.guestCount && touched.guestCount && (
                  <p className="text-red-500 text-sm mt-1">{errors.guestCount}</p>
                )}
              </div>
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date*
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  min={todayFormatted}
                  value={formData.eventDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border ${
                    errors.eventDate ? 'border-red-500' : touched.eventDate ? 'border-green-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white`}
                />
                {errors.eventDate ? (
                  <p className="mt-1 text-sm text-red-500">{errors.eventDate}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">Please book at least 5 days in advance</p>
                )}
              </div>
              
              {/* Event Type Radio Buttons */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="eventType"
                      value="private"
                      checked={formData.eventType === 'private'}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-primary"
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
                      className="form-radio h-4 w-4 text-primary"
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
              
              {/* Event Time Fields */}
              <div>
                <label htmlFor="eventTimeStart" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Start Time*
                </label>
                <input
                  type="datetime-local"
                  id="eventTimeStart"
                  name="eventTime.startDate"
                  min={formData.eventDate ? `${formData.eventDate}T00:00` : nowFormatted}
                  value={formData.eventTime.startDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border ${
                    errors['eventTime.startDate'] ? 'border-red-500' : touched['eventTime.startDate'] ? 'border-green-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white`}
                />
                {errors['eventTime.startDate'] && (
                  <p className="mt-1 text-sm text-red-500">{errors['eventTime.startDate']}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Must match the selected event date</p>
              </div>
              
              {/* Event Time - End */}
              <div>
                <label htmlFor="eventTimeEnd" className="block text-sm font-medium text-gray-700 mb-1">
                  Event End Time*
                </label>
                <input
                  type="datetime-local"
                  id="eventTimeEnd"
                  name="eventTime.endDate"
                  min={formData.eventTime.startDate || (formData.eventDate ? `${formData.eventDate}T00:00` : nowFormatted)}
                  value={formData.eventTime.endDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border ${
                    errors['eventTime.endDate'] ? 'border-red-500' : touched['eventTime.endDate'] ? 'border-green-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white`}
                />
                {errors['eventTime.endDate'] && (
                  <p className="mt-1 text-sm text-red-500">{errors['eventTime.endDate']}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Must be after the start time</p>
              </div>
              
              <div className="col-span-2">
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Details
                </label>
                <textarea 
                  id="remarks"
                  name="remarks" 
                  value={formData.remarks} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  placeholder="Enter any special requirements or additional information" 
                  rows="3"
                  className={`border p-2 rounded w-full ${
                    errors.remarks && touched.remarks ? 'border-red-500' : 'border-gray-300'
                  }`}
                ></textarea>
                {errors.remarks && touched.remarks && (
                  <p className="text-red-500 text-sm mt-1">{errors.remarks}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.remarks.length > 0 ? `${formData.remarks.length} characters` : ""}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                type="button" 
                onClick={nextStep}
                disabled={Object.keys(errors).some(key => errors[key] && touched[key])}
                className={`
                  flex items-center px-6 py-3 rounded-lg font-medium transition-all
                  ${Object.keys(errors).some(key => errors[key] && touched[key])
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105'}
                `}
              >
                Next Step
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Package Selection with Search and Sort */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Choose Package</h3>
            
            {/* Search and Sort Controls */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Search Box */}
                <div className="md:col-span-2">
                  <label htmlFor="packageSearch" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Packages
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="packageSearch"
                      placeholder="Search by package name or dance style..."
                      value={searchTerm}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      onChange={(e) => {
                        const newSearchTerm = e.target.value;
                        setSearchTerm(newSearchTerm);
                        // Filter and sort packages based on new search term and current sort option
                        const filtered = filterAndSortPackages(newSearchTerm, sortOption);
                        setSystemPackages(filtered);
                      }}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          // Reset to show all packages with current sort
                          setSystemPackages(filterAndSortPackages('', sortOption));
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <XIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Sort Dropdown */}
                <div>
                  <label htmlFor="packageSort" className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    id="packageSort"
                    value={sortOption}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    onChange={(e) => {
                      const newSortOption = e.target.value;
                      setSortOption(newSortOption);
                      // Apply current search term with new sort option
                      const sorted = filterAndSortPackages(searchTerm, newSortOption);
                      setSystemPackages(sorted);
                    }}
                  >
                    <option value="dateDesc">Newest First</option>
                    <option value="dateAsc">Oldest First</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="max-h-[500px] overflow-y-auto pr-2">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemPackages.length > 0 ? (
                  systemPackages.map(pkg => (
                    <div
                      key={pkg._id}
                      className={`border rounded-lg overflow-hidden shadow-md group cursor-pointer relative transition-all duration-300 hover:shadow-lg
                        ${formData.selectedPackageID === pkg._id
                          ? 'border-red-500 ring-2 ring-red-500 transform scale-[1.02]'
                          : 'border-gray-200 hover:border-red-300'
                        }`}
                    >
                      {/* Package Image */}
                      <div className="relative">
                        <img 
                          src={pkg.image || '/api/placeholder/400/250'} 
                          alt={pkg.packageName} 
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/400/250';
                            e.target.onerror = null;
                          }}
                        />
                        
                        {/* Price Badge */}
                        <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 font-bold rounded-bl-lg">
                          {pkg.price ? `Rs. ${pkg.price.toLocaleString()}` : 'Custom Quote'}
                        </div>
                        
                        {/* Eye Icon for Details */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent selecting package when viewing details
                            setViewingPackage(pkg);
                          }}
                          className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white transition-all duration-200 hover:scale-110"
                        >
                          <EyeIcon className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>

                      {/* Package Details */}
                      <div 
                        className="p-4"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            selectedPackageID: pkg._id
                          }));
                          // Clear any previous errors
                          setErrors(prev => ({ ...prev, selectedPackageID: undefined }));
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-800 text-lg">{pkg.packageName}</h4>
                          
                          {/* Radio Button */}
                          <input
                            type="radio"
                            name="selectedPackageID"
                            value={pkg._id}
                            onChange={(e) => {
                              handleChange(e);
                              // Clear any previous errors
                              setErrors(prev => ({ ...prev, selectedPackageID: undefined }));
                            }}
                            checked={formData.selectedPackageID === pkg._id}
                            className="w-5 h-5 text-red-600 mt-1"
                          />
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2 min-h-[2.5rem]">
                          {pkg.description}
                        </p>

                        {/* Dance Styles */}
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1.5">Dance Styles:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {pkg.danceStyles && pkg.danceStyles.slice(0, 3).map((style, idx) => (
                              <span 
                                key={idx} 
                                className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs"
                              >
                                {style}
                              </span>
                            ))}
                            {pkg.danceStyles && pkg.danceStyles.length > 3 && (
                              <span className="text-xs text-gray-500 ml-1 flex items-center">
                                +{pkg.danceStyles.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-8 bg-gray-50 rounded-lg text-center">
                    <div className="flex justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-700 mb-1">No packages found</h4>
                    <p className="text-gray-500 mb-4">Try a different search term or create a custom package</p>
                    <button
                      onClick={() => setShowCustomModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create Custom Package
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Create Custom Package Button - Moved to bottom */}
            <div className="mt-6 mb-3">
              <button
                onClick={() => setShowCustomModal(true)}
                className="group w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex items-center text-white">
                  <div className="rounded-full bg-white/20 p-2 mr-3">
                    <PlusIcon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-md">Create Custom Package</h4>
                    <p className="text-xs text-white/80">
                      Don't see what you need? Create a tailored package.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {errors.selectedPackageID && (
              <p className="text-red-500 text-sm mt-1">{errors.selectedPackageID}</p>
            )}

            <div className="flex justify-between mt-6">
              <button 
                onClick={prevStep} 
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Previous Step
              </button>
              <button 
                onClick={nextStep} 
                className={`px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                  !formData.selectedPackageID ? 'opacity-70' : ''
                }`}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Additional Services section with improved styling */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Additional Services</h3>
            
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
            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="btn-secondary border p-2 rounded-lg hover:bg-gray-100">Previous Step</button>
              <button onClick={nextStep} className="btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Next Step</button>
            </div>
          </div>
        )}

        {/* Review & Submit with improved styling */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Review & Submit</h3>
            
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
                <p className="text-gray-500 italic">Custom quote - price will be confirmed by admin</p>
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

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="btn-secondary border p-2 rounded-lg hover:bg-gray-100">Previous Step</button>
              <button 
                onClick={handleSubmit} 
                className="btn bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600" 
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
        {/* Modals */}
{viewingPackage && (
  <PackageDetailsModal
    pkg={viewingPackage}
    onClose={() => setViewingPackage(null)}
    onCreateCustom={() => {
      setViewingPackage(null);
      setShowCustomModal(true);
    }}
  />
)}

{showCustomModal && (
  <CustomPackageModal
    onClose={() => setShowCustomModal(false)}
    onSuccess={handleCustomPackageCreated}
    createdBy={user._id}
  />
)}
      </div>
    </div>
  );
};

export default EventRequestForm;