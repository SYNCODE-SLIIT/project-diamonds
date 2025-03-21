import React from 'react'
import {Routes,Route} from 'react-router-dom'

import Navbar from './components/Navbar'
import Home from './pages/home'
import AboutUs from './pages/aboutUs'
import Contactus from './pages/Contactus'
import Profile from './pages/Profile'
import ContentMediaDashboard from "./pages/ContentMediaDashboard";

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>

      <Navbar />
      <Routes>
        <Route path='/' element={<Home />}  />
        <Route path='/aboutUs' element={<AboutUs />} />
        <Route path='/contactUs' element={<Contactus />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="/Cmanager" element={<ContentMediaDashboard />} />
      </Routes>
    </div>
  )
}

export default App