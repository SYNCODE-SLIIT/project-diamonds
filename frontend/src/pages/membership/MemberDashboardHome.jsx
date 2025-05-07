import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { addThousandsSeparator } from '../../utils/helper.js';

// Icons
import { UserCircle2, Calendar, Trophy, Mail, MessageSquare, Clock, ArrowRight, ChevronDown, ChevronUp, FileText, CreditCard, DollarSign, BarChart2, AlertCircle } from 'lucide-react';
import { IoMdCard } from "react-icons/io";
import { LuWalletMinimal, LuHandCoins } from 'react-icons/lu';
import { FiBell } from 'react-icons/fi';

const MemberDashboardHome = () => {
  // Authentication
  useUserAuth();
  
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [assignmentRequests, setAssignmentRequests] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [showApprovedEvents, setShowApprovedEvents] = useState(false);
  const [refundHistory, setRefundHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [groups, setGroups] = useState([]);
  const memberId = user?.profileId || '';
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA);
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong while fetching dashboard data:", error);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    if (user && user.profileId) {
      try {
        const response = await fetch(`http://localhost:4000/api/member-applications/${user.profileId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setUserData(data.application);
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    }
  };

  // Fetch assignment requests
  const fetchAssignmentRequests = async () => {
    try {
      // Fetch pending requests
      const requestsResponse = await axios.get('http://localhost:4000/api/assignments/requests');
      const filteredRequests = requestsResponse.data.filter(req => 
        req.member && 
        req.member._id === memberId && 
        req.status !== 'accepted'
      );
      setAssignmentRequests(filteredRequests);
      
      // Fetch approved events using the approved endpoint
      const approvedResponse = await axiosInstance.get('/api/assignments/approved');
      console.log('Approved events from API:', approvedResponse.data);
      
      // Filter for this member
      const filteredApproved = approvedResponse.data.filter(req => 
        req.member && 
        String(req.member._id) === String(memberId)
      );
      console.log('Filtered approved events for member:', filteredApproved, 'Member ID:', memberId);
      
      setApprovedEvents(filteredApproved);
    } catch (error) {
      console.error('Error fetching assignment data:', error);
    }
  };

  // Fetch refund history
  const fetchRefundHistory = async () => {
    try {
      const response = await axiosInstance.get('/api/finance/getr');
      if (response.data && response.data.success) {
        setRefundHistory(response.data.data.slice(0, 3)); // Get only the latest 3
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await axiosInstance.get('/api/finance/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  // Fetch message groups to count unread
  const fetchMessageGroups = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`http://localhost:4000/api/chat-groups/user/${user._id}`);
      const data = await res.json();
      const gs = data.groups || [];
      setGroups(gs);
      
      // Calculate total unread messages
      const totalUnread = gs.reduce((total, group) => total + (group.unreadCount || 0), 0);
      setUnreadMessages(totalUnread);
    } catch (err) {
      console.error('Error fetching message groups:', err);
    }
  };

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchUserData(),
        fetchAssignmentRequests(),
        fetchRefundHistory(),
        fetchNotifications(),
        fetchMessageGroups()
      ]);
      setLoading(false);
    };
    
    loadAllData();
    
    // Refresh message count periodically
    const interval = setInterval(() => {
      fetchMessageGroups();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle marking notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.post(`/api/finance/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-8">
        {/* Header with Welcome and Notifications */}
        <div className="flex items-center justify-between bg-white shadow-md rounded-xl p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-blue-200 flex-shrink-0">
              {(userData?.profilePicture || user?.profilePicture) ? (
                <img
                  src={userData?.profilePicture || user?.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="bg-blue-100 w-full h-full flex items-center justify-center">
                  <UserCircle2 className="w-8 h-8 text-blue-600" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {userData?.fullName || user?.name || 'Member'}</h1>
              <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              onClick={() => setShowNotifications(v => !v)}
              aria-label="Show notifications"
            >
              <FiBell className="w-6 h-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200 max-h-96 overflow-y-auto">
                <div className="p-3 border-b font-semibold text-gray-700 flex justify-between items-center">
                  Notifications
                  <button className="text-xs text-blue-500 hover:underline" onClick={fetchNotifications} disabled={notifLoading}>
                    Refresh
                  </button>
                </div>
                {notifLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {notifications.map(n => (
                      <li key={n._id} className={`p-3 flex flex-col gap-1 ${n.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${n.isRead ? 'bg-gray-300' : 'bg-blue-500'}`}></span>
                          <span className="text-sm text-gray-800 flex-1">{n.message}</span>
                          {!n.isRead && (
                            <button
                              className="ml-2 text-xs text-blue-600 hover:underline"
                              onClick={() => handleMarkAsRead(n._id)}
                            >Mark as read</button>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center hover:shadow-lg transition-shadow">
            <div className="rounded-full p-3 bg-purple-100 mr-4">
              <IoMdCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Balance</p>
              <p className="text-2xl font-bold text-gray-800">₹{addThousandsSeparator(dashboardData?.totalBalance || 0)}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center hover:shadow-lg transition-shadow">
            <div className="rounded-full p-3 bg-green-100 mr-4">
              <LuWalletMinimal className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Income</p>
              <p className="text-2xl font-bold text-gray-800">₹{addThousandsSeparator(dashboardData?.totalIncome || 0)}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center hover:shadow-lg transition-shadow">
            <div className="rounded-full p-3 bg-red-100 mr-4">
              <LuHandCoins className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Expense</p>
              <p className="text-2xl font-bold text-gray-800">₹{addThousandsSeparator(dashboardData?.totalExpenses || 0)}</p>
            </div>
          </div>
        </div>
        
        {/* Main content grid with different sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
              </div>
              <Link to="/member-dashboard/transactions" className="text-sm text-blue-600 hover:underline flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {dashboardData.recentTransactions.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`rounded-full p-2 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'} mr-3`}>
                        {transaction.type === 'income' ? (
                          <DollarSign className={`w-4 h-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                        ) : (
                          <CreditCard className={`w-4 h-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{transaction.source || transaction.category}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{addThousandsSeparator(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No recent transactions</div>
            )}
          </div>
          
          {/* Message Center & Inbox Summary */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Message Center</h2>
              </div>
              <Link to="/member-dashboard/inbox" className="text-sm text-blue-600 hover:underline flex items-center">
                Inbox <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {unreadMessages > 0 ? (
              <div className="mb-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-blue-700">You have <span className="font-bold">{unreadMessages}</span> unread messages</p>
                </div>
                <Link to="/member-dashboard/inbox" className="mt-2 text-sm font-medium text-blue-600 hover:underline block text-center">
                  Check Inbox
                </Link>
              </div>
            ) : (
              <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-500 mr-2" />
                  <p className="text-gray-600">No unread messages</p>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">Your Groups</h3>
              {groups.length > 0 ? (
                <div className="space-y-2">
                  {groups.slice(0, 3).map(group => (
                    <Link 
                      key={group._id} 
                      to={`/member-dashboard/messaging/chat/${group._id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full mr-2">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[120px]">{group.groupName}</span>
                      </div>
                      {group.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {group.unreadCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No groups yet</p>
              )}
            </div>
          </div>
          
          {/* Pending Event Requests Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-full mr-2">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Event Requests</h2>
              </div>
              <Link to="/member-dashboard/new-request" className="text-sm text-blue-600 hover:underline flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {assignmentRequests.length > 0 ? (
              <div className="space-y-3">
                {assignmentRequests.slice(0, 3).map((request) => (
                  <div
                    key={request._id}
                    className="bg-yellow-50 rounded-lg p-3 border border-yellow-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {request.event?.eventName || 'Event'}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {request.event?.eventDate ? new Date(request.event.eventDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {request.event?.eventLocation || 'No location'}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                      >
                        {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
                {assignmentRequests.length > 3 && (
                  <div className="text-center mt-2">
                    <Link 
                      to="/member-dashboard/new-request" 
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View all {assignmentRequests.length} requests
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-yellow-50 p-3 rounded-full mb-3">
                  <Calendar className="w-8 h-8 text-yellow-400" />
                </div>
                <p className="text-gray-500">No pending event requests</p>
              </div>
            )}
          </div>
          
          {/* Upcoming Events Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
              </div>
              <Link to="/member-dashboard/upcoming-events" className="text-sm text-blue-600 hover:underline flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {approvedEvents.length > 0 ? (
              <div className="space-y-3">
                {approvedEvents.slice(0, 3).map((event) => (
                  <div
                    key={event._id}
                    className="bg-green-50 rounded-lg p-3 border border-green-100"
                  >
                    <h4 className="font-medium text-gray-800">
                      {event.event?.eventName || 'Event'}
                    </h4>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="w-3.5 h-3.5 mr-1 text-green-600" />
                        {event.event?.eventDate ? new Date(event.event.eventDate).toLocaleDateString() : 'N/A'}
                      </div>
                      <span className="text-xs text-green-600 font-medium">Confirmed</span>
                    </div>
                  </div>
                ))}
                {approvedEvents.length > 3 && (
                  <div className="text-center mt-2">
                    <Link 
                      to="/member-dashboard/upcoming-events" 
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View all {approvedEvents.length} upcoming events
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-green-50 p-3 rounded-full mb-3">
                  <Calendar className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-gray-500">No upcoming events scheduled</p>
              </div>
            )}
          </div>
          
          {/* Refund History */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Recent Refund Requests</h2>
              </div>
              <Link to="/member-dashboard/refund-history" className="text-sm text-blue-600 hover:underline flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {refundHistory.length > 0 ? (
              <div className="grid gap-4">
                {refundHistory.map((refund) => (
                  <div 
                    key={refund._id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium">Request #{refund._id.slice(-6)}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(refund.processedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(refund.status)}`}>
                        {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount: <span className="font-medium">₹{refund.refundAmount}</span></p>
                      <p className="text-sm text-gray-600 truncate">Reason: <span className="font-medium">{refund.reason}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No refund history</div>
            )}
          </div>
          
          {/* Profile Summary */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <UserCircle2 className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Profile Summary</h2>
              </div>
              <Link to="/member-dashboard/profile" className="text-sm text-blue-600 hover:underline flex items-center">
                Edit <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {userData ? (
              <div className="space-y-3">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 rounded-full p-4">
                    <UserCircle2 className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <p className="text-gray-600">Full Name:</p>
                  <p className="font-medium text-gray-800">{userData.fullName}</p>
                  
                  <p className="text-gray-600">Dance Style:</p>
                  <p className="font-medium text-gray-800">{userData.danceStyle}</p>
                  
                  <p className="text-gray-600">Experience:</p>
                  <p className="font-medium text-gray-800">{userData.yearsOfExperience} years</p>
                  
                  <p className="text-gray-600">Email:</p>
                  <p className="font-medium text-gray-800 truncate">{userData.email}</p>
                </div>
                
                {userData.achievements && userData.achievements.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm mb-2">Achievements:</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.achievements.slice(0, 2).map((achievement, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                          {achievement}
                        </span>
                      ))}
                      {userData.achievements.length > 2 && (
                        <span className="text-xs text-blue-600">+{userData.achievements.length - 2} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">Profile information not available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardHome;