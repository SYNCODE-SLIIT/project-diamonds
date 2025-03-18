import React from 'react'
import {Routes,Route} from 'react-router-dom'

// UserManagement
import MemberApplication from './pages/authentication/MemberApplication'
import AdminApplicationsList from './pages/authentication/AdminApplicationsList';
import AdminApplicationDetails from './pages/authentication/AdminApplicationDetails';
import CreateMemberAccount from './pages/authentication/CreateMemberAccount'


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

        // UserManagement
        <Route path="/register/member/application" element={<MemberApplication />} />
        <Route path="/admin/applications" element={<AdminApplicationsList />} />
        <Route path="/admin/applications/:id" element={<AdminApplicationDetails />} />
        <Route path="/register/member/createAccount" element={<CreateMemberAccount />} /> 


        <Route path='/contactUs' element={<Contactus />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App