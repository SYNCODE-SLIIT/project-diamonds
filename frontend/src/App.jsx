import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import AdminApplicationsCombinedList from './pages/authentication/AdminApplicationsCombinedList';
import Calendar from './components/Calendar';
import AdminBudgetRequests from './pages/admin/AdminBudgetRequests';
// Content Management Imports
import AboutUs from './pages/aboutUs';
import ContentMediaDashboard from "./pages/ContentMediaDashboard";
import CreateBlogPost from './pages/content/CreateBlogPost';
import BlogPosts from './pages/content/BlogpostView';
import EditBlogPost from './pages/content/EditBlogPost';
import Events from './pages/content/Events';
import UploadMedia from './pages/content/UploadMedia';
import Merchandise from './pages/content/Merchandise';
import OurFounderPage from './pages/OurFounderPage';
import SocialMediaFeed from './pages/content/SocialMediaFeed';
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
import GroupMembers from './pages/admin/GroupMembers';

import FinalizedDetails from './pages/authentication/FinalizedDetails';
 

import PackageList from './components/event/PackageList';
import ServicesList from './components/event/AdditionalServicesList';

import EventRequestDashboard from './components/event/EventRequestDashboard';
import EventsDashboard from './components/event/EventsDashboard';

import EventCalendar from './pages/admin/EventCalender';

// Financial Management Imports
import FinancialDashboard from './components/Financial/FinancialDashboard';
import Income from './pages/Dashboard/Income';
import Dashboard from './pages/Dashboard/Dashboard';
import Expense from './pages/Dashboard/Expense';
import RecentTransactionPage from './pages/Dashboard/RecentTransaction';
import RefundHistory from './pages/Dashboard/RefundHistory';

import FinancialReport from './components/Financial/FinancialReport';
import BudgetForm from './components/Financial/BudgetForm';
import RefundForm from './components/Financial/RefundForm';
import PaymentOptions from './components/Financial/PaymentOptions';
import AnomalyDetection from './components/Financial/AnomalyDetection';
import PaymentSuccess from './components/Financial/PaymentSuccess';
import PaymentCancel from './components/Financial/PaymentCancel';
import TicketPaymentCancel from './components/Financial/TicketPaymentCancel';
// public layout and pages
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/Home';
import Contactus from './pages/Contactus';

import OrganizerProfile from './pages/EventOrganizerProfile';


import EventBookingPage from './pages/EventBookingPage';
import DonationPage from './components/Donation/DonationPage';


import EventRequestForm from './components/event/EventRequestForm';

import OrganizerEventRequests from './components/event/OrganizerEventRequests';
import EventRequestDetailsPage from './pages/events/EventRequestDetailsPage';
import EventRequestEditPage from './pages/events/EventRequestEditPage';

import MemberDashboardLayout from './components/layout/MemberDashboardLayout';

import AdminLayout from './components/layout/AdminLayout';
import UserProvider from './context/userContext';



import ViewMedia from './pages/content/ViewMedia';
import EditMedia from './pages/content/EditMedia';
import ViewAllMedia from './pages/content/ViewAllMedia';



import ContentCreatorList from './pages/content/ContentCreatorList';
import ContentCreatorForm from './pages/content/ContentCreatorForm';
import ContentCreatorView from './pages/content/ContentCreatorView';
import EditContentCreator from './pages/content/EditContentCreator';



import CalendarEvents from './pages/CalendarEvents';

import AdminDashboard from './components/team/AdminDashboard';

import EventDashboard from './components/event/EventDashboard';

import EventAssign from './components/team/EventAssign';
import EventAssignmentRequests from './components/team/EventAssignmentRequests';
import PracticeAssign from './components/team/PracticeAssign';
import PracticeAssignments from './components/team/PracticeAssignments';
import CalendarOverview from './components/team/CalendarOverview';



import DirectChatRoom from './pages/shared/DirectChatRoom';




import MerchandiseAdmin from './pages/admin/MerchandiseAdmin';
import Collabaration from './pages/content/Collaboration';

import CertificateGenerator from './pages/content/CertificateGenerator';
import Sponsorship from './pages/content/Sponsorship';
import PublicBlogSlideShow from './pages/content/PublicBlogSlideShow';
import PublicBlogDetail from './pages/content/PublicBlogDetail';
import WhyJoinUs from './pages/WhyJoinUs';

import AdminEventRequestDetailsPage from './pages/admin/AdminEventRequestDetailsPage';


import FundraisePage from './components/Fundraise/FundraisePage';
import EventDetailPages from './components/Fundraise/EventDetailPage';


import EventDetailPage from './pages/events/EventDetailPage';
import OrganizerEventDetailPage from './pages/events/OrganizerEventDetailsPage';


const App = () => {
  return (
    <div className="">
      <UserProvider>

        
          
          <Routes>
          
            <Route path='/financial' element={<FinancialDashboard />} />

            <Route path='/bform' exact element={<BudgetForm/>} />
            <Route path='/rform' exact element={<RefundForm/>} />
            <Route path='/pform' exact element={<PaymentOptions />} />


            <Route path="/media/:id" element={<ViewMedia />} />
            <Route path="/media/edit/:id" element={<EditMedia />} />
{/* 
            <Route path="/media" element={<ViewAllMedia />} /> */}

          {/* <Route path="/content-creators" element={<ContentCreatorList />} /> */}
          <Route path="/content-creators/new" element={<ContentCreatorForm />} />
          <Route path="/content-creators/edit/:id" element={<EditContentCreator />} />
          <Route path="/content-creators/view/:id" element={<ContentCreatorView />} />

          
          

          <Route element={<PublicLayout />}>
              <Route path='/' element={<Home />} />
              <Route path='/contactUs' element={<Contactus />} />
              <Route path='/organizer-profile' element={<OrganizerProfile />} />
              <Route path='/login' element={<Login />} />
              <Route path='/our-founder' element={<OurFounderPage />} />
              <Route path='/blogs' element={<PublicBlogSlideShow />} />
              <Route path='/blogs/:id' element={<PublicBlogDetail />} />
              <Route path='/why-join' element={<WhyJoinUs />} />
              {/* <Route path='/event-request' element={<EventRequestForm />} /> */}
              <Route path='/register/member/application' element={<MemberApplication />} />

              <Route path='/apply-now' element={<MemberApplication />} />

              <Route path='/register/member/createAccount' element={<CreateMemberAccount />} />
              <Route path="/application-submitted" element={<ApplicationSubmitted />} />

              <Route path='/events' element={<EventBookingPage />} />
              <Route path="/event-requests" element={<OrganizerEventRequests />} />
              <Route path="/event-requests/:id" element={<EventRequestDetailsPage />} />
              <Route path="/event-requests/:id/edit" element={<EventRequestEditPage />} />
              <Route path="/event-dashboard" element={<EventDashboard />} />
              <Route path="/event-dashboard/:id" element={<OrganizerEventDetailPage />} />
              <Route path="/merchandise" element={<Merchandise />} />
          <Route path="/donate" element={<DonationPage />} />
          <Route path="/fundraising" element={<FundraisePage />} />
          <Route path="/events/:eventSlug" element={<EventDetailPages />} />
          <Route path="/ticket-payment-cancel" element={<TicketPaymentCancel />} />

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
              <Route path="direct-chat/:threadId" element={<DirectChatRoom />} />
              <Route path="new-request" element={<MemberDashboardNewRequest />} />
              <Route path="upcoming-events" element={<MemberDashboardUpcomingEvents />} />
              <Route path="calendar-events" element={<CalendarEvents />} />
              <Route path="refund-history" element={<RefundHistory />} />
          </Route>


          <Route path="/admin" element={<AdminLayout />}>
            <Route path="collaboration" element={<Collabaration />} />
            <Route path="blog" element={<BlogPosts />} />
            <Route path="content-creators" element={<ContentCreatorList />} />
            <Route path="create-blog-post" element={<CreateBlogPost />} />
            <Route path="media" element={<ViewAllMedia />} />

            <Route path="social-media" element={<SocialMediaFeed />} />
          

            <Route path="event-calendar" element={<CalendarOverview />} />

            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="practice-assignments" element={<PracticeAssignments />} />
            {/* All admin routes are now relative to /admin */}
            <Route path="messaging/create-group" element={<GroupCreation />} />
            <Route path="inbox" element={<AdminInbox />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="chat/:groupId" element={<HeadmanChatRoom />} />
            <Route path="direct-chat/:threadId" element={<DirectChatRoom />} />
            <Route path="groups/:groupId/members" element={<GroupMembers />} />
            <Route path="organizers" element={<AdminOrganizersList />} />
            <Route path="services" element={<ServicesList />} />
            <Route path="organizers/:id" element={<ViewOrganizerDetails />} />
            <Route path="applications/:id/invite" element={<AdminInviteApplicant />} />
            <Route path="applications/:id" element={<AdminApplicationDetails />} />
            <Route path="members" element={<AdminMembersList />} />
            <Route path="packages" element={<PackageList />} />
            <Route path="events" element={<EventsDashboard />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="event-requests" element={<EventRequestDashboard />} />
            <Route path="event-requests/:id" element={<AdminEventRequestDetailsPage />} />
            <Route path="financial" element={<FinancialDashboard />} />
            <Route path="applications/combined" element={<AdminApplicationsCombinedList />} />
            <Route path="finalized/:id" element={<FinalizedDetails />} />
            <Route path="budget-requests" element={<AdminBudgetRequests />} />
            <Route path="merchandise" element={<MerchandiseAdmin />} />
            <Route path="certificate-generator" element={<CertificateGenerator />} />
            <Route path="sponsorship" element={<Sponsorship />} />

            <Route path="financial/anomalies" element={<AnomalyDetection />} />

          </Route>
       

          {/* Remove these duplicate routes as they're now handled in the admin layout */}
          {/* <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/event/assign" element={<EventAssign />} />
          <Route path="/team/assignment-requests" element={<EventAssignmentRequests />} />
          <Route path="/team/practice" element={<PracticeAssign />} />
          <Route path="/team/practice-assignments" element={<PracticeAssignments />} /> */}

          {/* Financial Routes */}


          <Route path='/report' element={<FinancialReport />} />

          {/* Content Management Routes */}
          {/* <Route path="/create-blog-post" element={<CreateBlogPost />} /> */}

          {/* <Route path="/blog" element={<BlogPosts />} /> */}

          <Route path="/blog/edit/:id" element={<EditBlogPost />} />
          <Route path="/event" element={<Events />} />

          <Route path="/upload" element={<UploadMedia />} />
          <Route path="/Cmanager" element={<ContentMediaDashboard />} />

          
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          

          <Route path="/media/view/:id" element={<ViewMedia />} />

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