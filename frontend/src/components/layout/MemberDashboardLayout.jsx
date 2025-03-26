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

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardLayout;