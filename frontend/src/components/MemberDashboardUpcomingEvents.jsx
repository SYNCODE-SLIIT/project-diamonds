import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MemberDashboardUpcomingEvents = () => {
  const [assignmentRequests, setAssignmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignmentRequests();
  }, []);

  const fetchAssignmentRequests = async () => {
    try {
      // Get the current user's ID from localStorage or your auth context
      const userId = localStorage.getItem('userId'); // Adjust this based on how you store user info
      
      const response = await axios.get(`http://localhost:5173/team/assignment-requests/${userId}`);
      
      // Check if response.data is an array and has items
      if (Array.isArray(response.data) && response.data.length > 0) {
        setAssignmentRequests(response.data);
      } else {
        // If the response is empty or not in the expected format
        setAssignmentRequests([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to fetch assignment requests');
      setLoading(false);
    }
  };

  const handleEventResponse = async (requestId, status) => {
    try {
      await axios.put(`http://localhost:5173/team/assignment-requests/${requestId}/status`, {
        status: status
      });
      
      // Update the local state to reflect the change
      setAssignmentRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId 
            ? { ...request, status: status }
            : request
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update event status');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        fontSize: '1.1rem',
        color: '#dc3545'
      }}>
        {error}
      </div>
    );
  }

  if (!assignmentRequests || assignmentRequests.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h3 style={{ 
          color: '#495057',
          marginBottom: '10px',
          fontSize: '1.2rem'
        }}>
          No assignment requests found
        </h3>
        <p style={{ 
          color: '#6c757d',
          fontSize: '1rem'
        }}>
          You don't have any upcoming assignment requests at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="upcoming-events" style={{ padding: '20px' }}>
      <h2 style={{ 
        marginBottom: '20px',
        color: '#212529',
        fontSize: '1.5rem'
      }}>
        Upcoming Events
      </h2>
      <div className="events-list" style={{ 
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
      }}>
        {assignmentRequests.map((request) => (
          <div key={request.id} className="event-card" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              marginBottom: '10px',
              color: '#212529',
              fontSize: '1.2rem'
            }}>
              {request.title}
            </h3>
            <p style={{ 
              color: '#6c757d',
              marginBottom: '15px'
            }}>
              {request.description}
            </p>
            <div className="event-details" style={{
              borderTop: '1px solid #dee2e6',
              paddingTop: '15px',
              marginBottom: '15px'
            }}>
              <p style={{ marginBottom: '5px' }}>
                <strong>Start Date:</strong> {new Date(request.startDate).toLocaleDateString()}
              </p>
              <p style={{ marginBottom: '5px' }}>
                <strong>End Date:</strong> {new Date(request.endDate).toLocaleDateString()}
              </p>
              <p style={{ marginBottom: '5px' }}>
                <strong>Status:</strong>{' '}
                <span style={{
                  color: request.status === 'accepted' ? '#28a745' : 
                         request.status === 'rejected' ? '#dc3545' : '#ffc107'
                }}>
                  {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Pending'}
                </span>
              </p>
            </div>
            {!request.status && (
              <div className="event-actions" style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => handleEventResponse(request.id, 'accepted')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleEventResponse(request.id, 'rejected')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberDashboardUpcomingEvents; 