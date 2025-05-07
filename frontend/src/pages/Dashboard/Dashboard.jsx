import React, { useEffect, useState } from 'react';
// import MemberDashboardLayout from '../../components/layout/MemberDashboardLayout.jsx';
import { useUserAuth } from '../../hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import InfoCard from '../../components/Cards/InfoCard.jsx';
import { LuHandCoins, LuWalletMinimal } from 'react-icons/lu';
import { IoMdCard } from "react-icons/io";
import { addThousandsSeparator } from '../../utils/helper.js';
import RecentTransaction from '../../components/Dashboard/RecentTransaction';
import FinanceOverview from '../../components/Dashboard/FinanceOverview';
import ExpenseTransaction from '../../components/Dashboard/ExpenseTransaction';
import Last30DaysExpenses from '../../components/Dashboard/Last30DaysExpenses';
import RecentIncomeWithChart from '../../components/Dashboard/RecentIncomeWithChart';
import RecentIncome from '../../components/Dashboard/RecentIncome';
import { FiBell } from 'react-icons/fi';
import Chatbot from './Chatbot';

const Dashboard = () => {
  // Make sure the user is authenticated before rendering this page
  useUserAuth();

  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const fetchDashboardData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA);
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch finance notifications for the financial manager
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

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.post(`/api/finance/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await axiosInstance.get(`/api/finance/invoice/${invoiceId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download invoice');
    }
  };

  return (
    <>
      <div className="my-5 mx-auto">
        {/* Notification Panel */}
        <div className="flex justify-end mb-6">
          <div className="relative">
            <button
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none"
              onClick={() => setShowNotifications(v => !v)}
              aria-label="Show notifications"
            >
              <FiBell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-xl z-50 border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                    <button 
                      className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1"
                      onClick={fetchNotifications} 
                      disabled={notifLoading}
                    >
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiBell className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No notifications yet</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {notifications.map(n => (
                        <li 
                          key={n._id} 
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            n.isRead ? 'bg-white' : 'bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                              n.type === 'success' ? 'bg-green-500' :
                              n.type === 'warning' ? 'bg-yellow-500' :
                              n.type === 'error' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm text-gray-800">{n.message}</p>
                              <div className="mt-1 flex items-center gap-3">
                                <span className="text-xs text-gray-500">
                                  {new Date(n.createdAt).toLocaleString()}
                                </span>
                                {!n.isRead && (
                                  <button
                                    onClick={() => handleMarkAsRead(n._id)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                              {n.invoiceId && (
                                <button
                                  onClick={() => handleDownloadInvoice(n.invoiceId)}
                                  className="mt-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                  Download Invoice
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rest of the dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
            color="bg-purple-500" 
          />
          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeparator(dashboardData?.totalIncome || 0)}
            color="bg-orange-500" 
          />
          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expense"
            value={addThousandsSeparator(dashboardData?.totalExpenses || 0)}
            color="bg-red-500" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentTransaction
            transaction={dashboardData?.recentTransactions}
            onSeeMore={() => navigate("/member-dashboard/transactions")}
          />

          <FinanceOverview
            totalBalance={dashboardData?.totalBalance || 0}
            totalIncome={dashboardData?.totalIncome || 0}
            totalExpense={dashboardData?.totalExpenses || 0}
          />

          <ExpenseTransaction
            transactions={dashboardData?.last30DaysExpenses?.transactions || []}
            onSeeMore={() => navigate("/member-dashboard/expense")}
          />

          <Last30DaysExpenses
            data = {dashboardData?.last30DaysExpenses?.transactions || []}
          />

          <RecentIncomeWithChart
            data = {dashboardData?.last60DaysIncome?.transactions?.slice(0,4) || []}
            totalIncome={dashboardData?.totalIncome || 0}
          />

          <RecentIncome
            transactions={dashboardData?.last60DaysIncome?.transactions || []}
            onSeeMore={() => navigate("/member-dashboard/income")}
          />

        </div>
      </div>
      {/* Floating Chatbot Button */}
      <button
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl focus:outline-none"
        onClick={() => setShowChatbot(true)}
        aria-label="Open Chatbot"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
      >
        <span role="img" aria-label="Chat">💬</span>
      </button>
      {showChatbot && (
        <Chatbot onClose={() => setShowChatbot(false)} />
      )}
    </>
  );
};

export default Dashboard;
