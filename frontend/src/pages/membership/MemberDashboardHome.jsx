import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../context/userContext';
// import MemberDashboardLayout from '../../components/layout/MemberDashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';

const MemberDashboardHome = () => {
   useUserAuth();
  const { user } = useContext(UserContext);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch application details once when user is available and application not yet loaded.
  useEffect(() => {
    if (user && user.profileId && !application) {
      setLoading(true);
      fetch(`http://localhost:4000/api/admin/applications/${user.profileId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // Adjust if your API wraps the data; otherwise, use data directly.
          setApplication(data.application || data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load application details:", err);
          setError("Failed to load application details: " + err.message);
          setLoading(false);
        });
    }
  }, [user, application]);

  return (
   
      <div style={{ padding: '20px' }}>
        <h1>Member Dashboard Home</h1>
        {loading && <p>Loading dashboard data...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {user && (
          <div>
            <h2>User Information</h2>
            <table border="1" cellPadding="8" cellSpacing="0">
              <tbody>
                <tr>
                  <th>Full Name</th>
                  <td>{user.fullName}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{user.email}</td>
                </tr>
                <tr>
                  <th>Role</th>
                  <td>{user.role}</td>
                </tr>
                <tr>
                  <th>Profile ID</th>
                  <td>{user.profileId}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {application ? (
          <div style={{ marginTop: '20px' }}>
            <h2>Application Information</h2>
            <table border="1" cellPadding="8" cellSpacing="0">
              <tbody>
                <tr>
                  <th>Full Name</th>
                  <td>{application.fullName}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{application.email}</td>
                </tr>
                <tr>
                  <th>Contact Number</th>
                  <td>{application.contactNumber}</td>
                </tr>
                <tr>
                  <th>Dance Style</th>
                  <td>{application.danceStyle}</td>
                </tr>
                <tr>
                  <th>Age</th>
                  <td>{application.age}</td>
                </tr>
                <tr>
                  <th>Years of Experience</th>
                  <td>{application.yearsOfExperience}</td>
                </tr>
                <tr>
                  <th>Biography</th>
                  <td>{application.biography}</td>
                </tr>
                <tr>
                  <th>Achievements</th>
                  <td>{application.achievements && application.achievements.join(', ')}</td>
                </tr>
                <tr>
                  <th>Availabilities</th>
                  <td>
                    {application.availability && application.availability.length > 0 ? (
                      <ul>
                        {application.availability.map((item, index) => (
                          <li key={index}>
                            {item.day}: {item.start} - {item.end}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No availabilities provided."
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p>No application details found.</p>
        )}
      </div>
  
  );
};

export default MemberDashboardHome;