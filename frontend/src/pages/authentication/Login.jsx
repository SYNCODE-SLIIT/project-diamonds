import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

const Login = () => {
  const navigate = useNavigate();
  
  // States for email, password and error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      const res = await fetch('http://localhost:4000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Store the token
        localStorage.setItem('token', data.token);
        // Check the user role and redirect accordingly
        if (data.user.role === 'member') {
          navigate('/member-dashboard');
        } else if (data.user.role === 'organizer') {
          navigate('/organizer-profile');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMsg(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setErrorMsg('Error: ' + error.message);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2 className="login-title">Login to Your Account</h2>
        {errorMsg && <div className="error-message">{errorMsg}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="form-input"
            />
          </div>
          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
      <div className="organizer-section">
        <div className="organizer-content">
          <h3 className="organizer-title">Book the Team</h3>
          <p className="organizer-description">
            Are you an event organizer interested in booking our team for your event? Register your organizer account today.
          </p>
          <button 
            onClick={() => navigate('/register/organizer')}
            className="organizer-button"
          >
            Register as Organizer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;