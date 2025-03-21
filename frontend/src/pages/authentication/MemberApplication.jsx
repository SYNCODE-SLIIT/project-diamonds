import React, { useState } from 'react';
import './MemberApplication.css'; // Don't forget to create this CSS file

const MemberApplication = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    age: '',
    danceStyle: '',
    yearsOfExperience: '',
    biography: '',
    achievements: ''
  });
  
  const [errors, setErrors] = useState({});
  const [availabilityEntry, setAvailabilityEntry] = useState({
    day: '',
    start: '',
    end: ''
  });
  
  const [availabilities, setAvailabilities] = useState([]);
  
  const [responseMsg, setResponseMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const validateField = (name, value) => {
    let errorMsg = "";
    switch(name) {
      case "age":
        if (value && Number(value) < 18) {
          errorMsg = "Applicants must be at least 18 years old.";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          errorMsg = "Invalid email format.";
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
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
    if (availabilityEntry.day && availabilityEntry.start && availabilityEntry.end) {
      setAvailabilities(prev => [...prev, availabilityEntry]);
      setAvailabilityEntry({ day: '', start: '', end: '' });
    }
  };

  const checkEmailUniqueness = async () => {
    if(formData.email) {
      try {
        const res = await fetch(`http://localhost:4000/api/member-applications/check-email?email=${encodeURIComponent(formData.email)}`);
        const data = await res.json();
        if(data.exists) {
          setErrors(prev => ({ ...prev, email: "An application with that email already exists." }));
        } else {
          setErrors(prev => ({ ...prev, email: "" }));
        }
      } catch (err) {
        console.error("Error checking email uniqueness", err);
      }
    }
  };
  
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setResponseMsg('');
    setErrorMsg('');
    
    for (let key in errors) {
      if (errors[key]) {
        setErrorMsg("Please fix the errors before submitting.");
        return;
      }
    }
    
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      contactNumber: formData.contactNumber,
      age: Number(formData.age),
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setResponseMsg('Application submitted successfully!');
      } else {
        setErrorMsg(data.message || 'Submission failed');
      }
    } catch (error) {
      setErrorMsg('Error: ' + error.message);
    }
  };

  return (
    <div className="application-container">
      <h2 className="application-title">Member Application</h2>
      {responseMsg && <div className="success-message">{responseMsg}</div>}
      {errorMsg && <div className="error-message">{errorMsg}</div>}
      <form onSubmit={handleApplicationSubmit} className="application-form">
        <div className="form-group">
          <label>Full Name:</label>
          <input 
            type="text" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleChange} 
            required 
          />
          {errors.fullName && <div className="error-text">{errors.fullName}</div>}
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            onBlur={checkEmailUniqueness}
            required 
          />
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label>Contact Number:</label>
          <input 
            type="text" 
            name="contactNumber" 
            value={formData.contactNumber} 
            onChange={handleChange} 
          />
          {errors.contactNumber && <div className="error-text">{errors.contactNumber}</div>}
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input 
            type="number" 
            name="age" 
            value={formData.age} 
            onChange={handleChange} 
            required 
          />
          {errors.age && <div className="error-text">{errors.age}</div>}
        </div>
        <div className="form-group">
          <label>Dance Style:</label>
          <input 
            type="text" 
            name="danceStyle" 
            value={formData.danceStyle} 
            onChange={handleChange} 
            required 
          />
          {errors.danceStyle && <div className="error-text">{errors.danceStyle}</div>}
        </div>
        <div className="form-group">
          <label>Years of Experience:</label>
          <input 
            type="number" 
            name="yearsOfExperience" 
            value={formData.yearsOfExperience} 
            onChange={handleChange} 
          />
          {errors.yearsOfExperience && <div className="error-text">{errors.yearsOfExperience}</div>}
        </div>
        <div className="availability-section">
          <h3>Availabilities</h3>
          <div className="availability-inputs">
            <div className="form-group">
              <label>Select Day:</label>
              <select 
                name="day" 
                value={availabilityEntry.day} 
                onChange={handleAvailabilityChange} 
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
            </div>
            <div className="form-group">
              <label>Start Time:</label>
              <input 
                type="time" 
                name="start" 
                value={availabilityEntry.start} 
                onChange={handleAvailabilityChange} 
              />
            </div>
            <div className="form-group">
              <label>End Time:</label>
              <input 
                type="time" 
                name="end" 
                value={availabilityEntry.end} 
                onChange={handleAvailabilityChange} 
              />
            </div>
            <button type="button" onClick={addAvailability} className="add-button">
              Add Availability
            </button>
          </div>
          {availabilities.length > 0 && (
            <div className="availability-list">
              <h4>Added Availabilities:</h4>
              <ul>
                {availabilities.map((avail, index) => (
                  <li key={index}>
                    {avail.day} — {avail.start} to {avail.end}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Biography:</label>
          <textarea 
            name="biography" 
            value={formData.biography} 
            onChange={handleChange} 
            rows="5"
          />
          {errors.biography && <div className="error-text">{errors.biography}</div>}
        </div>
        <div className="form-group">
          <label>Achievements:</label>
          <input 
            type="text" 
            name="achievements" 
            value={formData.achievements} 
            onChange={handleChange} 
            placeholder="Separate achievements with commas" 
          />
          {errors.achievements && <div className="error-text">{errors.achievements}</div>}
        </div>
        <button type="submit" className="submit-button">
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default MemberApplication;