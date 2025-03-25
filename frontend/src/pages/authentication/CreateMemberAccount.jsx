import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CreateMemberAccount = () => {
  // Get applicationId from the query parameters
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const applicationId = queryParams.get('applicationId');

  // State for applicant details (full name, email)
  const [applicant, setApplicant] = useState({ fullName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // States for password fields and validation errors
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');

  const navigateToLogin = () => {
    navigate('/login');
  };

  // Fetch applicant details from backend using the applicationId
  useEffect(() => {
    if (applicationId) {
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

  // Validate password with real-time feedback
  const validatePassword = (pwd) => {
    // Regex: at least one lowercase, one uppercase, one digit, one special symbol, and minimum 8 characters.
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\[\]{};':"\\|,.<>\/?])[A-Za-z\d@$!%*?&#^()_+\[\]{};':"\\|,.<>\/?]{8,}$/;
    if (!regex.test(pwd)) {
      return "Password must be at least 8 characters long and include uppercase, lowercase, a digit, and a symbol.";
    }
    return "";
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    const err = validatePassword(pwd);
    setPasswordError(err);
    // Also check if confirm password matches
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
    
    // Final validation before submitting
    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setPasswordError(pwdErr);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }
    
    // Send POST request to create the user account
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
        // Redirect to the login page after account creation
        navigateToLogin();
      } else {
        setSubmitError(data.message || "Error creating account.");
      }
    } catch (error) {
      setSubmitError("Error: " + error.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (fetchError) {
    return <div className="p-8 text-center text-red-600">{fetchError}</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      {/* Container styled similar to the organizer page form */}
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Full Name:</label>
            <input 
              type="text" 
              value={applicant.fullName} 
              disabled 
              className="w-full p-2 bg-gray-100 border border-blue-500 rounded focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Email:</label>
            <input 
              type="email" 
              value={applicant.email} 
              disabled 
              className="w-full p-2 bg-gray-100 border border-blue-500 rounded focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={handlePasswordChange} 
              required 
              className="w-full p-2 bg-gray-100 border border-blue-500 rounded focus:ring-2 focus:ring-blue-900"
            />
            {passwordError && <div className="text-red-500 text-xs mt-1">{passwordError}</div>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Confirm Password:</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={handleConfirmPasswordChange} 
              required 
              className="w-full p-2 bg-gray-100 border border-blue-500 rounded focus:ring-2 focus:ring-blue-900"
            />
            {confirmPasswordError && <div className="text-red-500 text-xs mt-1">{confirmPasswordError}</div>}
          </div>
          {submitMsg && <div className="text-green-500 text-sm">{submitMsg}</div>}
          {submitError && <div className="text-red-500 text-sm">{submitError}</div>}
          <button 
            type="submit" 
            className="w-full py-2 bg-blue-900 text-white font-bold uppercase rounded-full hover:bg-blue-700 transition"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMemberAccount;