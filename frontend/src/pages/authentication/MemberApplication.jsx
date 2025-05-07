import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../../assets/assets.js';

// Helper function to calculate age from a birth date string (YYYY-MM-DD)
const calculateAge = (birthDateStr) => {
  const birthDateObj = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

const MemberApplication = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    birthDate: '',
    danceStyle: '',
    yearsOfExperience: '',
    biography: '',
    achievements: ''
  });
  
  const [availabilityEntry, setAvailabilityEntry] = useState({
    day: '',
    start: '08:00',
    end: '22:00'
  });
  const [availabilities, setAvailabilities] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [responseMsg, setResponseMsg] = useState('');

  const validateField = (name, value) => {
    let errMsg = '';
    if (name === 'fullName') {
      if (!value.trim()) {
        errMsg = 'Name is required.';
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        errMsg = 'Name can only contain letters and spaces.';
      }
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        errMsg = 'Invalid email format.';
      }
    }
    if (name === 'contactNumber') {
      if (value && !/^\d+$/.test(value)) {
        errMsg = 'Contact number must contain only digits.';
      } else if (value && (value.length < 10 || value.length > 15)) {
        errMsg = 'Contact number should be between 10 and 15 digits.';
      }
    }
    if (name === 'birthDate') {
      if (value) {
        const age = calculateAge(value);
        if (age < 18) {
          errMsg = 'You must be at least 18 years old.';
        } else if (age > 50) {
          errMsg = 'You must be below 50 years old.';
        }
      }
    }
    if (name === 'yearsOfExperience') {
      if (value && Number(value) < 0) {
        errMsg = 'Years of experience cannot be negative.';
      }
    }
    if (name === 'biography') {
      if (value) {
        if (value.length < 10) {
          errMsg = 'Biography must be at least 10 characters.';
        } else if (value.length > 500) {
          errMsg = 'Biography must be at most 500 characters.';
        }
      }
    }
    setErrors(prev => ({ ...prev, [name]: errMsg }));
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'email') {
      value = value.toLowerCase();
    }
    
    // Add validation for years of experience to only allow numbers
    if (name === 'yearsOfExperience') {
      // Remove any non-numeric characters
      value = value.replace(/[^0-9]/g, '');
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setAvailabilityEntry(prev => ({ ...prev, [name]: value }));
  };

  const addAvailability = () => {
    if (availabilityEntry.day && availabilityEntry.start && availabilityEntry.end) {
      setAvailabilities(prev => [...prev, availabilityEntry]);
      setAvailabilityEntry({ day: '', start: '08:00', end: '22:00' });
    }
  };

  const removeAvailability = (index) => {
    setAvailabilities(prev => prev.filter((_, i) => i !== index));
  };

  const handleStep1Next = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!formData.fullName || !formData.email || !formData.contactNumber || !formData.birthDate) {
      setSubmitError('Please fill in all required fields.');
      return;
    }
    if (errors.fullName || errors.email || errors.contactNumber || errors.birthDate) {
      setSubmitError('Please fix the errors before continuing.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/member-applications/check-email?email=${encodeURIComponent(formData.email)}`);
      const data = await res.json();
      if (data.exists) {
        setSubmitError('An application with that email already exists.');
        return;
      }
    } catch (err) {
      setSubmitError('Error checking email uniqueness: ' + err.message);
      return;
    }
    setSubmitError('');
    setStep(2);
  };

  const goBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setResponseMsg('');
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      contactNumber: formData.contactNumber,
      birthDate: formData.birthDate,
      danceStyle: formData.danceStyle,
      yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
      availability: availabilities,
      biography: formData.biography,
      achievements: formData.achievements 
        ? formData.achievements.split(',').map(item => item.trim()) 
        : []
    };

    try {
      const res = await fetch('http://localhost:4000/api/member-applications/register/member/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/application-submitted', { state: { message: data.message } });
      } else {
        setSubmitError(data.message || 'Submission failed');
      }
    } catch (error) {
      setSubmitError('Error: ' + error.message);
    }
  };

  // Step indicator component with clickable steps
  const StepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="w-full flex items-center">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 1 ? 'bg-blue-900 text-white' : 'bg-blue-200 text-blue-900'} font-bold cursor-pointer hover:opacity-90`}
            onClick={() => setStep(1)}
          >
            1
          </div>
          <div className={`h-1 flex-1 mx-2 ${step === 2 ? 'bg-blue-200' : 'bg-blue-900'}`}></div>
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 2 ? 'bg-blue-900 text-white' : 'bg-blue-200 text-blue-900'} font-bold ${step === 1 ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:opacity-90'}`}
            onClick={() => step === 2 && setStep(2)}
          >
            2
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-2 text-sm font-medium">
        <span 
          className={`${step === 1 ? 'text-blue-900' : 'text-gray-500'} cursor-pointer hover:underline`}
          onClick={() => setStep(1)}
        >
          Personal Information
        </span>
        <span 
          className={`${step === 2 ? 'text-blue-900' : 'text-gray-500'} ${step === 1 ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:underline'}`}
          onClick={() => step === 2 && setStep(2)}
        >
          Dance & Availability
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat py-10 pt-26"
          style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.loginCover})` }}>
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 mx-4 my-8 overflow-y-auto">
        <StepIndicator />
        
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Personal Information</h1>
            <div>
              <label className="block mb-1 font-medium">Full Name:</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium">Email:</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium">Contact Number:</label>
              <input 
                type="text" 
                name="contactNumber" 
                value={formData.contactNumber} 
                onChange={handleChange} 
                required 
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
              {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium">Birth Date:</label>
              <input 
                type="date" 
                name="birthDate" 
                value={formData.birthDate} 
                onChange={handleChange} 
                required 
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
              {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
            </div>
            {submitError && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">{submitError}</div>}
            <button type="submit" className="w-full py-3 bg-blue-900 text-white font-bold uppercase rounded-lg hover:bg-blue-700 transition shadow-md mt-4">
              Continue to Dance Details
            </button>
          </form>
        )}
        
        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Dance & Availability</h1>
            <div>
              <label className="block mb-1 font-medium">Dance Style:</label>
              <input 
                type="text" 
                name="danceStyle" 
                value={formData.danceStyle} 
                onChange={handleChange} 
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
                placeholder="e.g., Ballet, Hip Hop, Contemporary"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Years of Experience:</label>
              <input 
                type="number" 
                name="yearsOfExperience" 
                value={formData.yearsOfExperience} 
                onChange={handleChange} 
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
              {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">Weekly Availability</h3>
              <div className="flex flex-wrap gap-4 mb-3">
                <select 
                  name="day" 
                  value={availabilityEntry.day} 
                  onChange={handleAvailabilityChange} 
                  className="flex-grow p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none shadow-sm"
                >
                  <option value="">Select a day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs font-medium text-gray-600">From</label>
                    <input 
                      type="time" 
                      name="start" 
                      value={availabilityEntry.start} 
                      onChange={handleAvailabilityChange} 
                      className="p-3 pt-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none shadow-sm min-w-[140px]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs font-medium text-gray-600">To</label>
                    <input 
                      type="time" 
                      name="end" 
                      value={availabilityEntry.end} 
                      onChange={handleAvailabilityChange} 
                      className="p-3 pt-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none shadow-sm min-w-[140px]"
                    />
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={addAvailability} 
                className="w-full py-2 px-4 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Availability
              </button>
              
              {availabilities.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Added Availabilities:</h4>
                  <ul className="bg-white rounded-lg divide-y divide-gray-100 border border-gray-200 shadow-sm">
                    {availabilities.map((avail, index) => (
                      <li key={index} className="p-3 flex justify-between items-center">
                        <span className="flex items-center">
                          <span className="w-24 font-medium text-blue-900">{avail.day}</span>
                          <span className="text-gray-600">
                            <span className="inline-block bg-blue-50 px-2 py-1 rounded">{avail.start}</span>
                            <span className="mx-2">to</span>
                            <span className="inline-block bg-blue-50 px-2 py-1 rounded">{avail.end}</span>
                          </span>
                        </span>
                        <button 
                          type="button" 
                          onClick={() => removeAvailability(index)}
                          className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Biography:</label>
              <textarea 
                name="biography" 
                value={formData.biography} 
                onChange={handleChange} 
                rows="4" 
                placeholder="Tell us about yourself and your dance journey"
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              ></textarea>
              {errors.biography && <p className="text-red-500 text-sm mt-1">{errors.biography}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium">Achievements:</label>
              <input 
                type="text" 
                name="achievements" 
                value={formData.achievements} 
                onChange={handleChange} 
                placeholder="Separate achievements with commas" 
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
            </div>
            
            {submitError && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">{submitError}</div>}
            
            <div className="flex gap-4 pt-2">
              <button 
                type="button" 
                onClick={goBack} 
                className="w-1/3 py-3 bg-gray-300 text-gray-800 font-bold uppercase rounded-lg hover:bg-gray-400 transition shadow-md"
              >
                Back
              </button>
              <button 
                type="submit" 
                className="w-2/3 py-3 bg-blue-900 text-white font-bold uppercase rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Submit Application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MemberApplication;