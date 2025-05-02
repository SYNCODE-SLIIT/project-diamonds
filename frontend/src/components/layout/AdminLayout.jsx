import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '20px', marginLeft: '270px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;