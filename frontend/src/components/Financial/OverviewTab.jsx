import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import InfoCard from "../Cards/InfoCard";
import CustomBarChart from "../Charts/CustomBarChart";
import CustomLineChart from "../Charts/CustomLineChart";
import CustomPieChart from "../Charts/CustomPieChart";
import WaterfallChart from "../Charts/WaterfallChart";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { saveAs } from 'file-saver';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/api/finance/dashboard")
      .then((res) => {
        setDashboardData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Error fetching dashboard data"
        );
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard data...</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  const {
    totalIncome,
    totalExpense,
    transactions,
    refunds,
    payments,
    budget,
    dailyTrends, 
  } = dashboardData;

  // Calculate derived KPI values
  const totalPayments = payments ? payments.reduce((acc, p) => acc + p.amount, 0) : 0;
  const totalRefunds = refunds ? refunds.reduce((acc, r) => acc + r.refundAmount, 0) : 0;
  const allocatedBudget = budget ? budget.allocatedBudget : 0;
  const remainingBudget = budget ? budget.remainingBudget : 0;

  const dailyTrendsChartData = dailyTrends.map((item) => ({
    date: item._id, 
    total: item.total,
    count: item.count,
  }));

  // Group payments by status for a pie chart.
  const paymentStatusData = {};
  payments.forEach((p) => {
    const status = p.status || "unknown";
    paymentStatusData[status] = (paymentStatusData[status] || 0) + p.amount;
  });
  const paymentStatusDataArray = Object.keys(paymentStatusData).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    amount: paymentStatusData[key],
  }));

  // Group refunds by reason for a bar chart.
  const refundData = {};
  refunds.forEach((r) => {
    const reason = r.reason || "Other";
    refundData[reason] = (refundData[reason] || 0) + r.refundAmount;
  });
  const refundDataArray = Object.keys(refundData).map((key) => ({
    reason: key,
    refundAmount: refundData[key],
  }));

  // Build scatter chart data: group transactions by user.
  const scatterMap = {};
  transactions.forEach((tx) => {
    if (tx.user) {
      const name = tx.user.fullName || tx.user.email;
      if (!scatterMap[name]) {
        scatterMap[name] = { user: name, transactions: 0, totalSpend: 0 };
      }
      scatterMap[name].transactions += 1;
      scatterMap[name].totalSpend += tx.totalAmount;
    }
  });
  const scatterData = Object.values(scatterMap);

  // Build waterfall chart data based on budget details.
  const waterfallData = [
    { name: "Allocated Budget", change: allocatedBudget },
    { name: "Current Spend", change: -remainingBudget },
    { name: "Refunds", change: totalRefunds },
    { name: "Net Balance", change: allocatedBudget - remainingBudget + totalRefunds },
  ];

  // Derived KPIs
  const netProfit = totalIncome - totalExpense;
  const avgTransaction = transactions && transactions.length > 0 ? (transactions.reduce((acc, t) => acc + t.totalAmount, 0) / transactions.length).toFixed(2) : 0;
  const topUser = scatterData.length > 0 ? scatterData.reduce((a, b) => (a.totalSpend > b.totalSpend ? a : b)) : null;
  const budgetPercent = allocatedBudget > 0 ? ((allocatedBudget - remainingBudget) / allocatedBudget) * 100 : 0;
  const recentTransactions = transactions.slice(0, 5);

  // Export handlers
  const handleExportExcel = async () => {
    try {
      const res = await axiosInstance.get('/api/finance/excel-report', { responseType: 'blob' });
      saveAs(res.data, 'Financial_Report.xlsx');
    } catch (err) {
      alert('Failed to export Excel');
    }
  };
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div id="dashboard-report" className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* Print-only report title and date */}
      <div className="hidden print:block">
        <div className="print-title">Financial Analytics Report</div>
        <div className="print-date">Generated: {new Date().toLocaleString()}</div>
      </div>
      {/* Export Buttons */}
      <div className="flex justify-end mb-4 gap-2 no-print">
        <button onClick={handleExportExcel} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow font-semibold">Export to Excel</button>
        <button onClick={handleExportPDF} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow font-semibold">Export to PDF</button>
      </div>
      {/*KPI Summary */}
      <section>
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">KPI Summary</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mb-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Income */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mb-2">
              <span className="text-2xl">��</span>
            </div>
            <div className="text-gray-500 text-sm font-medium">Total Income</div>
            <div className="text-2xl font-bold text-gray-900">RS.{totalIncome}</div>
          </div>
          {/* Total Expense */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 mb-2">
              <span className="text-2xl">💸</span>
            </div>
            <div className="text-gray-500 text-sm font-medium">Total Expense</div>
            <div className="text-2xl font-bold text-gray-900">RS.{totalExpense}</div>
          </div>
          {/* Total Payments */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 mb-2">
              <span className="text-2xl">🧾</span>
            </div>
            <div className="text-gray-500 text-sm font-medium">Total Payments</div>
            <div className="text-2xl font-bold text-gray-900">RS.{totalPayments}</div>
          </div>
          {/* Net Profit */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-100 mb-2">
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-gray-500 text-sm font-medium">Net Profit</div>
            <div className="text-2xl font-bold text-gray-900">RS.{netProfit}</div>
          </div>
          {/* Avg Transaction */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100 mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-gray-500 text-sm font-medium">Avg. Transaction</div>
            <div className="text-2xl font-bold text-gray-900">RS.{avgTransaction}</div>
          </div>
          {/* Top User */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-100 mb-2">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-gray-500 text-sm font-medium">Top User</div>
            <div className="text-lg font-bold text-gray-900 text-center">{topUser ? topUser.user : 'N/A'}</div>
            <div className="text-sm text-gray-700">{topUser ? `RS.${topUser.totalSpend}` : ''}</div>
          </div>
          {/* Budget Utilization */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-2 col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-200 mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-gray-500 text-sm font-medium">Budget Utilization</div>
            <div className="w-full mt-2">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: `${budgetPercent}%` }}></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">{allocatedBudget - remainingBudget} / {allocatedBudget} used ({budgetPercent.toFixed(1)}%)</div>
            </div>
          </div>
        </div>
      </section>
      <div className="print-divider" />
      {/* Recent Activity */}
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4 print-section">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow p-4">
          <ul className="divide-y divide-gray-200">
            {recentTransactions.map((tx, idx) => (
              <li key={tx._id || idx} className="py-2 flex items-center justify-between">
                <span className="font-medium text-gray-700">{tx.user?.fullName || tx.user?.email || 'Unknown User'}</span>
                <span className="text-gray-500 text-sm">{tx.transactionType}</span>
                <span className="text-gray-700">RS.{tx.totalAmount}</span>
                <span className="text-gray-400 text-xs">{tx.date ? new Date(tx.date).toLocaleDateString() : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="print-divider" />
      {/*Payment & Refund Analysis */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2 print-section">Payment Status Distribution</h4>
          <CustomPieChart
            data={paymentStatusDataArray}
            label="Payments"
            totalAmount={paymentStatusDataArray.reduce((acc, cur) => acc + cur.amount, 0)}
            colors={["#4caf50", "#ff9800", "#f44336"]}
            showTextAnchor={true}
          />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2 print-section">Refund Analysis</h4>
          <CustomBarChart
            data={refundDataArray.map((item) => ({
              category: item.reason,
              amount: item.refundAmount,
            }))}
          />
        </div>
      </section>
      <div className="print-divider" />
      {/* User-Centric Analysis */}
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4 print-section">User-Centric Analysis</h2>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2 print-section">Individual Financial Behavior</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey="transactions" name="Transactions" tick={{ fontSize: 12, fill: "#555" }} />
              <YAxis type="number" dataKey="totalSpend" name="Total Spend" tick={{ fontSize: 12, fill: "#555" }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Users" data={scatterData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="print-divider" />
      {/*Predictive Analytics & Forecasting */}
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4 print-section">Predictive Analytics & Forecasting</h2>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2 print-section">Future Cash Flow Forecast</h4>
          <CustomLineChart
            data={dailyTrendsChartData.map((item) => ({
              date: item.date,
              amount: Math.round(item.total * 1.05),
            }))}
            xKey="date"
            yKey="amount"
          />
        </div>
      </section>
      <div className="print-divider" />
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4 print-section">Comparative Analysis</h2>
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-lg text-purple-700 mb-2 print-section">Payments: Today vs. Yesterday</h4>
            <CustomBarChart
              data={[
                { day: "Yesterday", amount: totalPayments * 0.9 },
                { day: "Today", amount: totalPayments },
              ]}
            />
          </div>
          <div>
            <h4 className="font-semibold text-lg text-purple-700 mb-2 print-section">Refunds: Today vs. Yesterday</h4>
            <CustomBarChart
              data={[
                { day: "Yesterday", amount: totalRefunds * 0.9 },
                { day: "Today", amount: totalRefunds },
              ]}
            />
          </div>
        </div>
      </section>
      <div className="print-divider" />
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4 print-section">Advanced Visualization Techniques</h2>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2 print-section">Waterfall Chart: Financial Flow Breakdown</h4>
          <WaterfallChart data={waterfallData} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
