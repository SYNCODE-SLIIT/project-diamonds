import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../../context/userContext';
import '../../styles/Auth.css';
import assets from '../../assets/assets.js';

const AuthPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);
  
  // Toggle between login and signup
  const [isLogin, setIsLogin] = useState(true);
  // Track signup steps
  const [signupStep, setSignupStep] = useState(1);
  
  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  // Signup form state - combined for both steps
  const [signupData, setSignupData] = useState({
    // Step 1 fields
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
    // Step 2 fields
    organizationName: '',
    businessAddress: '',
    website: '',
    contactNumber: '',
    // Unused fields, will be sent as null
    organizationDescription: null,
    facebook: null,
    twitter: null,
    instagram: null
  });
  const [signupErrors, setSignupErrors] = useState({});
  const [signupSubmitError, setSignupSubmitError] = useState('');
  
  // Toggle function that respects multi-step signup
  const toggleForm = () => {
    if (isLogin) {
      setIsLogin(false);
      setSignupStep(1);
    } else {
      setIsLogin(true);
      setSignupStep(1);
    }
  };
  
  // Login form handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const res = await fetch('http://localhost:4000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        updateUser(data.user);
        // Role-based redirection
        if (data.user.role === 'member') {
          navigate('/member-dashboard');
        } else if (data.user.role === 'organizer') {
          navigate('/');
        } else if (data.user.role === 'teamManager') {
          navigate('/messaging/create-group');
        } else if (data.user.role === 'contentManager') {
          navigate('/content-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setLoginError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setLoginError('Error: ' + error.message);
    }
  };
  
  // Signup form handlers
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
      if (value !== signupData.password) {
        errorMsg = 'Passwords do not match.';
      }
    }
    setSignupErrors(prev => ({ ...prev, [name]: errorMsg }));
  };
  
  const handleSignupChange = (e) => {
    const { name, type, value, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setSignupData(prev => ({ ...prev, [name]: fieldValue }));
    validateField(name, fieldValue);
  };
  
  const handleSignupStep1 = async (e) => {
    e.preventDefault();
    setSignupSubmitError('');
    
    // Validate required fields for step 1
    if (!signupData.fullName || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setSignupSubmitError('Please fill in all required fields.');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setSignupSubmitError('Passwords do not match.');
      return;
    }
    if (!signupData.agree) {
      setSignupSubmitError('You must agree to the Terms and Conditions.');
      return;
    }
    
    // Check if email already exists
    try {
      const res = await fetch(`http://localhost:4000/api/users/check-email?email=${encodeURIComponent(signupData.email)}`);
      const data = await res.json();
      if (data.exists) {
        setSignupSubmitError('An account with that email already exists.');
        return;
      }
    } catch (err) {
      setSignupSubmitError('Error checking email uniqueness: ' + err.message);
      return;
    }
    
    // Proceed to step 2 if no errors
    setSignupStep(2);
  };
  
  const handleSignupStep2 = async (e) => {
    e.preventDefault();
    setSignupSubmitError('');
    
    // Validate required fields for step 2
    if (!signupData.organizationName || !signupData.businessAddress || !signupData.website || !signupData.contactNumber) {
      setSignupSubmitError('Please fill in all required organizer details.');
      return;
    }
    
    // Construct payload
    const payload = {
      fullName: signupData.fullName,
      email: signupData.email,
      password: signupData.password,
      contactNumber: signupData.contactNumber,
      organizationName: signupData.organizationName,
      organizationDescription: signupData.organizationDescription,
      businessAddress: signupData.businessAddress,
      website: signupData.website,
      socialMediaLinks: {
        facebook: signupData.facebook,
        twitter: signupData.twitter,
        instagram: signupData.instagram
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
        // Success - redirect to login
        setIsLogin(true);
        setSignupStep(1);
      } else {
        setSignupSubmitError(data.message || 'Failed to create account.');
      }
    } catch (error) {
      setSignupSubmitError('Error: ' + error.message);
    }
  };
  
  // Go back to step 1
  const handleBackToStep1 = () => {
    setSignupStep(1);
  };
  
  return (
    <div 
      className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.loginCover})` }}
    >
      <div id="container" className="relative w-[850px] h-[600px] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Left Half: Form Area */}
        <div className="absolute top-0 left-0 w-1/2 h-full">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <form onSubmit={handleLoginSubmit} className="h-full flex flex-col items-center justify-center px-8">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">Login</h1>
                  {loginError && <div className="error-message mb-4 text-red-500">{loginError}</div>}
                  <div className="w-10/12 mb-4">
                    <input
                      type="email"
                      placeholder="Email"
                      name="email"
                      required
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="w-full p-2 bg-gray-100 border-none outline-none rounded focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <div className="w-10/12 mb-6">
                    <input
                      type="password"
                      placeholder="Password"
                      name="password"
                      required
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="w-full p-2 bg-gray-100 border-none outline-none rounded focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-10/12 py-2 bg-blue-900 text-white font-bold uppercase rounded-full hover:bg-blue-700 transition"
                  >
                    Sign In
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {signupStep === 1 ? (
                  <form onSubmit={handleSignupStep1} className="h-full flex flex-col items-center justify-center px-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Register</h1>
                    <div className="w-10/12 mb-4">
                      <input 
                        type="text" 
                        name="fullName" 
                        placeholder="Full Name" 
                        value={signupData.fullName} 
                        onChange={handleSignupChange} 
                        required 
                        className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                    <div className="w-10/12 mb-4">
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        value={signupData.email} 
                        onChange={handleSignupChange} 
                        required 
                        className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                      />
                      {signupErrors.email && <div className="text-red-500 text-sm mt-1">{signupErrors.email}</div>}
                    </div>
                    <div className="w-10/12 mb-4">
                      <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        value={signupData.password} 
                        onChange={handleSignupChange} 
                        required 
                        className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                      />
                      {signupErrors.password && <div className="text-red-500 text-sm mt-1">{signupErrors.password}</div>}
                    </div>
                    <div className="w-10/12 mb-4">
                      <input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="Confirm Password" 
                        value={signupData.confirmPassword} 
                        onChange={handleSignupChange} 
                        required 
                        className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                      />
                      {signupErrors.confirmPassword && <div className="text-red-500 text-sm mt-1">{signupErrors.confirmPassword}</div>}
                    </div>
                    <div className="w-10/12 mb-4">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          name="agree" 
                          checked={signupData.agree} 
                          onChange={handleSignupChange} 
                          required 
                          className="mr-2"
                        />
                        <span className="text-sm">
                          I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-blue-900">Terms and Conditions</a>
                        </span>
                      </label>
                    </div>
                    {signupSubmitError && <div className="text-red-500 text-sm mb-4">{signupSubmitError}</div>}
                    <button type="submit" className="w-10/12 py-2 bg-blue-900 text-white font-bold uppercase rounded-full hover:bg-blue-700 transition">
                      Next
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignupStep2} className="h-full flex flex-col items-center justify-center px-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Organizer Details</h1>
                    <div className="w-10/12 mb-4">
                      <input 
                        type="text" 
                        name="organizationName" 
                        placeholder="Organization Name" 
                        value={signupData.organizationName} 
                        onChange={handleSignupChange} 
                        required 
                        className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                    <div className="w-10/12 mb-4">
                      <input 
                        type="text" 
                        name="businessAddress" 
                        placeholder="Business Address" 
                        value={signupData.businessAddress} 
                        onChange={handleSignupChange} 
                        required 
                        className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                    <div className="w-10/12 mb-4">
                      <input 
                        type="text" 
                        name="website" 
                        placeholder="Website" 
                        value={signupData.website} 
                        onChange={handleSignupChange} 
                        required 
                        className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                    <div className="w-10/12 mb-4">
                      <input 
                        type="text" 
                        name="contactNumber" 
                        placeholder="Contact Number" 
                        value={signupData.contactNumber} 
                        onChange={handleSignupChange} 
                        required 
                        className="w-full p-2 bg-gray-100 border-none rounded focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                    {signupSubmitError && <div className="text-red-500 text-sm mb-4">{signupSubmitError}</div>}
                    <div className="w-10/12 flex justify-between">
                      <button 
                        type="button" 
                        onClick={handleBackToStep1} 
                        className="w-5/12 py-2 bg-gray-300 text-gray-800 font-bold uppercase rounded-full hover:bg-gray-400 transition"
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        className="w-5/12 py-2 bg-blue-900 text-white font-bold uppercase rounded-full hover:bg-blue-700 transition"
                      >
                        Sign Up
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Half: Info Panel */}
        <div className="absolute top-0 left-1/2 w-1/2 h-full">
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4">
            <h1 className="text-2xl font-bold mb-4">
              {isLogin ? "Welcome Back!" : (signupStep === 1 ? "Join Us Today!" : "Almost Done!")}
            </h1>
            <p className="text-sm mb-6 text-center">
              {isLogin 
                ? "To keep connected, please login with your personal info." 
                : (signupStep === 1 
                    ? "Create an account to start organizing events." 
                    : "Complete your organizer registration by providing additional details.")}
            </p>
            <button 
              onClick={toggleForm}
              className="py-2 px-6 border border-white rounded-full uppercase font-bold hover:bg-white hover:text-blue-900 transition"
            >
              {isLogin ? "Register" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
