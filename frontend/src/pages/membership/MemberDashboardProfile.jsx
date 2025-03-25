import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import 'boxicons';

import './MemberDashboardProfile.css'; 
import { useUserAuth } from '../../hooks/useUserAuth';

const MemberDashboardProfile = () => {
  const { user } = useContext(UserContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useUserAuth();

  useEffect(() => {
    if (user && user.profileId) {
      setLoading(true);
      fetch(`http://localhost:4000/api/member-applications/${user.profileId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // If your API returns data wrapped in an "application" property, use that; otherwise, use data directly.
          setProfileData(data.application || data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load profile:", err);
          setErrorMsg("Failed to load profile: " + err.message);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <div className="loading-state">Loading profile...</div>;
  if (errorMsg) return <div className="error-state">{errorMsg}</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2 className="profile-title">Profile Details</h2>
          <div className="flex justify-center mb-8">
           {profileData && profileData.profilePicture ? (
             <img
               src={profileData.profilePicture}
               alt="Profile"
               className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
             />
           ) : (
             <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-200 border-4 border-blue-500">
               <box-icon name="user" color="#2a2a5a" size="lg"></box-icon>
             </div>
           )}
         </div>
      </div>
      
      {profileData && (
        <div>
          <table className="profile-table">
            <tbody>
              <tr>
                <th>Full Name</th>
                <td>{profileData.fullName}</td>
              </tr>
              <tr>
                <th>Biography</th>
                <td>{profileData.biography}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{profileData.email}</td>
              </tr>
              <tr>
                <th>Contact Number</th>
                <td>{profileData.contactNumber}</td>
              </tr>
              <tr>
                <th>Age</th>
                <td>{profileData.age}</td>
              </tr>
              <tr>
                <th>Years of Experience</th>
                <td>{profileData.yearsOfExperience}</td>
              </tr>
              <tr>
                <th>Dance Style</th>
                <td>{profileData.danceStyle}</td>
              </tr>
              <tr>
                <th>Achievements</th>
                <td>
                  {profileData.achievements && profileData.achievements.join(', ')}
                </td>
              </tr>
              <tr>
                <th>Availabilities</th>
                <td>
                  {profileData.availability && profileData.availability.length > 0 ? (
                    <ul className="availability-list">
                      {profileData.availability.map((item, index) => (
                        <li key={index} className="availability-item">
                          {item.day}: {item.start} - {item.end}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No availabilities provided"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <button
            className="edit-button"
            onClick={() => navigate('/member-dashboard/edit-member-profile')}>
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberDashboardProfile;