import React from 'react'
import {Routes,Route} from 'react-router-dom'
// import RegisterOrganizer from './pages/authentication/RegisterOrganizer'
import MemberApplication from './pages/authentication/MemberApplication'
// import CreateMemberAccount from './pages/authentication/CreateMemberAccount'
// import Login from './pages/authentication/Login'

import Navbar from './components/Navbar'
import Home from './pages/home'

import Contactus from './pages/Contactus'
import Profile from './pages/Profile'

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>

      <Navbar />
      <Routes>
        <Route path='/' element={<Home />}  />
        {/* <Route path="/register/organizer" element={<RegisterOrganizer />} /> */}
        <Route path="/register/member/application" element={<MemberApplication />} />
        {/* <Route path="/register/member/create-account" element={<CreateMemberAccount />} /> */}
        {/* <Route path ='/Login' element={<Login />} /> */}
        <Route path='/contactUs' element={<Contactus />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App