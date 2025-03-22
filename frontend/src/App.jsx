import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

// Financial management branch imports
import MemberApplication from './pages/authentication/MemberApplication';
import AdminApplicationsList from './pages/authentication/AdminApplicationsList';
import AdminApplicationDetails from './pages/authentication/AdminApplicationDetails';
import CreateMemberAccount from './pages/authentication/CreateMemberAccount';
import RegisterOrganizer from './pages/authentication/RegisterOrganizer';
import Login from './pages/authentication/Login';
import MemberDashboardLayout from './components/layout/MemberDashboardLayout';
import MemberDashboardHome from './pages/membership/MemberDashboardHome';
import MemberDashboardProfile from './pages/membership/MemberDashboardProfile';
import MemberDashboardCalender from './pages/membership/MemberDashboardCalender';
import MemberDashboardInbox from './pages/membership/MemberDashboardInbox';
import MemberDashboardNewRequest from './pages/membership/MemberDashboardNewRequest';
import MemberDashboardUpcomingEvents from './pages/membership/MemberDashboardUpcomingEvents';
import Home from './pages/home';
import FinancialDashboard from './components/Financial/FinancialDashboard';
import Income from './pages/Dashboard/Income';
import Dashboard from './pages/Dashboard/Dashboard';
import Expense from './pages/Dashboard/Expense';
import RecentTransactionPage from './pages/Dashboard/RecentTransaction';
import FPaymentForm from './components/Financial/FPaymentForm';
import FinancialReport from './components/Financial/FinancialReport';
import UserProvider from './context/userContext';
import Contactus from './pages/Contactus';
import Profile from './pages/Profile';

// Dev branch imports
import Homepage from './pages/Home.jsx';
import AboutUs from './pages/AboutUs';

const App = () => {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] mx-auto">
      <UserProvider>
        <Navbar />
        <Routes>
          {/* Dev Branch Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/aboutUs" element={<AboutUs />} />

          {/* Financial Management Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/register/member/application" element={<MemberApplication />} />
          <Route path="/admin/applications" element={<AdminApplicationsList />} />
          <Route path="/admin/applications/:id" element={<AdminApplicationDetails />} />
          <Route path="/register/member/createAccount" element={<CreateMemberAccount />} />
          <Route path="/register/organizer" element={<RegisterOrganizer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contactUs" element={<Contactus />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/financial" element={<FinancialDashboard />} />
          <Route path="/form" element={<FPaymentForm />} />
          <Route path="/report" element={<FinancialReport />} />

          <Route path="/member-dashboard" element={<MemberDashboardLayout />}>
            <Route index element={<MemberDashboardHome />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="expense" element={<Expense />} />
            <Route path="income" element={<Income />} />
            <Route path="transactions" element={<RecentTransactionPage />} />
            <Route path="profile" element={<MemberDashboardProfile />} />
            <Route path="calender" element={<MemberDashboardCalender />} />
            <Route path="inbox" element={<MemberDashboardInbox />} />
            <Route path="new-request" element={<MemberDashboardNewRequest />} />
            <Route path="upcoming-events" element={<MemberDashboardUpcomingEvents />} />
          </Route>
        </Routes>
        <Toaster
          toastOptions={{
            className: '',
            style: { fontSize: '13px' },
          }}
        />
      </UserProvider>
    </div>
  );
};

export default App;