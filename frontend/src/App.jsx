import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// UserManagement
import MemberApplication from './pages/authentication/MemberApplication';
import AdminApplicationsList from './pages/authentication/AdminApplicationsList';
import AdminApplicationDetails from './pages/authentication/AdminApplicationDetails';
import CreateMemberAccount from './pages/authentication/CreateMemberAccount';
import RegisterOrganizer from './pages/authentication/RegisterOrganizer';
import Login from './pages/authentication/Login';
import MemberDashboardLayout from './components/layout/MemberDashboardLayout';

// Basic dashboard pages for members
import MemberDashboardHome from './pages/membership/MemberDashboardHome';
import MemberDashboardProfile from './pages/membership/MemberDashboardProfile';
import MemberDashboardCalender from './pages/membership/MemberDashboardCalender';
import MemberDashboardInbox from './pages/membership/MemberDashboardInbox';
import MemberDashboardNewRequest from './pages/membership/MemberDashboardNewRequest';
import MemberDashboardUpcomingEvents from './pages/membership/MemberDashboardUpcomingEvents';


import Navbar from './components/Navbar';
import Home from './pages/home';
import Contactus from './pages/Contactus';
import Profile from './pages/Profile';
import FinancialDashboard from './components/FinancialDashboard';
import Income from './pages/Dashboard/Income';
import UserProvider from './context/userContext';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard/Dashboard';
import Expense from './pages/Dashboard/Expense';
import RecentTransactionPage from './pages/Dashboard/RecentTransaction';

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <UserProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />

            {/* UserManagement */}
            <Route path='/register/member/application' element={<MemberApplication />} />
            <Route path='/admin/applications' element={<AdminApplicationsList />} />
            <Route path='/admin/applications/:id' element={<AdminApplicationDetails />} />
            <Route path='/register/member/createAccount' element={<CreateMemberAccount />} />
            <Route path='/register/organizer' element={<RegisterOrganizer />} />
            <Route path='/login' element={<Login />} />

            <Route path='/contactUs' element={<Contactus />} />
            <Route path='/profile' element={<Profile />} />

            <Route path='/financial' element={<FinancialDashboard />} />

       
            <Route path="/member-dashboard" element={<MemberDashboardLayout />}>
              <Route index element={<MemberDashboardHome />} />
              <Route path='dashboard' exact element={<Dashboard />} />
              <Route path='expense' exact element={<Expense />} />
              <Route path='income' exact element={<Income />} />
              <Route path="transactions" element={<RecentTransactionPage />} />
              <Route path="profile" element={<MemberDashboardProfile />} />
              <Route path="calender" element={<MemberDashboardCalender />} />
              <Route path="inbox" element={<MemberDashboardInbox />} />
              <Route path="new-request" element={<MemberDashboardNewRequest />} />
              <Route path="upcoming-events" element={<MemberDashboardUpcomingEvents />} />
         
          </Route>

          
          </Routes>

          {/* Use for notifications */}
          <Toaster
            toastOptions={{
              className: '',
              style: {
                fontSize: '13px',
              },
            }}
          />
        </Router>
      </UserProvider>
    </div>
  );
};

export default App;
