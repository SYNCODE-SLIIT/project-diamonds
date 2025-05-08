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
import { UserCircle2, Calendar, Trophy, Mail, MessageSquare, Clock, ArrowRight, ChevronDown, ChevronUp, CreditCard, DollarSign, BarChart2, AlertCircle, Users } from 'lucide-react';
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
  const [notifications, setNotifications] = useState([]);
  const [groupUnread, setGroupUnread] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [managerUnread, setManagerUnread] = useState(0);
  const [groups, setGroups] = useState([]);
  const [managerThread, setManagerThread] = useState(null);
  const memberId = user?.profileId || '';
  
  // Calculate unread notification count
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Calculate total notifications that need attention
  const hasImportantNotifications = unreadMessages > 0 || assignmentRequests.length > 0 || approvedEvents.length > 0;
  const totalUnreadNotifications = unreadCount + unreadMessages + assignmentRequests.length + approvedEvents.length;

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
      
      // Calculate and store unread group messages
      const count = gs.reduce((total, group) => total + (group.unreadCount || 0), 0);
      setGroupUnread(count);
    } catch (err) {
      console.error('Error fetching message groups:', err);
    }
  };

  // Fetch manager thread and unread count
  const fetchManagerThread = async () => {
    if (!user?._id) return;
    try {
      const token = localStorage.getItem('token');
      
      // First get all users to find the manager
      const usersRes = await fetch(`http://localhost:4000/api/users`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = await usersRes.json();
      const manager = users.find(u => u.role === 'teamManager');
      if (!manager) return;

      // Get all direct chat threads for the user
      const threadsRes = await fetch(`http://localhost:4000/api/direct-chats/user/${user._id}`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { threads } = await threadsRes.json();
      
      // Find the thread with the manager
      const thread = threads.find(t => t.participants.some(p => p._id === manager._id));
      if (thread) {
        setManagerThread(thread);
        setManagerUnread(thread.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching manager thread:', err);
    }
  };

  // Derive unreadMessages from groupUnread and managerUnread
  useEffect(() => {
    setUnreadMessages(groupUnread + managerUnread);
  }, [groupUnread, managerUnread]);

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchUserData(),
        fetchAssignmentRequests(),
        fetchNotifications(),
        fetchMessageGroups(),
        fetchManagerThread()
      ]);
      setLoading(false);
    };
    
    loadAllData();
    
    // Refresh message count periodically
    const interval = setInterval(() => {
      fetchMessageGroups();
      fetchManagerThread();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user]);

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
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 gap-8">
        {/* Header with Welcome and Notifications */}
        <div className="flex items-center justify-between bg-white shadow-md rounded-xl p-6 border-l-4 border-[#25105A]">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-5 border-2 border-[#25105A] flex-shrink-0 shadow-md">
              {(userData?.profilePicture || user?.profilePicture) ? (
                <img
                  src={userData?.profilePicture || user?.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="bg-gradient-to-br from-[#1E0B32] to-[#25105A] w-full h-full flex items-center justify-center">
                  <UserCircle2 className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {userData?.fullName || user?.name || 'Member'}</h1>
              <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          
          {/* Notification Bell - Improved with animation and dot indicator */}
          <div className="relative">
            <button
              className="relative p-3 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
              onClick={() => setShowNotifications(v => !v)}
              aria-label="Show notifications"
            >
              <FiBell className={`w-6 h-6 text-[#25105A] ${hasImportantNotifications ? 'animate-pulse' : ''}`} />
              
              {/* Show numerical badge only for finance notifications */}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {unreadCount}
                </span>
              )}
              
              {/* Show red dot for unread messages and event requests */}
              {hasImportantNotifications && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200 max-h-[70vh] overflow-y-auto">
                <div className="sticky top-0 p-3 border-b font-semibold bg-gradient-to-r from-[#1E0B32] to-[#25105A] text-white flex justify-between items-center">
                  <span className="flex items-center">
                    <FiBell className="mr-2 h-4 w-4" />
                    Notifications
                    {totalUnreadNotifications > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {totalUnreadNotifications}
                      </span>
                    )}
                  </span>
                  <button className="text-xs text-purple-200 hover:text-white hover:underline transition-colors" onClick={fetchNotifications} disabled={notifLoading}>
                    Refresh
                  </button>
                </div>
                
                {notifLoading ? (
                  <div className="p-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-[#25105A]"></div>
                    <p className="mt-2 text-gray-500 text-sm">Loading notifications...</p>
                  </div>
                ) : (
                  <>
                    {(!notifications.length && !assignmentRequests.length && !unreadMessages && !approvedEvents.length) ? (
                      <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                          <FiBell className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No new notifications</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {/* Priority notifications section */}
                        {(unreadMessages > 0 || assignmentRequests.length > 0 || approvedEvents.length > 0) && (
                          <li className="p-3 bg-purple-50">
                            <h3 className="text-xs uppercase text-purple-700 font-semibold mb-2">Priority Updates</h3>
                            <div className="space-y-2">
                              {/* Event Request notifications */}
                              {assignmentRequests.length > 0 && (
                                <Link to="/member-dashboard/new-request" className="flex items-center p-2 rounded-md bg-white hover:bg-yellow-50 transition-colors">
                                  <div className="rounded-full p-2 bg-yellow-100 mr-2">
                                    <Calendar className="w-4 h-4 text-yellow-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      {assignmentRequests.length} Event Request{assignmentRequests.length > 1 ? 's' : ''}
                                    </p>
                                    <p className="text-xs text-gray-500">Requires your attention</p>
                                  </div>
                                </Link>
                              )}
                              
                              {/* Unread message notifications */}
                              {unreadMessages > 0 && (
                                <Link to="/member-dashboard/inbox" className="flex items-center p-2 rounded-md bg-white hover:bg-purple-100 transition-colors">
                                  <div className="rounded-full p-2 bg-[#25105A]/20 mr-2">
                                    <Mail className="w-4 h-4 text-[#25105A]" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      {unreadMessages} Unread Message{unreadMessages > 1 ? 's' : ''}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {managerUnread > 0 ? `Including ${managerUnread} from your manager` : 'From your conversations'}
                                    </p>
                                  </div>
                                </Link>
                              )}
                              
                              {/* Upcoming Events notifications */}
                              {approvedEvents.length > 0 && (
                                <Link to="/member-dashboard/upcoming-events" className="flex items-center p-2 rounded-md bg-white hover:bg-green-50 transition-colors">
                                  <div className="rounded-full p-2 bg-green-100 mr-2">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      {approvedEvents.length} Upcoming Event{approvedEvents.length > 1 ? 's' : ''}
                                    </p>
                                    <p className="text-xs text-gray-500">Confirmed events</p>
                                  </div>
                                </Link>
                              )}
                            </div>
                          </li>
                        )}
                        
                        {/* Finance notifications with improved design */}
                        {notifications.length > 0 && (
                          <>
                            <li className="p-3 bg-gray-50">
                              <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2">Financial Updates</h3>
                            </li>
                            {notifications.map(n => (
                              <li key={n._id} className={`p-3 hover:bg-gray-50 transition-colors ${n.isRead ? '' : 'border-l-2 border-[#25105A]'}`}>
                                <div className="flex items-start">
                                  <div className={`rounded-full p-2 ${n.isRead ? 'bg-gray-100' : 'bg-[#25105A]/10'} mr-3 mt-1`}>
                                    <CreditCard className={`w-4 h-4 ${n.isRead ? 'text-gray-500' : 'text-[#25105A]'}`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                                        {n.message}
                                      </p>
                                      {!n.isRead && (
                                        <button 
                                          className="ml-2 text-xs text-[#25105A] hover:underline" 
                                          onClick={() => handleMarkAsRead(n._id)}
                                        >
                                          Mark read
                                        </button>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-400 block mt-1">
                                      {new Date(n.createdAt).toLocaleString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </>
                        )}
                      </ul>
                    )}
                    
                    {/* View all link */}
                    {(notifications.length > 0 || unreadMessages > 0 || assignmentRequests.length > 0 || approvedEvents.length > 0) && (
                      <div className="p-3 text-center border-t border-gray-100">
                        <button 
                          className="text-sm text-[#25105A] hover:underline font-medium"
                          onClick={() => setShowNotifications(false)}
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-5 flex items-center hover:shadow-lg transition-shadow border border-gray-100">
            <div className="rounded-full p-3 bg-gradient-to-br from-[#1E0B32] to-[#25105A] text-white mr-4 shadow-md">
              <IoMdCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Balance</p>
              <p className="text-2xl font-bold text-gray-800">Rs. {addThousandsSeparator(dashboardData?.totalBalance || 0)}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 flex items-center hover:shadow-lg transition-shadow border border-gray-100">
            <div className="rounded-full p-3 bg-green-100 mr-4 shadow-md">
              <LuWalletMinimal className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold text-gray-800">Rs. {addThousandsSeparator(dashboardData?.totalIncome || 0)}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 flex items-center hover:shadow-lg transition-shadow border border-gray-100">
            <div className="rounded-full p-3 bg-red-100 mr-4 shadow-md">
              <LuHandCoins className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Expense</p>
              <p className="text-2xl font-bold text-gray-800">Rs. {addThousandsSeparator(dashboardData?.totalExpenses || 0)}</p>
            </div>
          </div>
        </div>
        
        {/* Main content grid with different sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-[#25105A]/10 mr-2">
                  <CreditCard className="w-5 h-5 text-[#25105A]" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
              </div>
              <Link to="/member-dashboard/transactions" className="text-sm text-[#25105A] hover:underline flex items-center">
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
                      {transaction.type === 'income' ? '+' : '-'}Rs. {addThousandsSeparator(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No recent transactions</div>
            )}
          </div>
          
          {/* Message Center & Inbox Summary */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-[#25105A]/10 mr-2">
                  <MessageSquare className="w-5 h-5 text-[#25105A]" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Message Center</h2>
              </div>
              <Link to="/member-dashboard/inbox" className="text-sm text-[#25105A] hover:underline flex items-center">
                Inbox <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {unreadMessages > 0 ? (
              <div className="mb-4 bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-[#25105A] mr-2" />
                  <p className="text-[#25105A]">You have <span className="font-bold">{unreadMessages}</span> unread messages</p>
                </div>
                <Link to="/member-dashboard/inbox" className="mt-2 text-sm font-medium text-[#25105A] hover:underline block text-center">
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
              <h3 className="font-medium text-gray-700 mb-2">Your Conversations</h3>
              
              {/* Manager Chat Link - Only show if thread exists */}
              {managerThread && (
                <Link 
                  to={`/member-dashboard/direct-chat/${managerThread._id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 transition-colors mb-2"
                >
                  <div className="flex items-center">
                    <div className="bg-[#25105A]/10 text-[#25105A] p-1.5 rounded-full mr-2">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Team Manager</span>
                  </div>
                  {managerUnread > 0 && (
                    <span className="bg-[#25105A] text-white text-xs px-2 py-0.5 rounded-full">
                      {managerUnread}
                    </span>
                  )}
                </Link>
              )}
              
              {/* Group Chats Links */}
              {groups.length > 0 ? (
                <div className="space-y-2">
                  {groups.slice(0, 3).map(group => (
                    <Link 
                      key={group._id} 
                      to={`/member-dashboard/messaging/chat/${group._id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="bg-[#25105A]/10 text-[#25105A] p-1.5 rounded-full mr-2">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[120px]">{group.groupName}</span>
                      </div>
                      {group.unreadCount > 0 && (
                        <span className="bg-[#25105A] text-white text-xs px-2 py-0.5 rounded-full">
                          {group.unreadCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No groups yet</p>
              )}
              
              {(groups.length === 0 && !managerThread) && (
                <p className="text-gray-500 text-sm">No conversations yet</p>
              )}
            </div>
          </div>
          
          {/* Pending Event Requests Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100 mr-2">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Event Requests</h2>
              </div>
              <Link to="/member-dashboard/new-request" className="text-sm text-[#25105A] hover:underline flex items-center">
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
                      className="text-sm font-medium text-[#25105A] hover:underline"
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
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 mr-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
              </div>
              <Link to="/member-dashboard/upcoming-events" className="text-sm text-[#25105A] hover:underline flex items-center">
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
                      className="text-sm font-medium text-[#25105A] hover:underline"
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
          
          {/* Profile Summary */}
          <div className="md:col-span-1 bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-[#25105A]/10 mr-2">
                  <UserCircle2 className="w-5 h-5 text-[#25105A]" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Profile Summary</h2>
              </div>
              <Link to="/member-dashboard/profile" className="text-sm text-[#25105A] hover:underline flex items-center">
                Edit <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {userData ? (
              <div className="space-y-3">
                <div className="flex justify-center mb-5">
                  {userData.profilePicture ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#25105A] shadow-md">
                      <img 
                        src={userData.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-[#1E0B32] to-[#25105A] rounded-full flex items-center justify-center shadow-md">
                      <UserCircle2 className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <p className="text-gray-600">Full Name:</p>
                    <p className="font-medium text-gray-800">{userData.fullName}</p>
                  </div>
                  
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <p className="text-gray-600">Dance Style:</p>
                    <p className="font-medium text-gray-800">{userData.danceStyle}</p>
                  </div>
                  
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <p className="text-gray-600">Experience:</p>
                    <p className="font-medium text-gray-800">{userData.yearsOfExperience} years</p>
                  </div>
                  
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium text-gray-800 truncate">{userData.email}</p>
                  </div>
                </div>
                
                {userData.achievements && userData.achievements.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm mb-2">Achievements:</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.achievements.slice(0, 2).map((achievement, idx) => (
                        <span key={idx} className="bg-[#25105A]/10 text-[#25105A] text-xs px-2 py-1 rounded-full">
                          {achievement}
                        </span>
                      ))}
                      {userData.achievements.length > 2 && (
                        <span className="text-xs text-[#25105A] hover:underline cursor-pointer">+{userData.achievements.length - 2} more</span>
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