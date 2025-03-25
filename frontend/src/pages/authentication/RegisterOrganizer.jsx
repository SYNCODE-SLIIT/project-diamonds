import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import './MemberApplication.css'; // Ensure Tailwind is configured in your project

const RegisterOrganizer = () => {
  const navigate = useNavigate();
  
  // Step state: 1 for basic info; 2 for additional organizer details.
  const [step, setStep] = useState(1);
  
  // Combined form data state
  const [formData, setFormData] = useState({
    // Step 1 fields:
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
    // Step 2 fields:
    organizationName: '',
    businessAddress: '',
    website: '',
    contactNumber: '',
    // Unused fields, will be sent as null:
    organizationDescription: null,
    facebook: null,
    twitter: null,
    instagram: null
  });
  
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [responseMsg, setResponseMsg] = useState('');

  // Inline validation for individual fields
  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        errorMsg = 'Invalid email format.';
      }
    }
    if (name === 'password') {
      // Password must be at least 8 characters with uppercase, lowercase, digit, symbol
      const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (value && !pwdRegex.test(value)) {
        errorMsg = 'Password must be at least 8 characters, include uppercase, lowercase, digit and symbol.';
      }
    }
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        errorMsg = 'Passwords do not match.';
      }
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    validateField(name, fieldValue);
  };

  // Handler for Step 1 "Next" button with email uniqueness check
  const handleNext = async (e) => {
    e.preventDefault();
    setSubmitError('');
    // Validate required fields for step 1
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setSubmitError('Please fill in all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }
    if (!formData.agree) {
      setSubmitError('You must agree to the Terms and Conditions.');
      return;
    }
    // Check if email already exists
    try {
      const res = await fetch(`http://localhost:4000/api/users/check-email?email=${encodeURIComponent(formData.email)}`);
      const data = await res.json();
      if (data.exists) {
        setSubmitError('An account with that email already exists.');
        return;
      }
    } catch (err) {
      setSubmitError('Error checking email uniqueness: ' + err.message);
      return;
    }
    // Proceed to step 2 if no errors
    setStep(2);
  };

  // Handler for final submission in step 2
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setResponseMsg('');
    // Validate required fields for step 2
    if (!formData.organizationName || !formData.businessAddress || !formData.website || !formData.contactNumber) {
      setSubmitError('Please fill in all required organizer details.');
      return;
    }
    // Construct payload (fields not provided will be null)
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password, // plaintext for now; consider hashing later
      contactNumber: formData.contactNumber,
      organizationName: formData.organizationName,
      organizationDescription: formData.organizationDescription,
      businessAddress: formData.businessAddress,
      website: formData.website,
      socialMediaLinks: {
        facebook: formData.facebook,
        twitter: formData.twitter,
        instagram: formData.instagram
      }
    };

    try {
      const res = await fetch('http://localhost:4000/api/organizers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setResponseMsg('Organizer account created successfully.');
        // Optionally, clear the form and/or redirect to login/dashboard
        navigate('/login');
      } else {
        setSubmitError(data.message || 'Failed to create account.');
      }
    } catch (error) {
      setSubmitError('Error: ' + error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/background.jpeg')" }}>
      <div id="container" className="relative w-[850px] h-[600px] bg-white rounded-xl shadow-2xl overflow-hidden">
        {step === 1 && (
          <>
            {/* Step 1: Basic Info */}
            <div className="absolute top-0 left-0 w-1/2 h-full">
              <form onSubmit={handleNext} className="h-full flex flex-col items-center justify-center px-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Register</h1>
                <div className="w-10/12 mb-4">
                  <input 
                    type="text" 
                    name="fullName" 
                    placeholder="Full Name" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="w-10/12 mb-4">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                  />
                  {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                </div>
                <div className="w-10/12 mb-4">
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                  />
                  {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                </div>
                <div className="w-10/12 mb-4">
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    placeholder="Confirm Password" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                  />
                  {errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>}
                </div>
                <div className="w-10/12 mb-4">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="agree" 
                      checked={formData.agree} 
                      onChange={handleChange} 
                      required 
                      className="mr-2"
                    />
                    <span className="text-sm">
                      I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-blue-900">Terms and Conditions</a>
                    </span>
                  </label>
                </div>
                {submitError && <div className="text-red-500 text-sm mb-4">{submitError}</div>}
                <button type="submit" className="w-10/12 py-2 bg-blue-900 text-white font-bold uppercase rounded-full hover:bg-blue-700 transition">
                  Next
                </button>
              </form>
            </div>
            {/* Right half overlay */}
            <div className="absolute top-0 left-1/2 w-1/2 h-full">
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4">
                <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
                <p className="text-sm mb-6 text-center">
                  Already have an account? Click below to sign in.
                </p>
                <a 
                  href="/login" 
                  className="py-2 px-6 border border-white rounded-full uppercase font-bold hover:bg-white hover:text-blue-900 transition"
                >
                  Sign In
                </a>
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            {/* Step 2: Organizer Details */}
            <div className="absolute top-0 left-0 w-1/2 h-full">
              <form onSubmit={handleSubmit} className="h-full flex flex-col items-center justify-center px-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Organizer Details</h1>
                <div className="w-10/12 mb-4">
                  <input 
                    type="text" 
                    name="organizationName" 
                    placeholder="Organization Name" 
                    value={formData.organizationName} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="w-10/12 mb-4">
                  <input 
                    type="text" 
                    name="businessAddress" 
                    placeholder="Business Address" 
                    value={formData.businessAddress} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="w-10/12 mb-4">
                  <input 
                    type="text" 
                    name="website" 
                    placeholder="Website" 
                    value={formData.website} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="w-10/12 mb-4">
                  <input 
                    type="text" 
                    name="contactNumber" 
                    placeholder="Contact Number" 
                    value={formData.contactNumber} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                {submitError && <div className="text-red-500 text-sm mb-4">{submitError}</div>}
                <button type="submit" className="w-10/12 py-2 bg-blue-900 text-white font-bold uppercase rounded-full hover:bg-blue-700 transition">
                  Sign Up
                </button>
              </form>
            </div>
            {/* Right half overlay */}
            <div className="absolute top-0 left-1/2 w-1/2 h-full">
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4">
                <h1 className="text-2xl font-bold mb-4">Almost Done!</h1>
                <p className="text-sm mb-6 text-center">
                  Complete your organizer registration by providing additional details.
                </p>
                <a 
                  href="/login" 
                  className="py-2 px-6 border border-white rounded-full uppercase font-bold hover:bg-white hover:text-blue-900 transition"
                >
                  Sign In
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterOrganizer;