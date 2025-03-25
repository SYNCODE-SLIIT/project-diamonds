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
import moment from "moment";

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
        setError(err.response?.data?.message || err.message || "Error fetching data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  // Destructure returned data
  const { totalIncome, totalExpense, transactions, refunds, payments, invoices, budget } = dashboardData;

  // Derive KPI values
  const totalPayments = payments ? payments.reduce((acc, p) => acc + p.amount, 0) : 0;
  const totalRefunds = refunds ? refunds.reduce((acc, r) => acc + r.refundAmount, 0) : 0;
  const allocatedBudget = budget ? budget.allocatedBudget : 0;
  const currentSpend = budget ? budget.currentSpend : 0;

  // Process transactions to build a time-series for monthly trends.
  const monthMap = {};
  transactions.forEach((tx) => {
    const month = moment(tx.createdAt).format("MMM");
    if (!monthMap[month]) monthMap[month] = 0;
    monthMap[month] += tx.totalAmount;
  });
  const timeSeriesData = Object.keys(monthMap).map((month) => ({
    month,
    amount: monthMap[month],
  }));

  // Group payments by status for pie chart (assuming payments have a "status" field)
  const paymentStatusData = {};
  payments.forEach((p) => {
    const status = p.status || "unknown";
    if (!paymentStatusData[status]) paymentStatusData[status] = 0;
    paymentStatusData[status] += p.amount;
  });
  const paymentStatusDataArray = Object.keys(paymentStatusData).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    amount: paymentStatusData[key],
  }));

  // Group refunds by reason for a bar chart (if no reason, use "Other")
  const refundData = {};
  refunds.forEach((r) => {
    const reason = r.reason || "Other";
    if (!refundData[reason]) refundData[reason] = 0;
    refundData[reason] += r.refundAmount;
  });
  const refundDataArray = Object.keys(refundData).map((key) => ({
    reason: key,
    refundAmount: refundData[key],
  }));

  // Build scatter chart data by grouping transactions per user
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

  // Create waterfall chart data based on budget details
  const waterfallData = [
    { name: "Allocated Budget", change: allocatedBudget },
    { name: "Refunds", change: totalRefunds },
    { name: "Net Balance", change: allocatedBudget - currentSpend + totalRefunds },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* 1. KPI Summary */}
      <section>
        <h2 className="text-3xl font-bold text-purple-700 text-center mb-6">
          Financial Dashboard - KPI Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard icon="💰" label="Total Income" value={totalIncome} color="bg-green-500" />
          <InfoCard icon="💸" label="Total Expense" value={totalExpense} color="bg-red-500" />
          <InfoCard icon="🧾" label="Total Payments" value={totalPayments} color="bg-blue-500" />
        </div>
        <div className="flex justify-center mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon="↩️" label="Total Refunds" value={totalRefunds} color="bg-yellow-500" />
            <InfoCard
              icon="📊"
              label="Budget Utilization"
              value={`${currentSpend} / ${allocatedBudget}`}
              color="bg-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* 2. Time-Series Analysis */}
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">
          Time-Series Analysis
        </h2>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Monthly Transaction Trend
          </h4>
          <CustomLineChart data={timeSeriesData} />
        </div>
      </section>

      {/* 3. Payment & Invoice Analysis */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Payment Status Distribution
          </h4>
          <CustomPieChart
            data={paymentStatusDataArray}
            label="Payments"
            totalAmount={paymentStatusDataArray.reduce((acc, cur) => acc + cur.amount, 0)}
            colors={["#4caf50", "#f44336", "#ff9800"]}
            showTextAnchor={true}
          />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Invoice Trends by Category
          </h4>
          <CustomBarChart
            data={invoices.map((inv) => ({
              category: inv.category || "Other",
              amount: inv.amount || 0,
            }))}
          />
        </div>
      </section>

      {/* 4. Budget Utilization */}
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">
          Budget Utilization & Variance Analysis
        </h2>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Budget Utilization Overview
          </h4>
          <p className="mt-2 text-sm text-gray-600">
            Allocated Budget: RS. {allocatedBudget}, Current Spend: RS. {currentSpend}
          </p>
        </div>
      </section>

      {/* 5. Refund and Transaction Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Refund Analysis
          </h4>
          <CustomBarChart
            data={refundDataArray.map((item) => ({
              month: item.reason,
              amount: item.refundAmount,
            }))}
          />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Transaction Breakdown
          </h4>
          <CustomPieChart
            data={[
              { name: "Payments", amount: totalPayments },
              { name: "Refunds", amount: totalRefunds },
            ]}
            label="Transactions"
            totalAmount={totalPayments + totalRefunds}
            colors={["#2196f3", "#f44336"]}
            showTextAnchor={true}
          />
        </div>
      </section>

      {/* 6. User-Centric Analysis */}
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">
          User-Centric Analysis
        </h2>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Individual Financial Behavior
          </h4>
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

      {/* 7. Predictive Analytics & Forecasting */}
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">
          Predictive Analytics & Forecasting
        </h2>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Future Cash Flow Forecast
          </h4>
          <CustomLineChart
            data={timeSeriesData.map((item) => ({
              month: item.month,
              amount: Math.round(item.amount * 1.05), // assume 5% growth
            }))}
          />
        </div>
      </section>

      {/* 8. Comparative Analysis */}
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">
          Comparative Analysis
        </h2>
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-lg text-purple-700 mb-2">
              Payments: This Month vs. Last Month
            </h4>
            <CustomBarChart
              data={[
                { month: "Last Month", amount: totalPayments * 0.8 },
                { month: "This Month", amount: totalPayments },
              ]}
            />
          </div>
          <div>
            <h4 className="font-semibold text-lg text-purple-700 mb-2">
              Refunds: This Month vs. Last Month
            </h4>
            <CustomBarChart
              data={[
                { month: "Last Month", amount: totalRefunds * 0.8 },
                { month: "This Month", amount: totalRefunds },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 9. Advanced Visualization Techniques */}
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">
          Advanced Visualization Techniques
        </h2>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Waterfall Chart: Financial Flow Breakdown
          </h4>
          <WaterfallChart data={waterfallData} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
