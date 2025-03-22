import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MemberApplication.css'; // Reuse your styling

const RegisterOrganizer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    organizationName: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    organizationDescription: '',
    businessAddress: '',
    website: '',
    facebook: '',
    twitter: '',
    instagram: ''
  });
  
  const [errors, setErrors] = useState({});
  const [responseMsg, setResponseMsg] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Basic field validation function
  const validateField = (name, value) => {
    let errorMsg = "";
    if(name === 'email'){
      // Simple email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        errorMsg = "Invalid email format.";
      }
    }
    if(name === 'password'){
      // Password must be at least 8 characters, one uppercase, one lowercase, one digit, one symbol.
      const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if(value && !pwdRegex.test(value)){
        errorMsg = "Password must be at least 8 characters, include uppercase, lowercase, digit and symbol.";
      }
    }
    if(name === 'confirmPassword'){
      if(value !== formData.password){
        errorMsg = "Passwords do not match.";
      }
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMsg('');
    setSubmitError('');

    // Check for errors before submitting
    for(let key in errors){
      if(errors[key]){
        setSubmitError("Please fix the errors before submitting.");
        return;
      }
    }
    // Also ensure required fields are filled:
    if(!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword){
      setSubmitError("Please fill in all required fields.");
      return;
    }

    // Construct the payload for the backend
    const payload = {
      fullName: formData.fullName,
      organizationName: formData.organizationName,
      email: formData.email,
      contactNumber: formData.contactNumber,
      password: formData.password,  // plaintext for now
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
        setResponseMsg("Organizer account created successfully.");
        // Optionally, redirect or clear form here:
        navigate('/');
      } else {
        setSubmitError(data.message || "Failed to create account.");
      }
    } catch (error) {
      setSubmitError("Error: " + error.message);
    }
  };

  return (
    <div className="application-container">
      <h2 className="application-title">Organizer Registration</h2>
      {responseMsg && <div className="success-message">{responseMsg}</div>}
      {submitError && <div className="error-message">{submitError}</div>}
      <form className="application-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name*</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
          {errors.fullName && <div className="error-text">{errors.fullName}</div>}
        </div>
        <div className="form-group">
          <label>Organization Name</label>
          <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email*</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label>Contact Number</label>
          <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Password*</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          {errors.password && <div className="error-text">{errors.password}</div>}
        </div>
        <div className="form-group">
          <label>Confirm Password*</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
        </div>
        <div className="form-group">
          <label>Organization Description</label>
          <textarea name="organizationDescription" value={formData.organizationDescription} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Business Address</label>
          <input type="text" name="businessAddress" value={formData.businessAddress} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Website</label>
          <input type="text" name="website" value={formData.website} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Facebook</label>
          <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Twitter</label>
          <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Instagram</label>
          <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} />
        </div>
        <button type="submit" className="submit-button">Create Organizer Account</button>
      </form>
    </div>
  );
};

export default RegisterOrganizer;