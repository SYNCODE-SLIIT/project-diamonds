import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../hooks/useUserAuth';
import './EditMemberProfile.css';

const EditMemberProfile = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  useUserAuth();

  const [profileData, setProfileData] = useState(null);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedContactNumber, setEditedContactNumber] = useState('');
  const [editedAvailabilities, setEditedAvailabilities] = useState([]);
  // New states for dance style and achievements
  const [editedDanceStyle, setEditedDanceStyle] = useState('');
  const [editedAchievements, setEditedAchievements] = useState('');
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  // Temporary states for new availability input
  const [newDay, setNewDay] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch current profile details when component mounts
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
          const appData = data.application || data;
          setProfileData(appData);
          setEditedEmail(appData.email || '');
          setEditedContactNumber(appData.contactNumber || '');
          setEditedAvailabilities(appData.availability || []);
          // Set new fields from the application data
          setEditedDanceStyle(appData.danceStyle || '');
          setEditedAchievements(appData.achievements ? appData.achievements.join(', ') : '');
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load profile:', err);
          setErrorMsg('Failed to load profile: ' + err.message);
          setLoading(false);
        });
    }
  }, [user]);

  const handleAddAvailability = () => {
    if (newDay && newStart && newEnd) {
      const newAvail = { day: newDay, start: newStart, end: newEnd };
      setEditedAvailabilities([...editedAvailabilities, newAvail]);
      setNewDay('');
      setNewStart('');
      setNewEnd('');
    }
  };

  const handleRemoveAvailability = (index) => {
    const updatedAvail = editedAvailabilities.filter((_, i) => i !== index);
    setEditedAvailabilities(updatedAvail);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      // Upload new profile picture if one is selected
      if (newProfilePicture) {
        const formData = new FormData();
        formData.append('userId', user.profileId);
        formData.append('profilePicture', newProfilePicture);
        const picResponse = await fetch('http://localhost:4000/api/member-applications/updateProfilePicture', {
          method: 'POST',
          body: formData
        });
        if (!picResponse.ok) {
          throw new Error('Error uploading profile picture');
        }
        const picData = await picResponse.json();
        setProfileData((prev) => ({ ...prev, profilePicture: picData.profilePicture }));
      }

      // Update profile details (email, contact number, availability, dance style, achievements)
      const updateResponse = await fetch('http://localhost:4000/api/member-applications/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.profileId,
          email: editedEmail,
          contactNumber: editedContactNumber,
          availability: editedAvailabilities,
          danceStyle: editedDanceStyle,
          achievements: editedAchievements.split(',').map(a => a.trim())
        })
      });
      if (!updateResponse.ok) {
        throw new Error('Error updating profile details');
      }
      navigate('/member-dashboard/profile');
    } catch (error) {
      console.error('Error saving changes:', error);
      setErrorMsg('Error saving changes: ' + error.message);
    }
  };

  if (loading) return <div className="loading-state">Loading profile...</div>;
  if (errorMsg) return <div className="error-state">{errorMsg}</div>;

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSaveChanges} className="edit-profile-form">
        <div className="form-group">
          <label htmlFor="profilePicture">Profile Picture:</label>
          <input
            type="file"
            id="profilePicture"
            accept="image/*"
            onChange={(e) => setNewProfilePicture(e.target.files[0])}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={editedEmail}
            onChange={(e) => setEditedEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactNumber">Contact Number:</label>
          <input
            type="text"
            id="contactNumber"
            value={editedContactNumber}
            onChange={(e) => setEditedContactNumber(e.target.value)}
          />
        </div>

        {/* New field for Dance Style */}
        <div className="form-group">
          <label htmlFor="danceStyle">Dance Style:</label>
          <input
            type="text"
            id="danceStyle"
            value={editedDanceStyle}
            onChange={(e) => setEditedDanceStyle(e.target.value)}
          />
        </div>

        {/* New field for Achievements */}
        <div className="form-group">
          <label htmlFor="achievements">Achievements (comma separated):</label>
          <input
            type="text"
            id="achievements"
            value={editedAchievements}
            onChange={(e) => setEditedAchievements(e.target.value)}
          />
        </div>

        <div className="form-group availabilities-group">
          <label>Availabilities:</label>
          {editedAvailabilities && editedAvailabilities.length > 0 ? (
            <ul className="availability-list">
              {editedAvailabilities.map((item, index) => (
                <li key={index} className="availability-item">
                  {item.day}: {item.start} - {item.end} 
                  <button type="button" onClick={() => handleRemoveAvailability(index)}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No availabilities provided</p>
          )}
          <div className="new-availability">
            <select
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
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
            <input
              type="time"
              placeholder="Start"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
            />
            <input
              type="time"
              placeholder="End"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
            />
            <button type="button" onClick={handleAddAvailability}>Add Availability</button>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">Save Changes</button>
          <button type="button" className="cancel-button" onClick={() => navigate('/member-dashboard/profile')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMemberProfile;