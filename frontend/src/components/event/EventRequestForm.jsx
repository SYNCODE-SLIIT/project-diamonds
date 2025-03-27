import React, { useState, useEffect, useContext } from 'react';
import { getPackages } from '../../services/packageService';
import { getAdditionalServices } from '../../services/additionalServiceService';
import { submitEventRequest } from '../../services/eventRequestService';
import { UserContext } from '../../context/userContext';
import { XIcon, CheckIcon, AlertTriangleIcon, EyeIcon,  PlusIcon} from 'lucide-react';
import PackageDetailsModal from './PackageDetailsModal.jsx';
import CustomPackageModal from './CustomPackageModal.jsx';


const EventRequestForm = () => {
  const { user } = useContext(UserContext);
  const organizerID = user?._id;
  const [step, setStep] = useState(1);
  const [viewingPackage, setViewingPackage] = useState(null);
const [showCustomModal, setShowCustomModal] = useState(false);
  const [systemPackages, setSystemPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    eventName: '',
    eventLocation: '',
    guestCount: '',
    eventDate: '',
    remarks: '',
    selectedPackageID: '',
    selectedServices: [],
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pkgs = await getPackages();
        setSystemPackages(pkgs.filter(p => p.type === 'system' && p.status === 'approved'));
        const services = await getAdditionalServices();
        setServices(services.filter(s => s.status === 'available'));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleCustomPackageCreated = (newPackage) => {
    setSystemPackages(prev => [...prev, newPackage]); // append to the list
    setFormData(prev => ({ ...prev, selectedPackageID: newPackage._id }));
    setShowCustomModal(false);
    setStep(3); // proceed to next step
  };

  // Validation Functions
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.eventName.trim()) {
      newErrors.eventName = 'Event name is required';
    }

    if (!formData.eventLocation.trim()) {
      newErrors.eventLocation = 'Event location is required';
    }

    if (!formData.guestCount.trim()) {
      newErrors.guestCount = 'Guest count is required';
    } else if (isNaN(Number(formData.guestCount)) || Number(formData.guestCount) <= 0) {
      newErrors.guestCount = 'Invalid guest count';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        newErrors.eventDate = 'Event date must be in the future';
      } else {
        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(today.getDate() + 5);

        if (selectedDate < fiveDaysFromNow) {
          newErrors.eventDate = 'Must have at least 5 days prior notice';
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
    setFormData(prev => ({ ...prev, [name]: value }));
  
    const updatedErrors = { ...errors };
  
    // Live validation logic
    if (name === 'eventName') {
      if (!value.trim()) updatedErrors.eventName = 'Event name is required';
      else if (value.trim().length < 3) updatedErrors.eventName = 'At least 3 characters required';
      else delete updatedErrors.eventName;
    }
  
    if (name === 'eventLocation') {
      if (!value.trim()) updatedErrors.eventLocation = 'Event location is required';
      else delete updatedErrors.eventLocation;
    }
  
    if (name === 'guestCount') {
      const count = Number(value);
      if (!value.trim()) updatedErrors.guestCount = 'Guest count is required';
      else if (isNaN(count) || count <= 0) updatedErrors.guestCount = 'Enter a valid positive number';
      else delete updatedErrors.guestCount;
    }
  
    if (name === 'eventDate') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fiveDaysFromNow = new Date(today);
      fiveDaysFromNow.setDate(today.getDate() + 5);
  
      if (!value) {
        updatedErrors.eventDate = 'Event date is required';
      } else if (selectedDate < today) {
        updatedErrors.eventDate = 'Event date must be today or in the future';
      } else if (selectedDate < fiveDaysFromNow) {
        updatedErrors.eventDate = 'Please book at least 5 days in advance';
      } else {
        delete updatedErrors.eventDate;
      }
    }
  
    setErrors(updatedErrors);
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
      { number: 1, title: 'Event Details' },
      { number: 2, title: 'Choose Package' },
      { number: 3, title: 'Additional Services' },
      { number: 4, title: 'Review & Submit' }
    ];

    const getStepIndicator = (stepNumber) => {
      if (stepNumber < step) {
        return <CheckIcon className="w-6 h-6 text-white" />;
      }
      return stepNumber;
    };

    const getStepBackground = (stepNumber) => {
      if (stepNumber < step) {
        return 'bg-green-500';
      }
      if (stepNumber === step) {
        return 'bg-blue-500';
      }
      return 'bg-gray-300';
    };

    return (
      <div className="bg-gradient-to-r from-red-900 to-red-700 text-white rounded-t-xl mt-20 ">
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 className="text-2xl font-bold">Book a Dance Team</h2>
            <p className="text-sm text-white/80">Fill in the details to book your dance team</p>
          </div>
          <div className="text-white cursor-pointer">
            <XIcon />
          </div>
        </div>
        <div className="container mx-auto px-4 pb-4">
          <div className="flex items-center justify-between">
            {steps.slice(0, 3).map((step, index) => (
              <div 
                key={step.number} 
                className="flex items-center space-x-3 relative"
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center 
                    ${getStepBackground(step.number)} text-white font-bold`}
                >
                  {getStepIndicator(step.number)}
                </div>

                {index < 2 && (
                  <div 
                    className={`absolute left-full h-0.5 w-24 ${
                      step.number < step 
                        ? 'bg-white' 
                        : 'bg-white/20'
                    }`}
                    style={{ marginLeft: '20px' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl">
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
                <input 
                  name="eventName" 
                  value={formData.eventName} 
                  onChange={handleChange} 
                  placeholder="Event Name" 
                  className={`input col-span-2 border p-2 rounded w-full ${
                    errors.eventName ? 'border-red-500' : ''
                  }`} 
                />
                {errors.eventName && (
                  <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>
                )}
              </div>
              <div className="col-span-1">
                <input 
                  name="eventLocation" 
                  value={formData.eventLocation} 
                  onChange={handleChange} 
                  placeholder="Event Location" 
                  className={`input border p-2 rounded w-full ${
                    errors.eventLocation ? 'border-red-500' : ''
                  }`} 
                />
                {errors.eventLocation && (
                  <p className="text-red-500 text-sm mt-1">{errors.eventLocation}</p>
                )}
              </div>
              <div className="col-span-1">
                <input 
                  name="guestCount" 
                  type="number" 
                  value={formData.guestCount} 
                  onChange={handleChange} 
                  placeholder="Guest Count" 
                  className={`input border p-2 rounded w-full ${
                    errors.guestCount ? 'border-red-500' : ''
                  }`} 
                />
                {errors.guestCount && (
                  <p className="text-red-500 text-sm mt-1">{errors.guestCount}</p>
                )}
              </div>
              <div className="col-span-1">
              <input 
  name="eventDate" 
  type="date" 
  value={formData.eventDate} 
  onChange={handleChange} 
  min={new Date().toISOString().split('T')[0]} 
  className={`input border p-2 rounded w-full ${
    errors.eventDate ? 'border-red-500' : ''
  }`} 
/>
{errors.eventDate && (
  <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>
)}
              </div>
              <div className="col-span-2">
                <textarea 
                  name="remarks" 
                  value={formData.remarks} 
                  onChange={handleChange} 
                  placeholder="Remarks (Optional)" 
                  className="input col-span-2 border p-2 rounded w-full" 
                  rows="3" 
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={nextStep} className="btn bg-blue-600 text-white px-4 py-2 rounded">Next Step</button>
            </div>
          </div>
        )}

        {/* Rest of the code remains the same as before */}
        {step === 2 && (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Choose Package</h3>

      {/* Scrollable Package Container */}
      <div className="max-h-[500px] overflow-y-auto pr-2">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemPackages.map(pkg => (
            <div
              key={pkg._id}
              className={`border rounded-lg overflow-hidden shadow-md group cursor-pointer relative
                ${formData.selectedPackageID === pkg._id
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-200 hover:border-blue-300'
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
                
                {/* Eye Icon for Details */}
                <button 
                  onClick={() => setViewingPackage(pkg)}
                  className="absolute top-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white"
                >
                  <EyeIcon className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Package Details */}
              <div className="p-4">
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
                    className="mt-1"
                  />
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Dance Styles */}
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Dance Styles:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pkg.danceStyles && pkg.danceStyles.slice(0, 3).map((style, idx) => (
                      <span 
                        key={idx} 
                        className="bg-gray-100 px-2 py-1 rounded text-xs"
                      >
                        {style}
                      </span>
                    ))}
                    {pkg.danceStyles && pkg.danceStyles.length > 3 && (
                      <span className="text-xs text-gray-500 ml-1">
                        +{pkg.danceStyles.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {errors.selectedPackageID && (
        <p className="text-red-500 text-sm mt-1">{errors.selectedPackageID}</p>
      )}

      {/* Custom Package Button */}
      <div className="mt-6">
        <button
          onClick={() => setShowCustomModal(true)}
          className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 border border-blue-500 rounded hover:bg-blue-50"
        >
          <PlusIcon className="w-4 h-4" />
          Create Custom Package
        </button>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="btn-secondary border p-2 rounded">Previous Step</button>
        <button onClick={nextStep} className="btn bg-blue-600 text-white px-4 py-2 rounded">Next Step</button>
      </div>
    </div>
  )}

        {/* Additional Services and Review & Submit steps remain the same */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Additional Services</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map(service => (
                <label 
                  key={service._id} 
                  className={`border rounded-lg p-4 cursor-pointer 
                    ${formData.selectedServices.includes(service._id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                    }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.selectedServices.includes(service._id)}
                      onChange={() => toggleService(service._id)}
                      className="mr-3"
                    />
                    <div>
                      <h4 className="font-bold text-gray-800">{service.serviceName}</h4>
                      <p className="text-sm text-gray-600">Rs.{service.price.toFixed(2)}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={prevStep} className="btn-secondary border p-2 rounded">Previous Step</button>
              <button onClick={nextStep} className="btn bg-blue-600 text-white px-4 py-2 rounded">Next Step</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Review & Submit</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid md:grid-cols-2 gap-3">
                <p><strong>Event:</strong> {formData.eventName}</p>
                <p><strong>Location:</strong> {formData.eventLocation}</p>
                <p><strong>Date:</strong> {formData.eventDate}</p>
                <p><strong>Guests:</strong> {formData.guestCount}</p>
                <p><strong>Package:</strong> {
                  systemPackages.find(p => p._id === formData.selectedPackageID)?.packageName || 'Custom Package'
                }</p>
                <p><strong>Estimated Price:</strong> {
                  formData.selectedPackageID
                    ? `Rs.${systemPackages.find(p => p._id === formData.selectedPackageID)?.price.toFixed(2)} + additional charges`
                    : `Custom quote - price will be confirmed by admin`
                }</p>
              </div>
              <p className="mt-3"><strong>Additional Services:</strong> {
                services
                  .filter(s => formData.selectedServices.includes(s._id))
                  .map(s => `${s.serviceName} (Rs.${s.price})`)
                  .join(', ') || 'None'
              }</p>
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={prevStep} className="btn-secondary border p-2 rounded">Previous Step</button>
              <button 
                onClick={handleSubmit} 
                className="btn bg-green-500 text-white px-4 py-2 rounded" 
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