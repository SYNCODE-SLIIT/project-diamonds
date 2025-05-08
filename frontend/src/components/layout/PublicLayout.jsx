import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar.jsx'; 
import Footer from '../footer.jsx';

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <header>
        <Navbar />
      </header>
      <main className='w-full'>
        <Outlet />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default PublicLayout;