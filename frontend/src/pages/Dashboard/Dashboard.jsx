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

const Dashboard = () => {
  // Make sure the user is authenticated before rendering this page
  useUserAuth();

  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

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
    
      <div className="my-5 mx-auto">
        {/* Notification Bell */}
        <div className="flex justify-end mb-4">
          <div className="relative ml-4">
            <button
              className="relative focus:outline-none"
              onClick={() => setShowNotifications(v => !v)}
              aria-label="Show notifications"
            >
              <FiBell className="w-7 h-7 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{unreadCount}</span>
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
                        {n.invoiceId && (
                          <button
                            className="text-xs text-blue-700 hover:underline mt-1"
                            onClick={() => handleDownloadInvoice(n.invoiceId)}
                            type="button"
                          >
                            Download Invoice
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
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
  
  );
};

export default Dashboard;
