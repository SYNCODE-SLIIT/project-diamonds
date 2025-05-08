import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const AdminProfile = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Redirect if user is not logged in or not a team manager
  useEffect(() => {
    if (!user || user.role !== 'teamManager') {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Team Manager Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name:</label>
            <p className="mt-1 text-lg text-gray-900">{user.fullName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email:</label>
            <p className="mt-1 text-lg text-gray-900">{user.email}</p>
          </div>
          {/* Add more profile details as needed */}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;