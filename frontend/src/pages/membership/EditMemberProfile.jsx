import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../hooks/useUserAuth';
import 'boxicons';
import axiosInstance from '../../utils/axiosInstance';
import './EditMemberProfile.css';

const EditMemberProfile = () => {
  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  useUserAuth();

  const [profileData, setProfileData] = useState(null);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedContactNumber, setEditedContactNumber] = useState('');
  const [editedAvailabilities, setEditedAvailabilities] = useState([]);
  const [editedDanceStyle, setEditedDanceStyle] = useState('');
  const [editedAchievements, setEditedAchievements] = useState('');
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [removePicture, setRemovePicture] = useState(false);

  const [newDay, setNewDay] = useState('');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('22:00');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  // ─── Helper validators ────────────────────────────────────────────
  const validateContactNumber = (value) => {
    if (!value) return '';
    if (!/^\d+$/.test(value)) return 'Contact number must contain only digits.';
    if (value.length < 10 || value.length > 15) return 'Contact number should be between 10 and 15 digits.';
    return '';
  };

  const validateDanceStyle = (value) => {
    if (!value) return '';
    if (!/^[A-Za-z,\-\s]+$/.test(value)) {
      return 'Dance style can only contain letters, commas, dashes, and spaces.';
    }
    return '';
  };

  const validateEmail = (value) => {
    if (!value) return 'Email is required.';
    // Simple RFC‑ish regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toLowerCase())) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  useEffect(() => {
    if (!newProfilePicture) {
      return;
    }
    
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(newProfilePicture);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [newProfilePicture]);

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
      // Duplicate day check
      if (editedAvailabilities.some((av) => av.day === newDay)) {
        setErrors((prev) => ({ ...prev, availability: 'You have already added availability for that day.' }));
        return;
      }
      // Time range guard
      if (newStart >= newEnd) {
        setErrors((prev) => ({ ...prev, availability: 'End time must be after start time.' }));
        return;
      }
      setErrors((prev) => ({ ...prev, availability: '' }));
      const newAvail = { day: newDay, start: newStart, end: newEnd };
      setEditedAvailabilities([...editedAvailabilities, newAvail]);
      setNewDay('');
      setNewStart('08:00');
      setNewEnd('22:00');
    }
  };

  const handleRemoveAvailability = (index) => {
    const updatedAvail = editedAvailabilities.filter((_, i) => i !== index);
    setEditedAvailabilities(updatedAvail);
  };

  const handleRemovePhoto = () => {
    // Mark for removal on save and clear preview
    setRemovePicture(true);
    setNewProfilePicture(null);
    setPreviewUrl('');
    // Clear the displayed picture in local state immediately
    setProfileData(prev => ({ ...prev, profilePicture: '' }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    // Final client-side validation
    const emailErr = validateEmail(editedEmail);
    const contactErr = validateContactNumber(editedContactNumber);
    const danceErr = validateDanceStyle(editedDanceStyle);
    if (emailErr || contactErr || danceErr || errors.availability) {
      setErrors((prev) => ({ ...prev, email: emailErr, contactNumber: contactErr, danceStyle: danceErr }));
      setErrorMsg('Please fix the highlighted errors before saving.');
      return;
    }

    try {
      if (removePicture && !newProfilePicture) {
        const idToDelete = profileData._id || user.profileId;
        await axiosInstance.delete('/api/member-applications/profile-picture', { params: { userId: idToDelete } });
      }
      if (newProfilePicture) {
        const formData = new FormData();
        formData.append('userId', user.profileId);
        formData.append('profilePicture', newProfilePicture);
        const picResponse = await fetch('http://localhost:4000/api/member-applications/profile-picture', {
          method: 'PUT',
          body: formData
        });
        if (!picResponse.ok) {
          throw new Error('Error uploading profile picture');
        }
        const picData = await picResponse.json();
        setProfileData((prev) => ({ ...prev, profilePicture: picData.profilePicture }));
      }

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
      <div className="edit-profile-header">
        <h2>Edit Profile</h2>
        <div className="profile-image-section">
          <div className="profile-image-container">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="profile-image" />
            ) : (!removePicture && (profileData?.profilePicture || user?.profilePicture)) ? (
              <img 
                src={profileData?.profilePicture || user?.profilePicture} 
                alt="Current Profile" 
                className="profile-image" 
              />
            ) : (
              <div className="profile-image-placeholder">
                <box-icon name="user" size="lg" color="#25105A"></box-icon>
              </div>
            )}
          </div>
          <div className="profile-image-controls">
            {/* Upload button always visible */}
            <label htmlFor="profilePicture" className="upload-button">
              <box-icon name="upload" color="white"></box-icon>
              <span>Upload Photo</span>
            </label>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={(e) => {
                setNewProfilePicture(e.target.files[0]);
                setRemovePicture(false);
              }}
              className="hidden-input"
            />
            {( (profileData?.profilePicture || newProfilePicture) && !removePicture ) && (
              <button 
                type="button" 
                className="remove-photo-button"
                onClick={handleRemovePhoto}
              >
                <box-icon name="trash" color="white"></box-icon>
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveChanges} className="edit-profile-form">
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-group">
            <label htmlFor="email">
              <box-icon name="envelope" color="#25105A" size="sm"></box-icon>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={editedEmail}
              onChange={(e) => {
                const val = e.target.value;
                setEditedEmail(val);
                setErrors((prev) => ({ ...prev, email: validateEmail(val) }));
              }}
              required
              placeholder="Your email address"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="contactNumber">
              <box-icon name="phone" color="#25105A" size="sm"></box-icon>
              Contact Number
            </label>
            <input
              type="text"
              id="contactNumber"
              value={editedContactNumber}
              onChange={(e) => {
                const val = e.target.value;
                setEditedContactNumber(val);
                setErrors((prev) => ({ ...prev, contactNumber: validateContactNumber(val) }));
              }}
              placeholder="Your phone number"
            />
            {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
          </div>
        </div>

        <div className="form-section">
          <h3>Dance Profile</h3>
          <div className="form-group">
            <label htmlFor="danceStyle">
              <box-icon name="music" color="#25105A" size="sm"></box-icon>
              Dance Style
            </label>
            <input
              type="text"
              id="danceStyle"
              value={editedDanceStyle}
              onChange={(e) => {
                const val = e.target.value;
                setEditedDanceStyle(val);
                setErrors((prev) => ({ ...prev, danceStyle: validateDanceStyle(val) }));
              }}
              placeholder="e.g. Hip Hop, Contemporary, Ballet"
            />
            {errors.danceStyle && <p className="text-red-500 text-sm mt-1">{errors.danceStyle}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="achievements">
              <box-icon name="trophy" color="#25105A" size="sm"></box-icon>
              Achievements (comma separated)
            </label>
            <input
              type="text"
              id="achievements"
              value={editedAchievements}
              onChange={(e) => setEditedAchievements(e.target.value)}
              placeholder="e.g. Competition Winner 2023, Certified Instructor"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Availability</h3>
          <div className="form-group availabilities-group">
            {editedAvailabilities && editedAvailabilities.length > 0 ? (
              <ul className="availability-list">
                {editedAvailabilities.map((item, index) => (
                  <li key={index} className="availability-item">
                    <span>
                      <box-icon name="time" color="#25105A" size="sm"></box-icon>
                      {item.day}: {item.start} - {item.end}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveAvailability(index)}
                      className="remove-availability-button"
                    >
                      <box-icon name="x" color="white" size="sm"></box-icon>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-availabilities">No availabilities provided</p>
            )}
            <div className="new-availability">
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                className="day-select"
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
                className="time-input"
              />
              <input
                type="time"
                placeholder="End"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="time-input"
              />
              <button 
                type="button" 
                onClick={handleAddAvailability}
                className="add-availability-button"
              >
                <box-icon name="plus" color="white" size="sm"></box-icon>
                Add
              </button>
              {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability}</p>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/member-dashboard/profile')}
          >
            <box-icon name="x" color="#4b5563" size="sm"></box-icon>
            Cancel
          </button>
          <button type="submit" className="save-button">
            <box-icon name="check" color="white" size="sm"></box-icon>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMemberProfile;