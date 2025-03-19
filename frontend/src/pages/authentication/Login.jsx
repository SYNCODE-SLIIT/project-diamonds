import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        // Store the token (for subsequent authenticated requests)
        localStorage.setItem('token', data.token);
        // Redirect to home page (or dashboard) upon successful login
        navigate('/');
      } else {
        setErrorMsg(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setErrorMsg('Error: ' + error.message);
    }
  };
  
  return (
    <div style={containerStyle}>
      <div style={loginSectionStyle}>
        <h2 style={titleStyle}>Login to Your Account</h2>
        {errorMsg && <div style={errorStyle}>{errorMsg}</div>}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email:</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={inputStyle}
            />
          </div>
          <div style={forgotPasswordStyle}>
            <a href="/forgot-password" style={linkStyle}>Forgot Password?</a>
          </div>
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
      </div>
      <div style={optionsSectionStyle}>
        <div style={optionCardStyle}>
          <h3 style={optionTitleStyle}>Join the Team</h3>
          <p style={optionDescStyle}>
            Are you a dancer looking to join our talented team? Apply now and become part of our community.
          </p>
          <button 
            style={optionButtonStyle} 
            onClick={() => navigate('/register/member/application')}
          >
            Apply as Member
          </button>
        </div>
        <div style={optionCardStyle}>
          <h3 style={optionTitleStyle}>Book the Team</h3>
          <p style={optionDescStyle}>
            Are you an event organizer interested in booking our team for your event? Register your organizer account today.
          </p>
          <button 
            style={optionButtonStyle} 
            onClick={() => navigate('/register/organizer')}
          >
            Register as Organizer
          </button>
        </div>
      </div>
    </div>
  );
};

// Container styles for the whole page (flex layout with two sections)
const containerStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: '40px',
  padding: '40px',
  fontFamily: '"Segoe UI", sans-serif',
  backgroundColor: '#f4f7f8',
  minHeight: '100vh'
};

// Left: Login form section
const loginSectionStyle = {
  flex: '1',
  maxWidth: '400px',
  padding: '30px',
  border: '1px solid #ccc',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  backgroundColor: '#fff'
};

// Right: Options section
const optionsSectionStyle = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const titleStyle = {
  textAlign: 'center',
  marginBottom: '20px',
  fontSize: '28px',
  fontWeight: '600',
  color: '#333'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const inputGroupStyle = {
  marginBottom: '15px'
};

const labelStyle = {
  marginBottom: '5px',
  fontWeight: 'bold',
  color: '#555'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #007BFF',
  borderRadius: '12px',
  fontSize: '16px',
  outline: 'none'
};

const forgotPasswordStyle = {
  textAlign: 'right',
  marginBottom: '20px'
};

const linkStyle = {
  color: '#007BFF',
  textDecoration: 'none'
};

const buttonStyle = {
  padding: '12px',
  backgroundColor: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  cursor: 'pointer'
};

const errorStyle = {
  color: '#EF4444',
  backgroundColor: '#FEF2F2',
  padding: '10px',
  borderRadius: '8px',
  marginBottom: '15px',
  textAlign: 'center'
};

// Option card styles (for the right section)
const optionCardStyle = {
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  backgroundColor: '#fff',
  textAlign: 'center'
};

const optionTitleStyle = {
  fontSize: '22px',
  marginBottom: '10px',
  color: '#333'
};

const optionDescStyle = {
  fontSize: '16px',
  marginBottom: '20px',
  color: '#555'
};

const optionButtonStyle = {
  padding: '12px 20px',
  backgroundColor: '#4F46E5',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  cursor: 'pointer'
};

export default Login;