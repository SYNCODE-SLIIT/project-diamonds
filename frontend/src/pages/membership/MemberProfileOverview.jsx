import React, { useContext } from 'react';
import { UserContext } from '../../context/userContext';

const MemberProfileOverview = () => {
  const { user } = useContext(UserContext);
  
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">
        Welcome, {user?.fullName || 'Member'}!
      </h2>
      <div className="flex items-center space-x-4">
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600">No Image</span>
          </div>
        )}
        <div>
          <p className="text-lg font-semibold">Email: {user?.email}</p>
          <p className="text-md text-gray-600">Role: {user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default MemberProfileOverview;