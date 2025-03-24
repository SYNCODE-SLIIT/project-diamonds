import React from "react";
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

const Dashboard = () => {
  // 1. KPI summary values (dummy data)
  const totalIncome = 150000;
  const totalExpense = 90000;
  const totalPayments = 120000;
  const totalRefunds = 5000;
  const allocatedBudget = 100000;
  const currentSpend = 75000;

  // 2. Time series dummy data (for monthly trends)
  const timeSeriesData = [
    { month: "Jan", income: 10000, expense: 6000, payments: 9000 },
    { month: "Feb", income: 12000, expense: 7000, payments: 10000 },
    { month: "Mar", income: 15000, expense: 8000, payments: 13000 },
    { month: "Apr", income: 11000, expense: 6500, payments: 9500 },
    { month: "May", income: 13000, expense: 7500, payments: 11000 },
    { month: "Jun", income: 14000, expense: 8500, payments: 11500 },
  ];

  // 3. Payment Status Distribution (dummy data)
  const paymentStatusData = [
    { name: "Paid", amount: 9500 },
    { name: "Unpaid", amount: 500 },
  ];

  // 4. Invoice trends by category (dummy data)
  const invoiceData = [
    { category: "Food", amount: 3000 },
    { category: "Services", amount: 5000 },
    { category: "Misc", amount: 2000 },
  ];

  // 5. Refund analysis data (dummy data)
  const refundData = [
    { reason: "Customer Issue", refundAmount: 2000 },
    { reason: "Quality Issue", refundAmount: 1500 },
    { reason: "Error", refundAmount: 1500 },
  ];

  // 6. User behavior: scatter chart data (dummy data)
  const scatterData = [
    { user: "User A", transactions: 15, totalSpend: 5000 },
    { user: "User B", transactions: 30, totalSpend: 12000 },
    { user: "User C", transactions: 5, totalSpend: 2000 },
    { user: "User D", transactions: 22, totalSpend: 8000 },
  ];

  // 7. Budget utilization dummy data (allocated vs spent)
  const budgetUtilizationData = [
    { month: "Jan", allocated: 10000, spent: 7000 },
    { month: "Feb", allocated: 10000, spent: 8000 },
    { month: "Mar", allocated: 10000, spent: 9000 },
    { month: "Apr", allocated: 10000, spent: 6000 },
    { month: "May", allocated: 10000, spent: 8500 },
    { month: "Jun", allocated: 10000, spent: 7500 },
  ];

  // 8. Waterfall chart data (dummy data)
  const waterfallData = [
    { name: "Starting Balance", change: 10000 },
    { name: "Expense", change: -3000 },
    { name: "Additional Income", change: 4000 },
    { name: "Refund Issued", change: -1000 },
    { name: "Final Adjustment", change: 2000 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* 1. Executive Dashboard with KPI Summary (Key perfomence indicators) */}
      <section>
        <h2 className="text-3xl font-bold text-purple-700 text-center mb-6">
          Financial Dashboard - KPI Summary
        </h2>
        {/* Top row: first three InfoCards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard icon="💰" label="Total Income" value={totalIncome} color="bg-green-500" />
          <InfoCard icon="💸" label="Total Expense" value={totalExpense} color="bg-red-500" />
          <InfoCard icon="🧾" label="Total Payments" value={totalPayments} color="bg-blue-500" />
        </div>
        {/* Centered row: remaining two InfoCards */}
        <div className="flex justify-center mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon="↩️" label="Total Refunds" value={totalRefunds} color="bg-yellow-500" />
            <InfoCard icon="📊" label="Budget Utilization" value={`${currentSpend} / ${allocatedBudget}`} color="bg-indigo-500" />
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
            Monthly Income Trend
          </h4>
          <CustomLineChart 
            data={timeSeriesData.map(item => ({
              month: item.month,
              amount: item.income,
            }))}
          />
        </div>
      </section>

      {/* 3. Payment & Invoice Analysis */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Payment Status Distribution
          </h4>
          <CustomPieChart 
            data={paymentStatusData}
            label="Payments"
            totalAmount={paymentStatusData.reduce((acc, cur) => acc + cur.amount, 0)}
            colors={["#4caf50", "#f44336"]}
            showTextAnchor={true}
          />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Invoice Trends by Category
          </h4>
          <CustomBarChart 
            data={invoiceData.map(item => ({
              month: item.category,
              amount: item.amount,
            }))}
          />
        </div>
      </section>

      {/* 4. Budget Utilization & Variance Analysis */}
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">
          Budget Utilization & Variance Analysis
        </h2>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Budget vs. Spend Over Time
          </h4>
          <CustomBarChart 
            data={budgetUtilizationData.map(item => ({
              month: item.month,
              amount: item.spent,
            }))}
          />
          <p className="mt-2 text-sm text-gray-600">
            Monthly Allocation: RS.10,000. Average Spend: RS.
            {Math.round(
              budgetUtilizationData.reduce((sum, cur) => sum + cur.spent, 0) / budgetUtilizationData.length
            )}
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
            data={refundData.map(item => ({
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
            data={timeSeriesData.map(item => ({
              month: item.month,
              amount: Math.round(item.income * 1.05), // 5% projected growth
            }))}
          />
        </div>
      </section>

      {/* 9. Comparative Analysis */}
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
                { month: "Last Month", amount: 9000 },
                { month: "This Month", amount: 12000 },
              ]}
            />
          </div>
          <div>
            <h4 className="font-semibold text-lg text-purple-700 mb-2">
              Refunds: This Month vs. Last Month
            </h4>
            <CustomBarChart 
              data={[
                { month: "Last Month", amount: 800 },
                { month: "This Month", amount: 1500 },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 10. Advanced Visualization Techniques */}
      <section>
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">
          Advanced Visualization Techniques
        </h2>
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-semibold text-lg text-purple-700 mb-2">
            Waterfall Chart: Financial Flow Breakdown
          </h4>
          <p className="text-sm text-gray-700 mb-4">
            This waterfall chart illustrates how the allocated budget is adjusted with expenditures,
            refunds, and other transactions to arrive at the final net amount.
          </p>
          <WaterfallChart data={waterfallData} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;