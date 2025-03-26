import React from 'react';
import { Outlet } from 'react-router-dom';
// import Sidebar from '../components/layout/Sidebar'; // Adjust the import path if needed

const AdminLayout = () => {
  return (
    <div className="admin-layout" style={{ display: 'flex' }}>
      {/* <Sidebar /> */}
      <div className="admin-content" style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;