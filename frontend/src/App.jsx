import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Content Management Imports
import AboutUs from './pages/aboutUs';
import ContentMediaDashboard from "./pages/ContentMediaDashboard";

// User Management Imports
import MemberApplication from './pages/authentication/MemberApplication';
import AdminApplicationsList from './pages/authentication/AdminApplicationsList';
import AdminApplicationDetails from './pages/authentication/AdminApplicationDetails';
import CreateMemberAccount from './pages/authentication/CreateMemberAccount';
import RegisterOrganizer from './pages/authentication/RegisterOrganizer';
import Login from './pages/authentication/Login';
import MemberDashboardLayout from './components/layout/MemberDashboardLayout';
import Income from './pages/Dashboard/Income';
import Expense from './pages/Dashboard/Expense';
import Dashboard from './pages/Dashboard/Dashboard';
import RecentTransactionPage from './pages/Dashboard/RecentTransaction';
import MemberDashboardHome from './pages/membership/MemberDashboardHome';
import MemberDashboardProfile from './pages/membership/MemberDashboardProfile';
import MemberDashboardCalender from './pages/membership/MemberDashboardCalender';
import MemberDashboardInbox from './pages/membership/MemberDashboardInbox';
import MemberDashboardNewRequest from './pages/membership/MemberDashboardNewRequest';
import MemberDashboardUpcomingEvents from './pages/membership/MemberDashboardUpcomingEvents';
import EditMemberProfile from './pages/membership/EditMemberProfile';
import FinancialDashboard from './components/Financial/FinancialDashboard'

// public layout and pages
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/home';
import Contactus from './pages/Contactus';
import Profile from './pages/Profile';

import AdminLayout from './components/layout/AdminLayout';
import UserProvider from './context/userContext';
import { Toaster } from 'react-hot-toast';


import PaymentForm from './components/Financial/paymentForm';
import BudgetForm from './components/Financial/BudgetForm';
import RefundForm from './components/Financial/RefundForm';

const App = () => {
  return (
    <div >
      <UserProvider>
        
          
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
            <Route path='/bform' exact element={<BudgetForm/>} />
            <Route path='/rform' exact element={<RefundForm/>} />
            <Route path='/pform' exact element={<PaymentForm />} />

       
            <Route path="/member-dashboard" element={<MemberDashboardLayout />}>
              <Route index element={<MemberDashboardHome />} />
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='expense' element={<Expense />} />
              <Route path='income' element={<Income />} />
              <Route path="transactions" element={<RecentTransactionPage />} />
              <Route path="profile" element={<MemberDashboardProfile />} />
              <Route path="edit-member-profile" element={<EditMemberProfile />} />
              <Route path="calender" element={<MemberDashboardCalender />} />
              <Route path="inbox" element={<MemberDashboardInbox />} />
              <Route path="new-request" element={<MemberDashboardNewRequest />} />
              <Route path="upcoming-events" element={<MemberDashboardUpcomingEvents />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path='/admin/applications' element={<AdminApplicationsList />} />
            <Route path='/admin/applications/:id' element={<AdminApplicationDetails />} />
            {/* <Route path='/financial' element={<FinancialDashboard />} /> */}
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
        
      </UserProvider>
    </div>
  );
};

export default App;