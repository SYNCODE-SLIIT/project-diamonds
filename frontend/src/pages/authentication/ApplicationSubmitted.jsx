import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ApplicationSubmitted = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get the message from location state; fallback to a default message if none is provided
  const message = location.state?.message || 'Your application has been submitted successfully!';

  const handleDone = () => {
    navigate('/'); // Redirect to homepage
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Application Submitted</h1>
        <p className="text-gray-700 mb-8">{message}</p>
        <button 
          onClick={handleDone} 
          className="py-2 px-4 bg-blue-900 text-white font-bold uppercase rounded-full hover:bg-blue-700 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default ApplicationSubmitted;