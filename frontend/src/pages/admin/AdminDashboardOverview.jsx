import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';

const AdminDashboardOverview = () => {
  const { user } = useContext(UserContext);
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingApplications: 0,
    activeEvents: 0,
    pendingRequests: 0,
    totalIncome: 0,
    totalExpenses: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be a single API call to get all dashboard data
        // For now, we'll simulate with placeholder data
        
        // Simulated API response
        const dashboardData = {
          stats: {
            totalMembers: 124,
            pendingApplications: 7,
            activeEvents: 12,
            pendingRequests: 4,
            totalIncome: 12750.00,
            totalExpenses: 8450.25,
            unreadMessages: 9
          },
          recentActivity: [
            { id: 1, type: 'application', user: 'Jasmine Smith', action: 'submitted a membership application', timestamp: new Date(Date.now() - 1000 * 60 * 25), status: 'pending' },
            { id: 2, type: 'event', user: 'Michael Chen', action: 'requested a new event booking', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), status: 'pending' },
            { id: 3, type: 'invoice', user: 'Dance Studio Corp', action: 'paid invoice #INV-2023-054', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), status: 'completed' },
            { id: 4, type: 'member', user: 'Alex Johnson', action: 'updated their profile information', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), status: 'completed' },
            { id: 5, type: 'budget', user: 'Sarah Williams', action: 'submitted a new budget request', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'pending' }
          ]
        };
        
        setStats(dashboardData.stats);
        setRecentActivity(dashboardData.recentActivity);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date relative to current time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d253f]">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.fullName || 'Administrator'}</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1c4b82]"></div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-[#e5e7eb] hover:border-cyan-200 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Members</p>
                  <h3 className="text-2xl font-bold text-[#1c4b82] mt-1">{stats.totalMembers}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <box-icon name="user" type="solid" color="#1c4b82"></box-icon>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/admin/members" className="text-sm text-[#1c4b82] hover:text-blue-800 font-medium">View all members →</Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-[#e5e7eb] hover:border-cyan-200 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Applications</p>
                  <h3 className="text-2xl font-bold text-[#1c4b82] mt-1">{stats.pendingApplications}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <box-icon name="file" type="solid" color="#d97706"></box-icon>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/admin/applications/combined" className="text-sm text-[#1c4b82] hover:text-blue-800 font-medium">Review applications →</Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-[#e5e7eb] hover:border-cyan-200 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Events</p>
                  <h3 className="text-2xl font-bold text-[#1c4b82] mt-1">{stats.activeEvents}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <box-icon name="calendar-event" type="solid" color="#10b981"></box-icon>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/admin/events" className="text-sm text-[#1c4b82] hover:text-blue-800 font-medium">Manage events →</Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-[#e5e7eb] hover:border-cyan-200 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Requests</p>
                  <h3 className="text-2xl font-bold text-[#1c4b82] mt-1">{stats.pendingRequests}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <box-icon name="message-alt-detail" type="solid" color="#8b5cf6"></box-icon>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/admin/event-requests" className="text-sm text-[#1c4b82] hover:text-blue-800 font-medium">View requests →</Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow-md border border-[#e5e7eb] lg:col-span-1 hover:border-cyan-200 transition-colors">
              <div className="p-6 border-b border-[#e5e7eb] bg-gradient-to-r from-[#0d253f]/5 to-[#1c4b82]/5">
                <h2 className="text-lg font-semibold text-[#0d253f]">Financial Overview</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-600 text-sm">Total Income</p>
                      <span className="text-green-600 font-medium">{formatCurrency(stats.totalIncome)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-600 text-sm">Total Expenses</p>
                      <span className="text-red-600 font-medium">{formatCurrency(stats.totalExpenses)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-600 text-sm">Net Profit</p>
                      <span className="text-[#1c4b82] font-medium">{formatCurrency(stats.totalIncome - stats.totalExpenses)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#1c4b82] h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link to="/admin/financial" className="text-sm text-[#1c4b82] hover:text-blue-800 font-medium">View financial details →</Link>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md border border-[#e5e7eb] lg:col-span-2 hover:border-cyan-200 transition-colors">
              <div className="p-6 border-b border-[#e5e7eb] bg-gradient-to-r from-[#0d253f]/5 to-[#1c4b82]/5">
                <h2 className="text-lg font-semibold text-[#0d253f]">Recent Activity</h2>
              </div>
              <div className="overflow-hidden">
                <ul className="divide-y divide-[#e5e7eb]">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="p-5 hover:bg-[#1c4b82]/5 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {activity.type === 'application' && (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <box-icon name="user-plus" color="#1c4b82"></box-icon>
                            </div>
                          )}
                          {activity.type === 'event' && (
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <box-icon name="calendar-star" color="#8b5cf6"></box-icon>
                            </div>
                          )}
                          {activity.type === 'invoice' && (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <box-icon name="receipt" color="#10b981"></box-icon>
                            </div>
                          )}
                          {activity.type === 'member' && (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <box-icon name="user-detail" color="#6366f1"></box-icon>
                            </div>
                          )}
                          {activity.type === 'budget' && (
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                              <box-icon name="dollar-circle" color="#d97706"></box-icon>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0d253f]">
                            {activity.user}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {activity.status === 'pending' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {activity.status === 'completed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Admin Sections Summary */}
          <div className="bg-white rounded-lg shadow-md border border-[#e5e7eb] mb-8 hover:border-cyan-200 transition-colors">
            <div className="p-6 border-b border-[#e5e7eb] bg-gradient-to-r from-[#0d253f]/5 to-[#1c4b82]/5">
              <h2 className="text-lg font-semibold text-[#0d253f]">Admin Portal Overview</h2>
              <p className="text-gray-500 text-sm mt-1">Quick access to all administrative sections</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Management */}
                <div className="border border-[#e5e7eb] rounded-lg p-5 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <box-icon name="user" color="#1c4b82"></box-icon>
                    </div>
                    <h3 className="font-medium text-[#0d253f]">User Management</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Manage member applications, approved members, and event organizers.</p>
                  <div className="flex items-center space-x-2">
                    <Link to="/admin/applications/combined" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Applications</Link>
                    <span className="text-gray-300">•</span>
                    <Link to="/admin/members" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Members</Link>
                    <span className="text-gray-300">•</span>
                    <Link to="/admin/organizers" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Organizers</Link>
                  </div>
                </div>
                
                {/* Financial Management */}
                <div className="border border-[#e5e7eb] rounded-lg p-5 hover:border-cyan-200 hover:bg-[#1c4b82]/5 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <box-icon name="dollar" color="#10b981"></box-icon>
                    </div>
                    <h3 className="font-medium text-[#0d253f]">Financial Management</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Track income, expenses, create invoices, and monitor financial anomalies.</p>
                  <div className="flex items-center space-x-2">
                    <Link to="/admin/financial" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Dashboard</Link>
                    <span className="text-gray-300">•</span>
                    <Link to="/admin/financial/anomalies" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Anomaly Detection</Link>
                  </div>
                </div>
                
                {/* Media Management */}
                <div className="border border-[#e5e7eb] rounded-lg p-5 hover:border-cyan-200 hover:bg-[#1c4b82]/5 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <box-icon name="video" color="#8b5cf6"></box-icon>
                    </div>
                    <h3 className="font-medium text-[#0d253f]">Media Management</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Manage blog posts, media library, social media content, and merchandise.</p>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <Link to="/admin/blog" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Blog</Link>
                    <span className="text-gray-300">•</span>
                    <Link to="/admin/media" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Media</Link>
                    <span className="text-gray-300">•</span>
                    <Link to="/admin/merchandise" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Merchandise</Link>
                  </div>
                </div>
                
                {/* Event Management */}
                <div className="border border-[#e5e7eb] rounded-lg p-5 hover:border-cyan-200 hover:bg-[#1c4b82]/5 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <box-icon name="calendar" color="#d97706"></box-icon>
                    </div>
                    <h3 className="font-medium text-[#0d253f]">Event Management</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Configure packages, handle event requests, and manage scheduled events.</p>
                  <div className="flex items-center space-x-2">
                    <Link to="/admin/packages" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Packages</Link>
                    <span className="text-gray-300">•</span>
                    <Link to="/admin/services" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Services</Link>
                    <span className="text-gray-300">•</span>
                    <Link to="/admin/events" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Events</Link>
                  </div>
                </div>
                
                {/* Team Management */}
                <div className="border border-[#e5e7eb] rounded-lg p-5 hover:border-cyan-200 hover:bg-[#1c4b82]/5 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <box-icon name="group" color="#6366f1"></box-icon>
                    </div>
                    <h3 className="font-medium text-[#0d253f]">Team Management</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Assign team members to events, manage calendar, and handle budget requests.</p>
                  <div className="flex items-center space-x-2">
                    <Link to="/admin/dashboard" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Assignments</Link>
                    <span className="text-gray-300">•</span>
                    <Link to="/admin/event-calendar" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Calendar</Link>
                    <span className="text-gray-300">•</span>
                    <Link to="/admin/budget-requests" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">Budget</Link>
                  </div>
                </div>
                
                {/* Communication */}
                <div className="border border-[#e5e7eb] rounded-lg p-5 hover:border-cyan-200 hover:bg-[#1c4b82]/5 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                      <box-icon name="message-square-dots" color="#0e7490"></box-icon>
                    </div>
                    <h3 className="font-medium text-[#0d253f]">Messaging & Communication</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Manage group conversations and direct messages with members and team.</p>
                  <div className="flex items-center space-x-2">
                    <Link to="/admin/inbox" className="text-xs text-[#1c4b82] hover:text-blue-800 font-medium">
                      Inbox
                      {stats.unreadMessages > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-[#1c4b82]">
                          {stats.unreadMessages}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardOverview;