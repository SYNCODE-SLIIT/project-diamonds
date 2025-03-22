import React from 'react';
import backgroundImage from '../assets/bg2.jpg';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Background with fixed height that covers the entire page */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-top -z-10"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      
      {/* Content container */}
      <div className="flex flex-col min-h-screen">
        {/* Navbar at top */}
        <Navbar />
        
        {/* Main content area that grows to push footer down */}
        <div className="flex-grow">
          {/* Your main page content goes here */}
        </div>
        
        {/* Footer at bottom */}
        <Footer />
      </div>
    </div>
  );
};

export default Home;