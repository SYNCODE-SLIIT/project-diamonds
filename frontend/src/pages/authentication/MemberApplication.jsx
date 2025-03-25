import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    // Step 1 fields:
    fullName: '',
    email: '',
    contactNumber: '',
    birthDate: '',
    // Step 2 fields:
    danceStyle: '',
    yearsOfExperience: '',
    biography: '',
    achievements: ''
  });
  
  const [availabilityEntry, setAvailabilityEntry] = useState({
    date: '',
    start: '08:00',
    end: '22:00'
  });
  const [availabilities, setAvailabilities] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [responseMsg, setResponseMsg] = useState('');

  // Validate individual fields
  const validateField = (name, value) => {
    let errMsg = '';
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        errMsg = 'Invalid email format.';
      }
    }
    if (name === 'birthDate') {
      if (value) {
        const age = calculateAge(value);
        if (age < 18) {
          errMsg = 'You must be at least 18 years old.';
        }
      }
    }
    setErrors(prev => ({ ...prev, [name]: errMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setAvailabilityEntry(prev => ({ ...prev, [name]: value }));
  };

  const addAvailability = () => {
    if (availabilityEntry.date && availabilityEntry.start && availabilityEntry.end) {
      setAvailabilities(prev => [...prev, availabilityEntry]);
      setAvailabilityEntry({ date: '', start: '08:00', end: '22:00' });
    }
  };

  // Step 1: When "Next" is pressed, check required fields and email uniqueness.
  const handleStep1Next = async (e) => {
    e.preventDefault();
    setSubmitError('');
    // Validate required fields for step 1
    if (!formData.fullName || !formData.email || !formData.contactNumber || !formData.birthDate) {
      setSubmitError('Please fill in all required fields.');
      return;
    }
    if (errors.email || errors.birthDate) {
      setSubmitError('Please fix the errors before continuing.');
      return;
    }
    // Check if email already exists in the member applications collection
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
    // Proceed to step 2 if no errors
    setSubmitError('');
    setStep(2);
  };

  // Final submission (Step 2)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setResponseMsg('');
    // Construct payload
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
        // Redirect to Application Submitted page
        navigate('/application-submitted', { state: { message: data.message } });
      } else {
        setSubmitError(data.message || 'Submission failed');
      }
    } catch (error) {
      setSubmitError('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-cover bg-center" style={{ backgroundImage: "url('/images/background.jpeg')" }}>
      <div className="w-[600px] h-[700px] bg-white rounded-xl shadow-2xl p-8">
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">Member Application</h1>
            <div>
              <label className="block mb-1">Full Name:</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block mb-1">Email:</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div>
              <label className="block mb-1">Contact Number:</label>
              <input 
                type="text" 
                name="contactNumber" 
                value={formData.contactNumber} 
                onChange={handleChange} 
                required 
                className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
              />
              {errors.contactNumber && <p className="text-red-500 text-sm">{errors.contactNumber}</p>}
            </div>
            <div>
              <label className="block mb-1">Birth Date:</label>
              <input 
                type="date" 
                name="birthDate" 
                value={formData.birthDate} 
                onChange={handleChange} 
                required 
                className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
              />
              {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate}</p>}
            </div>
            {submitError && <div className="text-red-500 text-sm">{submitError}</div>}
            <button type="submit" className="w-full py-2 bg-blue-900 text-white font-bold uppercase rounded-full hover:bg-blue-700 transition">
              Next
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">Additional Details</h1>
            <div>
              <label className="block mb-1">Dance Style (Optional):</label>
              <input 
                type="text" 
                name="danceStyle" 
                value={formData.danceStyle} 
                onChange={handleChange} 
                className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
              />
            </div>
            <div>
              <label className="block mb-1">Years of Experience:</label>
              <input 
                type="number" 
                name="yearsOfExperience" 
                value={formData.yearsOfExperience} 
                onChange={handleChange} 
                className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
              />
            </div>
            <div className="availability-section">
              <h3 className="text-lg font-semibold mb-2">Availabilities</h3>
              <div className="flex space-x-2 mb-2">
                <input 
                  type="date" 
                  name="date" 
                  value={availabilityEntry.date} 
                  onChange={handleAvailabilityChange} 
                  className="p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                />
                <input 
                  type="time" 
                  name="start" 
                  value={availabilityEntry.start} 
                  onChange={handleAvailabilityChange} 
                  className="p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                />
                <input 
                  type="time" 
                  name="end" 
                  value={availabilityEntry.end} 
                  onChange={handleAvailabilityChange} 
                  className="p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                />
                <button type="button" onClick={addAvailability} className="py-2 px-3 bg-blue-900 text-white rounded-full hover:bg-blue-700 transition">
                  Add
                </button>
              </div>
              {availabilities.length > 0 && (
                <ul className="list-disc pl-5">
                  {availabilities.map((avail, index) => (
                    <li key={index}>{avail.date} – {avail.start} to {avail.end}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block mb-1">Biography:</label>
              <textarea 
                name="biography" 
                value={formData.biography} 
                onChange={handleChange} 
                rows="4" 
                className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
              ></textarea>
            </div>
            <div>
              <label className="block mb-1">Achievements (Comma-separated):</label>
              <input 
                type="text" 
                name="achievements" 
                value={formData.achievements} 
                onChange={handleChange} 
                placeholder="Separate achievements with commas" 
                className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
              />
            </div>
            {submitError && <div className="text-red-500 text-sm">{submitError}</div>}
            <button type="submit" className="w-full py-2 bg-blue-900 text-white font-bold uppercase rounded-full hover:bg-blue-700 transition">
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MemberApplication;