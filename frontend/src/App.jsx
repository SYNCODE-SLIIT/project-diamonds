import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import AdminApplicationsCombinedList from './pages/authentication/AdminApplicationsCombinedList';
// Content Management Imports
import AboutUs from './pages/aboutUs';
import ContentMediaDashboard from "./pages/ContentMediaDashboard";
import CreateBlogPost from './pages/content/CreateBlogPost';
import BlogPosts from './pages/content/BlogpostView';
import EditBlogPost from './pages/content/EditBlogPost';
import Events from './pages/content/Events';
import UploadMedia from './pages/content/UploadMedia';

// User Management Imports
import MemberApplication from './pages/authentication/MemberApplication';
// import AdminApplicationsList from './pages/authentication/AdminApplicationsList';
import AdminApplicationDetails from './pages/authentication/AdminApplicationDetails';
import CreateMemberAccount from './pages/authentication/CreateMemberAccount';
import Login from './pages/authentication/Login';
import MemberDashboardHome from './pages/membership/MemberDashboardHome';
import MemberDashboardProfile from './pages/membership/MemberDashboardProfile';
import MemberDashboardCalender from './pages/membership/MemberDashboardCalender';
import MemberDashboardInbox from './pages/membership/MemberDashboardInbox';
import MemberDashboardNewRequest from './pages/membership/MemberDashboardNewRequest';
import MemberDashboardUpcomingEvents from './pages/membership/MemberDashboardUpcomingEvents';
import EditMemberProfile from './pages/membership/EditMemberProfile';
import AdminMembersList from './pages/authentication/AdminMembersList';
import AdminOrganizersList from './pages/authentication/AdminOrganizersList';
import ViewOrganizerDetails from './pages/authentication/ViewOrganizerDetails';
import AdminInbox from './pages/admin/AdminInbox';
import HeadmanChatRoom from './pages/admin/HeadmanChatRoom';
import ChatRoom from './pages/membership/ChatRoom';
import GroupCreation from './pages/admin/GroupCreation';
import ApplicationSubmitted from './pages/authentication/ApplicationSubmitted';
import AdminInviteApplicant from './pages/authentication/AdminInviteApplicant';
import AdminProfile from './pages/authentication/AdminProfile';
// import AdminInvitedApplicationsList from './pages/authentication/AdminInvitedApplicationsList';
import FinalizedDetails from './pages/authentication/FinalizedDetails';


import PackageList from './components/event/PackageList';
import ServicesList from './components/event/AdditionalServicesList';


// Financial Management Imports
import FinancialDashboard from './components/Financial/FinancialDashboard';
import Income from './pages/Dashboard/Income';
import Dashboard from './pages/Dashboard/Dashboard';
import Expense from './pages/Dashboard/Expense';
import RecentTransactionPage from './pages/Dashboard/RecentTransaction';


import FinancialReport from './components/Financial/FinancialReport';
import BudgetForm from './components/Financial/BudgetForm';
import RefundForm from './components/Financial/RefundForm';
import PaymentOptions from './components/Financial/PaymentOptions';
// public layout and pages
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/home';
import Contactus from './pages/Contactus';

import OrganizerProfile from './pages/EventOrganizerProfile';

import EventRequestForm from './components/event/EventRequestForm';
import OrganizerEventRequests from './components/event/OrganizerEventRequests';



import MemberDashboardLayout from './components/layout/MemberDashboardLayout';

import AdminLayout from './components/layout/AdminLayout';
import UserProvider from './context/userContext';
import CalendarEvents from './pages/CalendarEvents';

const App = () => {
  return (
    <div className="">
      <UserProvider>
        <Routes>
          <Route element={<PublicLayout />}>
              <Route path='/' element={<Home />} />
              <Route path='/contactUs' element={<Contactus />} />
              <Route path='/organizer-profile' element={<OrganizerProfile />} />
              <Route path='/login' element={<Login />} />
              <Route path='/apply-now' element={<MemberApplication />} />
              <Route path='/register/member/createAccount' element={<CreateMemberAccount />} />
              <Route path="/application-submitted" element={<ApplicationSubmitted />} />

              <Route path='/events' element={<EventRequestForm />} />
              <Route path="/event-requests" element={<OrganizerEventRequests />} />

              {/* <Route path='/organizer/new-event' element={<OrganizerNewEvent />} />
              <Route path='/organizer/manage-events' element={<OrganizerManageEvents />} /> */}
            </Route>


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
              <Route path="messaging/chat/:groupId" element={<ChatRoom />} />
              <Route path="new-request" element={<MemberDashboardNewRequest />} />
              <Route path="upcoming-events" element={<MemberDashboardUpcomingEvents />} />
              <Route path="calendar-events" element={<CalendarEvents />} />
          </Route>



          <Route path="/admin" element={<AdminLayout />}>
            {/* All admin routes are now relative to /admin */}
            <Route path="messaging/create-group" element={<GroupCreation />} />
            <Route path="inbox" element={<AdminInbox />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="chat/:groupId" element={<HeadmanChatRoom />} />
            <Route path="organizers" element={<AdminOrganizersList />} />
            <Route path="services" element={<ServicesList />} />
            <Route path="organizers/:id" element={<ViewOrganizerDetails />} />
            <Route path="applications/:id/invite" element={<AdminInviteApplicant />} />
            <Route path="applications/:id" element={<AdminApplicationDetails />} />
            <Route path="members" element={<AdminMembersList />} />
            <Route path="packages" element={<PackageList />} />
            {/* If FinancialDashboard is admin-specific, consider nesting it as well */}
            <Route path="financial" element={<FinancialDashboard />} />
            <Route path="applications/combined" element={<AdminApplicationsCombinedList />} />
            <Route path="finalized/:id" element={<FinalizedDetails />} />
          </Route>


          {/* Financial Routes */}

          <Route path='/bform' element={<BudgetForm/>} />
          <Route path='/rform' element={<RefundForm/>} />
          <Route path='/pform' element={<PaymentOptions />} />
          <Route path='/report' element={<FinancialReport />} />

          {/* Content Management Routes */}
          <Route path="/create-blog-post" element={<CreateBlogPost />} />
          <Route path="/blog" element={<BlogPosts />} />
          <Route path="/blog/edit/:id" element={<EditBlogPost />} />
          <Route path="/event" element={<Events />} />
          <Route path="/upload" element={<UploadMedia />} />
          <Route path="/Cmanager" element={<ContentMediaDashboard />} />
        </Routes>


        
        {/* Notifications */}
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
