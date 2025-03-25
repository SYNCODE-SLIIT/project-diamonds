import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import './Login.css';


const Login = () => {
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  // Update input values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      const res = await fetch('http://localhost:4000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        updateUser(data.user);
        // Role-based redirection
        if (data.user.role === 'member') {
          navigate('/member-dashboard');
        } else if (data.user.role === 'organizer') {
          navigate('/organizer-profile');
        } else if (data.user.role === 'teamManager') {
          navigate('/messaging/create-group');
        } else if (data.user.role === 'contentManager') {
          navigate('/content-dashboard');
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
    <div 
      className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/background.jpeg')" }}
    >
      {/* Main container with fixed dimensions, rounded corners, and shadow */}
      <div id="container" className="relative w-[850px] h-[600px] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* ----- Left Half: Login Form ----- */}
        <div className="absolute top-0 left-0 w-1/2 h-full">
          <form onSubmit={handleLoginSubmit} className="h-full flex flex-col items-center justify-center px-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Login</h1>
            {errorMsg && <div className="error-message mb-4 text-red-500">{errorMsg}</div>}
            <div className="w-10/12 mb-4">
              <input
                type="email"
                placeholder="Email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border-none outline-none rounded focus:ring-2 focus:ring-blue-900"
              />
            </div>
            <div className="w-10/12 mb-6">
              <input
                type="password"
                placeholder="Password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border-none outline-none rounded focus:ring-2 focus:ring-blue-900"
              />
            </div>
            <button
              type="submit"
              className="w-10/12 py-2 bg-blue-900 text-white font-bold uppercase rounded-full hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* ----- Right Half: Organizer Section / Alternate Option ----- */}
        <div className="absolute top-0 left-1/2 w-1/2 h-full">
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4">
            <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>
            <p className="text-sm mb-6 text-center">
              To keep connected, please login with your personal info.
            </p>
            {/* Link to the Organizer Sign Up page */}
            <a 
              href="/register/organizer" 
              className="py-2 px-6 border border-white rounded-full uppercase font-bold hover:bg-white hover:text-blue-900 transition"
            >
              Register as Organizer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;