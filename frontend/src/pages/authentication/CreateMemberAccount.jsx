import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const CreateMemberAccount = () => {
  // Get applicationId from the query parameters
  const location = useLocation();
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

  // Fetch applicant details from backend using the applicationId
  useEffect(() => {
    if (applicationId) {
      fetch(`http://localhost:4000/api/users/create?applicationId=${applicationId}`)
        .then(res => res.json())
        .then(data => {
          if (data.fullName && data.email) {
            setApplicant({ fullName: data.fullName, email: data.email });
          } else {
            setFetchError("Failed to retrieve application details.");
          }
          setLoading(false);
        })
        .catch(err => {
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
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+[\]{};':"\\|,.<>/?])[A-Za-z\d@$!%*?&#^()_+[\]{};':"\\|,.<>/?]{8,}$/;
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
      } else {
        setSubmitError(data.message || "Error creating account.");
      }
    } catch (error) {
      setSubmitError("Error: " + error.message);
    }
  };

  if (loading) {
    return <div style={{ margin: '20px', padding: '20px' }}>Loading...</div>;
  }
  if (fetchError) {
    return <div style={{ margin: '20px', padding: '20px', color: 'red' }}>{fetchError}</div>;
  }

  return (
    <div style={{
      margin: '20px',
      padding: '20px',
      maxWidth: '500px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0px 0px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Your Account</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Full Name:</label>
          <input 
            type="text" 
            value={applicant.fullName} 
            disabled 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input 
            type="email" 
            value={applicant.email} 
            disabled 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={handlePasswordChange} 
            required 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
          {passwordError && <div style={{ color: 'red', marginTop: '5px' }}>{passwordError}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password:</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={handleConfirmPasswordChange} 
            required 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
          {confirmPasswordError && <div style={{ color: 'red', marginTop: '5px' }}>{confirmPasswordError}</div>}
        </div>
        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Create Account
        </button>
        {submitMsg && <div style={{ color: 'green', marginTop: '10px' }}>{submitMsg}</div>}
        {submitError && <div style={{ color: 'red', marginTop: '10px' }}>{submitError}</div>}
      </form>
    </div>
  );
};

export default CreateMemberAccount;