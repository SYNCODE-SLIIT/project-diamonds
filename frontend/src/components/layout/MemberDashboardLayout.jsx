import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import Sidebar from './Sidebar';

const MemberDashboardLayout = () => {
  const { user } = useContext(UserContext);

  return (
    <div>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px', marginLeft: '270px' }}>
          {user && (
            <div style={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>
              Welcome, {user.fullName} (ID: {user._id})
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardLayout;