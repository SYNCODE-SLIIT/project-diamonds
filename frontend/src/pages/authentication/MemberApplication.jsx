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
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleAvailabilityChange = (e) => {
    setAvailabilityEntry({
      ...availabilityEntry,
      [e.target.name]: e.target.value
    });
  };
  
  const addAvailability = () => {
    // Only add if all fields are filled
    if(availabilityEntry.day && availabilityEntry.start && availabilityEntry.end) {
      setAvailabilities([...availabilities, availabilityEntry]);
      setAvailabilityEntry({ day: '', start: '', end: '' });
    }
  };
  
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setResponseMsg('');
    setErrorMsg('');
    
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
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px', border: '1px solid #007BFF', borderRadius: '4px' }}
          />
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