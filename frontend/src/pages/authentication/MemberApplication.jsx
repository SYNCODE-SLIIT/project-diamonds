import React, { useState } from 'react';

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
  
  // State for inline validation errors
  const [errors, setErrors] = useState({});
  
  // Single availability entry being edited
  const [availabilityEntry, setAvailabilityEntry] = useState({
    day: '',
    start: '',
    end: ''
  });
  
  // Array of availability entries
  const [availabilities, setAvailabilities] = useState([]);
  
  const [responseMsg, setResponseMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Basic field validation function
  const validateField = (name, value) => {
    let errorMsg = "";
    switch(name) {
      case "age":
        if (value && Number(value) < 18) {
          errorMsg = "Applicants must be at least 18 years old.";
        }
        break;
      case "email":
        // Basic email format check
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
    // Only add if all fields are filled
    if (availabilityEntry.day && availabilityEntry.start && availabilityEntry.end) {
      setAvailabilities(prev => [...prev, availabilityEntry]);
      setAvailabilityEntry({ day: '', start: '', end: '' });
    }
  };

  // Check email uniqueness on blur
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
    
    // If there are any errors, do not submit
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
    <div style={{
      margin: '20px',
      padding: '20px',
      maxWidth: '600px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0px 0px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Member Application</h2>
      {responseMsg && <div style={{ color: 'green', marginBottom: '10px', textAlign: 'center' }}>{responseMsg}</div>}
      {errorMsg && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{errorMsg}</div>}
      <form onSubmit={handleApplicationSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Full Name:</label>
          <input 
            type="text" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
          {errors.fullName && <div style={{ color: 'red' }}>{errors.fullName}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            onBlur={checkEmailUniqueness}
            required 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
          {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contact Number:</label>
          <input 
            type="text" 
            name="contactNumber" 
            value={formData.contactNumber} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
          {errors.contactNumber && <div style={{ color: 'red' }}>{errors.contactNumber}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Age:</label>
          <input 
            type="number" 
            name="age" 
            value={formData.age} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
          {errors.age && <div style={{ color: 'red' }}>{errors.age}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Dance Style:</label>
          <input 
            type="text" 
            name="danceStyle" 
            value={formData.danceStyle} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
          {errors.danceStyle && <div style={{ color: 'red' }}>{errors.danceStyle}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Years of Experience:</label>
          <input 
            type="number" 
            name="yearsOfExperience" 
            value={formData.yearsOfExperience} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
          {errors.yearsOfExperience && <div style={{ color: 'red' }}>{errors.yearsOfExperience}</div>}
        </div>
        {/* Availabilities Section */}
        <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '10px' }}>Availabilities</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Select Day:</label>
            <select 
              name="day" 
              value={availabilityEntry.day} 
              onChange={handleAvailabilityChange} 
              style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
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
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Start Time:</label>
            <input 
              type="time" 
              name="start" 
              value={availabilityEntry.start} 
              onChange={handleAvailabilityChange} 
              style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>End Time:</label>
            <input 
              type="time" 
              name="end" 
              value={availabilityEntry.end} 
              onChange={handleAvailabilityChange} 
              style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
            />
          </div>
          <button 
            type="button" 
            onClick={addAvailability} 
            style={{
              padding: '8px 12px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Availability
          </button>
          {availabilities.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <h4>Added Availabilities:</h4>
              <ul style={{ listStyleType: 'none', padding: '0' }}>
                {availabilities.map((avail, index) => (
                  <li key={index} style={{ marginBottom: '5px', background: '#f8f8f8', padding: '5px', borderRadius: '4px' }}>
                    {avail.day} — {avail.start} to {avail.end}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Biography:</label>
          <textarea 
            name="biography" 
            value={formData.biography} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px', height: '80px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
          {errors.biography && <div style={{ color: 'red' }}>{errors.biography}</div>}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Achievements:</label>
          <input 
            type="text" 
            name="achievements" 
            value={formData.achievements} 
            onChange={handleChange} 
            placeholder="Separate achievements with commas" 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
          {errors.achievements && <div style={{ color: 'red' }}>{errors.achievements}</div>}
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
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default MemberApplication;