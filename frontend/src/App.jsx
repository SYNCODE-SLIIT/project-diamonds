import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Content Management Imports
import AboutUs from './pages/aboutUs';
import ContentMediaDashboard from "./pages/ContentMediaDashboard";
import CreateBlogPost from './pages/content/CreateBlogPost';  // Add this import for CreateBlogPost page



// User Management Imports
import MemberApplication from './pages/authentication/MemberApplication';
import AdminApplicationsList from './pages/authentication/AdminApplicationsList';
import AdminApplicationDetails from './pages/authentication/AdminApplicationDetails';
import CreateMemberAccount from './pages/authentication/CreateMemberAccount';
// import RegisterOrganizer from './pages/authentication/RegisterOrganizer';
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
import ChatRoom from './pages/membership/ChatRoom';
import GroupCreation from './pages/admin/GroupCreation';
import ApplicationSubmitted from './pages/authentication/ApplicationSubmitted';

import PackageList from './components/PackageList';


// public layout and pages
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/home';
import Contactus from './pages/Contactus';
import OrganizerProfile from './pages/EventOrganizerProfile';
import { Toaster } from 'react-hot-toast';
import BlogPosts from './pages/content/BlogpostView';
import EditBlogPost from './pages/content/EditBlogPost';
import Events from './pages/content/Events';
import UploadMedia from './pages/content/UploadMedia';



import AdminLayout from './components/layout/AdminLayout';
import UserProvider from './context/userContext';
// import FinancialDashboard from './components/FinancialDashboard';


const App = () => {
  return (
    <div >
      <UserProvider>
        
          
          <Routes>
          <Route element={<PublicLayout />}>
              <Route path='/' element={<Home />} />
              <Route path='/contactUs' element={<Contactus />} />
              <Route path='/organizer-profile' element={<OrganizerProfile />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register/member/application' element={<MemberApplication />} />
              <Route path='/register/member/createAccount' element={<CreateMemberAccount />} />
              {/* <Route path='/register/organizer' element={<RegisterOrganizer />} /> */}
              <Route path="/application-submitted" element={<ApplicationSubmitted />} />

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
          </Route>

          <Route path="/messaging/create-group" element={<GroupCreation />} />


          <Route element={<AdminLayout />}>
            <Route path='/admin/applications' element={<AdminApplicationsList />} />
            <Route path='/admin/applications/:id' element={<AdminApplicationDetails />} />
            <Route path="/admin/packages" element={<PackageList />} />
            {/* <Route path='/financial' element={<FinancialDashboard />} /> */}
          </Route>

  <Route path="/create-blog-post" element={<CreateBlogPost />} /> {/* Route to CreateBlogPost page */}
            <Route path="/blog" element={<BlogPosts />} />
            <Route path="/blog/edit/:id" element={<EditBlogPost />}/>

            <Route path="/event" element={<Events />} />
            <Route path="/upload" element={<UploadMedia />} />

         






            {/* Content Management Route */}
            <Route path="/Cmanager" element={<ContentMediaDashboard />} />
           
          </Routes>


          {/* Notifications */}

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