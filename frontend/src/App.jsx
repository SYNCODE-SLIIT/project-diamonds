import React from 'react';
import { Routes, Route } from 'react-router-dom'

// Content Management Imports
import AboutUs from './pages/aboutUs';


// public layout and pages
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/home';
import Contactus from './pages/Contactus';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';
import UserProvider from './context/userContext';


const App = () => {
  return (
    <div >
      <UserProvider>
          <Routes>
          <Route element={<PublicLayout />}>
              <Route path='/' element={<Home />} />
              <Route path='/contactUs' element={<Contactus />} />
              <Route path='/profile' element={<Profile />} />
            </Route>
          </Routes> 
      </UserProvider>
    </div>
  );
};

export default App;