import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, LogIn } from 'lucide-react';
import assets from '../../assets/assets.js';

const CreateMemberAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const applicationId = queryParams.get('applicationId');

  const [applicant, setApplicant] = useState({ fullName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigateToLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    if (applicationId) {
      setLoading(true);
      fetch(`http://localhost:4000/api/users/create?applicationId=${applicationId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.fullName && data.email) {
            setApplicant({ fullName: data.fullName, email: data.email });
          } else {
            setFetchError("Failed to retrieve application details.");
          }
          setLoading(false);
        })
        .catch((err) => {
          setFetchError("Error: " + err.message);
          setLoading(false);
        });
    } else {
      setFetchError("Application ID is missing in the URL.");
      setLoading(false);
    }
  }, [applicationId]);

  const validatePassword = (pwd) => {
    if (!pwd) return "";

    const hasLowerCase = /[a-z]/.test(pwd);
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSpecial = /[@$!%*?&#^()_+\[\]{};':"\\|,.<>\/?]/.test(pwd);
    const isLongEnough = pwd.length >= 8;

    if (!hasLowerCase || !hasUpperCase || !hasDigit || !hasSpecial || !isLongEnough) {
      return "Password must be at least 8 characters and include uppercase, lowercase, a digit, and a symbol.";
    }

    return "";
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    const err = validatePassword(pwd);
    setPasswordError(err);
    if (confirmPassword && pwd !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const cpwd = e.target.value;
    setConfirmPassword(cpwd);
    if (password !== cpwd) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitMsg('');
    setSubmitting(true);

    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setPasswordError(pwdErr);
      setSubmitting(false);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: applicationId,
          password: password
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg("Account created successfully!");
        setTimeout(() => navigateToLogin(), 2000);
      } else {
        setSubmitError(data.message || "Error creating account.");
      }
    } catch (error) {
      setSubmitError("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <div className="w-20 h-20 rounded-full bg-blue-50"></div>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Loading your details</h3>
          <div className="mt-2 flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-center text-gray-600 mb-6">{fetchError}</p>
            <button 
              onClick={() => navigate('/login')} 
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition flex items-center justify-center"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat relative py-10"
         style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url(${assets.loginCover})` }}>
      
      <div className="absolute top-0 w-full bg-white/10 backdrop-blur-sm py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="text-white text-xl font-bold">Project Diamonds</div>
          <button 
            onClick={() => navigate('/login')}
            className="text-white hover:text-blue-200 flex items-center transition-colors"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign In
          </button>
        </div>
      </div>
      
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-10 z-10 mt-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Project Diamonds</h2>
          <p className="text-gray-600">Complete your account setup to get started</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={applicant.fullName} 
                  disabled 
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={applicant.email} 
                  disabled 
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Create Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={handlePasswordChange} 
                  required 
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {passwordError && (
                <div className="mt-2 text-red-600 text-sm flex items-start">
                  <AlertCircle className="h-5 w-5 mr-1 flex-shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword} 
                  onChange={handleConfirmPasswordChange} 
                  required 
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPasswordError && (
                <div className="mt-2 text-red-500 text-sm flex items-start">
                  <AlertCircle className="h-5 w-5 mr-1 flex-shrink-0 mt-0.5" />
                  <span>{confirmPasswordError}</span>
                </div>
              )}
            </div>
          </div>
          
          {submitMsg && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">{submitMsg}</p>
            </div>
          )}
          
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{submitError}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={submitting}
            className={`w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md flex items-center justify-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Creating Account...
              </>
            ) : 'Create Account'}
          </button>
        
        </form>
      </div>
      
      
    </div>
  );
};

export default CreateMemberAccount;