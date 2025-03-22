import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar.jsx'; // Adjust the path if needed

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <header>
        <Navbar />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;