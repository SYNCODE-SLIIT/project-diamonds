import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const AdminApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:4000/api/admin/applications/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.application) {
          setApplication(data.application);
        } else {
          setErrorMsg("Application not found.");
        }
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Error fetching application: " + err.message);
        setLoading(false);
      });
  }, [id]);

  const updateStatus = (newStatus) => {
    fetch(`http://localhost:4000/api/admin/applications/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.application) {
          setApplication(data.application);
          setStatusMsg(`Application ${newStatus.toLowerCase()} successfully!`);
        } else {
          setErrorMsg(data.message || 'Error updating status');
        }
      })
      .catch(err => {
        setErrorMsg("Error updating status: " + err.message);
      });
  };

  if (loading) 
    return <div style={{ margin: '20px', padding: '20px' }}>Loading...</div>;

  if (errorMsg) 
    return <div style={{ margin: '20px', padding: '20px', color: 'red' }}>{errorMsg}</div>;

  return (
    <div style={{ margin: '20px', padding: '20px', maxWidth: '800px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Application Details</h2>
      {statusMsg && <p style={{ color: 'green' }}>{statusMsg}</p>}
      <p><strong>Full Name:</strong> {application.fullName}</p>
      <p><strong>Email:</strong> {application.email}</p>
      <p><strong>Contact Number:</strong> {application.contactNumber}</p>
      <p>
        <strong>Birth Date:</strong> {application.birthDate ? new Date(application.birthDate).toLocaleDateString() : 'N/A'}
      </p>
      <p><strong>Age:</strong> {application.age}</p>
      <p><strong>Dance Style:</strong> {application.danceStyle}</p>
      <p><strong>Years of Experience:</strong> {application.yearsOfExperience}</p>
      <p><strong>Biography:</strong> {application.biography}</p>
      <p><strong>Achievements:</strong> {application.achievements && application.achievements.join(', ')}</p>
      <div>
        <strong>Availabilities:</strong>
        {application.availability && application.availability.length > 0 ? (
          <ul>
            {application.availability.map((avail, index) => (
              <li key={index}>{avail.day} — {avail.start} to {avail.end}</li>
            ))}
          </ul>
        ) : (
          <p>No availabilities provided.</p>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => updateStatus("Approved")}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Accept
        </button>
        <button 
          onClick={() => updateStatus("Rejected")}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default AdminApplicationDetails;