import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import './ChangePassword.css';
import 'boxicons';

const ChangePassword = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password requirements
  const requirements = [
    { id: 'length', label: 'At least 8 characters', met: newPassword.length >= 8 },
    { id: 'uppercase', label: 'At least one uppercase letter', met: /[A-Z]/.test(newPassword) },
    { id: 'lowercase', label: 'At least one lowercase letter', met: /[a-z]/.test(newPassword) },
    { id: 'number', label: 'At least one number', met: /\d/.test(newPassword) },
    { id: 'special', label: 'At least one special character', met: /[^A-Za-z0-9]/.test(newPassword) }
  ];

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\[\]{};':"\\|,.<>\/\?])[A-Za-z\d@$!%*?&#^()_+\[\]{};':"\\|,.<>\/\?]{8,}$/;
    return regex.test(pwd);
  };

  const handleNewChange = (e) => {
    const pwd = e.target.value;
    setNewPassword(pwd);
    if (pwd && !validatePassword(pwd)) {
      setPasswordError('Please meet all password requirements.');
    } else {
      setPasswordError('');
    }
    if (confirmPassword && pwd !== confirmPassword) {
      setConfirmError('Passwords do not match.');
    } else {
      setConfirmError('');
    }
  };

  const handleConfirmChange = (e) => {
    const cp = e.target.value;
    setConfirmPassword(cp);
    if (newPassword !== cp) {
      setConfirmError('Passwords do not match.');
    } else {
      setConfirmError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!oldPassword || !newPassword) {
      setSubmitError('All fields are required.');
      return;
    }
    if (passwordError || confirmError) return;
    
    setIsLoading(true);
    try {
      const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PASSWORD, { oldPassword, newPassword });
      if (res.status === 200) {
        setSubmitMsg('Password updated successfully.');
        setTimeout(onClose, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating password.';
      setSubmitError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-overlay" onClick={onClose}>
      <div className="change-password-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Change Password</h3>
          <button className="close-button" onClick={onClose}>
            <box-icon name="x" color="#666"></box-icon>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-input-container">
              <input 
                type="password" 
                value={oldPassword} 
                onChange={e => setOldPassword(e.target.value)} 
                required 
                placeholder="Enter your current password"
              />
              <box-icon name="lock" color="#4a7bfc"></box-icon>
            </div>
          </div>
          
          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-container">
              <input 
                type="password" 
                value={newPassword} 
                onChange={handleNewChange} 
                required 
                placeholder="Create a new password"
              />
              <box-icon name="lock-open" color="#4a7bfc"></box-icon>
            </div>
            {passwordError && <div className="error-msg">{passwordError}</div>}
            
            {/* Only show requirements when user starts typing */}
            {newPassword.length > 0 && (
              <div className="password-requirements">
                {requirements.map(req => (
                  <div key={req.id} className={`requirement ${req.met ? 'met' : ''}`}>
                    {req.met ? 
                      <box-icon name="check-circle" color="#16a34a" size="xs"></box-icon> : 
                      <box-icon name="circle" color="#9ca3af" size="xs"></box-icon>
                    }
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-input-container">
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={handleConfirmChange} 
                required 
                placeholder="Confirm your new password"
              />
              <box-icon name="check-shield" color="#4a7bfc"></box-icon>
            </div>
            {confirmError && <div className="error-msg">{confirmError}</div>}
          </div>
          
          {submitMsg && <div className="success-msg">{submitMsg}</div>}
          {submitError && <div className="error-msg error-box">{submitError}</div>}
          
          <div className="button-group">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button 
              type="submit" 
              className={`save-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <box-icon name="loader-alt" color="white" animation="spin"></box-icon>
                  Updating...
                </>
              ) : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;