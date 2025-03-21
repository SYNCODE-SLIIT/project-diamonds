// src/components/FinancialDashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Custom components for cards and charts
import InfoCard from './Cards/InfoCard';
import CustomBarChart from './Charts/CustomBarChart';
import CustomPieChart from './Charts/CustomPieChart';

// Updated form imports with new paths
import BudgetForm from './Financial/BudgeEdittForm';
import InvoiceForm from './Financial/InvoiceEditForm';
import PaymentForm from './Financial/PaymentEditForm';
import RefundForm from './Financial/RefundEditForm';

// Recharts components for charts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from 'recharts';

// React Icons (using Font Awesome icons from react-icons)
import { FaMoneyBillWave, FaWallet, FaPiggyBank } from 'react-icons/fa';

// Colors for charts
const COLORS = ['#875cf5', '#cfbefb', '#FF8042', '#82ca9d', '#0088FE', '#FFBB28'];

// Helper functions for dynamic classNames based on status values
const invoiceStatusClass = (status) => {
  switch (status) {
    case 'paid':
      return 'bg-green-200';
    case 'pending':
      return 'bg-amber-200'; // amber approximates a red-yellow mix
    default:
      return 'bg-gray-200';
  }
};

const paymentStatusClass = (status) => {
  switch (status) {
    case 'failed':
      return 'bg-red-200';
    case 'approved':
      return 'bg-green-200';
    case 'completed':
      return 'bg-blue-200';
    case 'authorized':
      return 'bg-gray-200';
    default:
      return 'bg-gray-200';
  }
};

const refundStatusClass = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-200';
    case 'rejected':
      return 'bg-red-200';
    case 'pending':
      return 'bg-blue-200';
    default:
      return 'bg-gray-200';
  }
};

const budgetStatusClass = (status) => {
  if (status === "approved") return "bg-green-200";
  if (status === "declined") return "bg-red-200";
  return "bg-gray-200";
};

const FinancialDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/finance');
        setDashboardData(res.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error fetching dashboard data');
      }
    };
    fetchDashboardData();
  }, []);

  // ----------------------------
  // Data Aggregation Functions
  // ----------------------------
  const aggregateByMonth = useMemo(() => {
    if (!dashboardData?.transactions) return [];
    const monthData = {};
    dashboardData.transactions.forEach((tx) => {
      const month = new Date(tx.date).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      monthData[month] = (monthData[month] || 0) + tx.totalAmount;
    });
    return Object.entries(monthData).map(([month, amount]) => ({ month, amount }));
  }, [dashboardData?.transactions]);

  const aggregateByCategory = useMemo(() => {
    if (!dashboardData?.transactions) return [];
    const categoryData = {};
    dashboardData.transactions.forEach((tx) => {
      const category = tx.details?.category || 'Others';
      categoryData[category] = (categoryData[category] || 0) + tx.totalAmount;
    });
    return Object.entries(categoryData).map(([name, amount]) => ({ name, amount }));
  }, [dashboardData?.transactions]);

  const aggregateInvoicesByStatus = useMemo(() => {
    if (!dashboardData?.invoices) return [];
    const invoiceStatus = {};
    dashboardData.invoices.forEach((inv) => {
      const status = inv.paymentStatus || 'Unknown';
      invoiceStatus[status] = (invoiceStatus[status] || 0) + 1;
    });
    return Object.entries(invoiceStatus).map(([status, count]) => ({ name: status, value: count }));
  }, [dashboardData?.invoices]);

  const aggregatePaymentsByStatus = useMemo(() => {
    if (!dashboardData?.payments) return [];
    const paymentStatus = {};
    dashboardData.payments.forEach((pay) => {
      const status = pay.status || 'Unknown';
      paymentStatus[status] = (paymentStatus[status] || 0) + 1;
    });
    return Object.entries(paymentStatus).map(([status, count]) => ({ name: status, value: count }));
  }, [dashboardData?.payments]);

  const aggregateRefundsByStatus = useMemo(() => {
    if (!dashboardData?.refunds) return [];
    const refundStatus = {};
    dashboardData.refunds.forEach((ref) => {
      const status = ref.status || 'Unknown';
      refundStatus[status] = (refundStatus[status] || 0) + 1;
    });
    return Object.entries(refundStatus).map(([status, count]) => ({ name: status, value: count }));
  }, [dashboardData?.refunds]);

  const aggregateBudgetData = useMemo(() => {
    if (!dashboardData?.budget) return [];
    const { allocatedBudget, remainingBudget } = dashboardData.budget;
    const spent = allocatedBudget - remainingBudget;
    return [
      { name: 'Allocated', value: allocatedBudget },
      { name: 'Spent', value: spent },
      { name: 'Remaining', value: remainingBudget },
    ];
  }, [dashboardData?.budget]);

  // Create bubble chart data based on monthly revenue
  const bubbleData = useMemo(() => {
    if (!aggregateByMonth.length) return [];
    return aggregateByMonth.map((data, index) => ({
      x: index + 1,
      y: data.amount,
      z: Math.max(data.amount / 100, 10),
      name: data.month,
    }));
  }, [aggregateByMonth]);

  // ----------------------------
  // Inline Status Update Handlers (with guard checks)
  // ----------------------------
  const handleInvoiceStatusChange = (e, invoice) => {
    const newStatus = e.target.value;
    if (newStatus === invoice.paymentStatus) return;
    axios
      .patch(`http://localhost:4000/api/finance/i/${invoice._id}`, { paymentStatus: newStatus })
      .then(() => {
        toast.success(`Invoice ${invoice.invoiceNumber} updated to ${newStatus}`);
        const updatedInvoices = dashboardData.invoices.map((item) =>
          item._id === invoice._id ? { ...item, paymentStatus: newStatus } : item
        );
        setDashboardData({ ...dashboardData, invoices: updatedInvoices });
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to update invoice status');
      });
  };

  const handlePaymentStatusChange = (e, payment) => {
    const newStatus = e.target.value;
    if (newStatus === payment.status) return;
    axios
      .patch(`http://localhost:4000/api/finance/p/${payment._id}`, { status: newStatus })
      .then(() => {
        toast.success(`Payment updated to ${newStatus}`);
        const updatedPayments = dashboardData.payments.map((item) =>
          item._id === payment._id ? { ...item, status: newStatus } : item
        );
        setDashboardData({ ...dashboardData, payments: updatedPayments });
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to update payment status');
      });
  };

  const handleRefundStatusChange = (e, refund) => {
    const newStatus = e.target.value;
    if (newStatus === refund.status) return;
    axios
      .patch(`http://localhost:4000/api/finance/r/${refund._id}`, { status: newStatus })
      .then(() => {
        toast.success(`Refund updated to ${newStatus}`);
        const updatedRefunds = dashboardData.refunds.map((item) =>
          item._id === refund._id ? { ...item, status: newStatus } : item
        );
        setDashboardData({ ...dashboardData, refunds: updatedRefunds });
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to update refund status');
      });
  };

// New: Inline Budget Status Update Handler
const handleBudgetStatusChange = async (e, budget) => {
  const newStatus = e.target.value;
  if (newStatus === budget.status) return; // Avoid redundant updates
  try {
    // PATCH request to update the budget status.
    // Include the current allocatedBudget and currentSpend values to enable proper remainingBudget calculation.
    const response = await axios.patch(
      `http://localhost:4000/api/finance/b/${budget._id}`,
      { 
        allocatedBudget: budget.allocatedBudget,
        currentSpend: budget.currentSpend,
        status: newStatus 
      }
    );

    // Display success toast notification
    toast.success(`Budget status updated to "${newStatus}"`);

    // Update local state with the new status
    const updatedBudget = { ...dashboardData.budget, status: newStatus };
    setDashboardData({ ...dashboardData, budget: updatedBudget });
  } catch (error) {
    // Log the error and display failure toast notification
    console.error("Error updating budget status:", error);
    toast.error("Failed to update budget status");
  }
};


  // ----------------------------
  // Example View Handlers
  // ----------------------------
  const handleInvoiceView = (inv) => toast(`Viewing details for invoice ${inv.invoiceNumber}`);
  const handlePaymentView = (pay) => toast(`Viewing details for payment of RS.${pay.amount}`);
  const handleRefundView = (ref) => toast(`Viewing details for refund of RS.${ref.refundAmount}`);

  // ----------------------------
  // Render Component
  // ----------------------------
  return (
    <div className="p-4 bg-white min-h-screen">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-4">Financial Manager Dashboard</h1>
      {dashboardData ? (
        <>
          {/* Top-Level Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <InfoCard
              icon={<FaMoneyBillWave size={24} />}
              label="Total Income"
              value={dashboardData.totalIncome || 0}
              color="bg-green-500"
            />
            <InfoCard
              icon={<FaMoneyBillWave size={24} />}
              label="Total Expense"
              value={dashboardData.totalExpense || 0}
              color="bg-red-500"
            />
            <InfoCard
              icon={<FaWallet size={24} />}
              label="Allocated Budget"
              value={dashboardData.budget?.allocatedBudget || 'N/A'}
              color="bg-blue-500"
              onClick={() => setSelectedBudget(dashboardData.budget)}
            />
            <InfoCard
              icon={<FaPiggyBank size={24} />}
              label="Remaining Budget"
              value={dashboardData.budget?.remainingBudget || 'N/A'}
              color="bg-yellow-500"
              onClick={() => setSelectedBudget(dashboardData.budget)}
            />
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Monthly Revenue Analysis (Bar Chart) */}
            <div className="bg-white shadow rounded p-4 hover:shadow-xl transition-shadow duration-200">
              <h2 className="text-xl font-semibold mb-2">Monthly Revenue Analysis</h2>
              <CustomBarChart data={aggregateByMonth} />
            </div>
            {/* Revenue Bubble Analysis (Bubble Chart) */}
            <div className="bg-white shadow rounded p-4 hover:shadow-xl transition-shadow duration-200">
              <h2 className="text-xl font-semibold mb-2">Revenue Bubble Analysis</h2>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Month"
                    tickFormatter={(v) => {
                      const months = [
                        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                      ];
                      return months[v - 1] || v;
                    }}
                  />
                  <YAxis type="number" dataKey="y" name="Revenue" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Revenue" data={bubbleData} fill="#8884d8" />
                  <Legend />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Revenue by Category */}
            <div className="bg-white shadow rounded p-4 hover:shadow-xl transition-shadow duration-200">
              <h2 className="text-xl font-semibold mb-2">Revenue by Category</h2>
              <CustomPieChart
                data={aggregateByCategory}
                label="Categories"
                totalAmount={dashboardData.totalIncome}
                colors={COLORS}
                showTextAnchor
              />
            </div>
            {/* Budget Overview (Bar Chart) */}
            <div className="bg-white shadow rounded p-4 hover:shadow-xl transition-shadow duration-200">
              <h2 className="text-xl font-semibold mb-2">Budget Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aggregateBudgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow rounded p-4 hover:shadow-xl transition-shadow duration-200">
              <h2 className="text-xl font-semibold mb-2">Invoice Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={aggregateInvoicesByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {aggregateInvoicesByStatus.map((entry, index) => (
                      <Cell key={`cell-inv-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white shadow rounded p-4 hover:shadow-xl transition-shadow duration-200">
              <h2 className="text-xl font-semibold mb-2">Payment Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={aggregatePaymentsByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {aggregatePaymentsByStatus.map((entry, index) => (
                      <Cell key={`cell-pay-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white shadow rounded p-4 hover:shadow-xl transition-shadow duration-200">
              <h2 className="text-xl font-semibold mb-2">Refund Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={aggregateRefundsByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {aggregateRefundsByStatus.map((entry, index) => (
                      <Cell key={`cell-ref-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Tables */}
          {/* Invoices Table */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Invoices</h2>
            <div className="overflow-auto max-h-96">
              <table className="min-w-full table-fixed border border-gray-300">
                <thead className="bg-white">
                  <tr className="divide-x divide-gray-100">
                    <th className="px-4 py-2 text-left">Invoice #</th>
                    <th className="px-4 py-2 text-left">Amount (RS)</th>
                    <th className="px-4 py-2 text-center" style={{ width: "2.5rem" }}>Status</th>
                    <th className="px-4 py-2 text-center" style={{ width: "2.5rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {dashboardData.invoices?.map((inv) => (
                    <tr key={inv._id} className="hover:shadow-md transition-shadow duration-200">
                      <td className="px-4 py-2">{inv.invoiceNumber}</td>
                      <td className="px-4 py-2">{inv.amount}</td>
                      <td className="px-4 py-2 text-center">
                        <select
                          value={inv.paymentStatus}
                          onChange={(e) => handleInvoiceStatusChange(e, inv)}
                          className={`${invoiceStatusClass(inv.paymentStatus)} w-28 text-white px-2 py-1 rounded-full hover:shadow-lg transition-colors duration-200 mx-auto`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 flex gap-2 justify-center">
                        <button
                          onClick={() => handleInvoiceView(inv)}
                          className="bg-green-500 text-white px-2 py-1 rounded-full hover:bg-green-600 transition-colors duration-200 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="bg-blue-500 text-white px-2 py-1 rounded-full hover:bg-blue-600 transition-colors duration-200 text-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments Table */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Payments</h2>
            <div className="overflow-auto max-h-96">
              <table className="min-w-full table-fixed border border-gray-300">
                <thead className="bg-white">
                  <tr className="divide-x divide-gray-100">
                    <th className="px-4 py-2 text-left">Amount (RS)</th>
                    <th className="px-4 py-2 text-left">Method</th>
                    <th className="px-4 py-2 text-center" style={{ width: "2.5rem" }}>Status</th>
                    <th className="px-4 py-2 text-center" style={{ width: "2.5rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {dashboardData.payments?.map((pay) => (
                    <tr key={pay._id} className="hover:shadow-md transition-shadow duration-200">
                      <td className="px-4 py-2">{pay.amount}</td>
                      <td className="px-4 py-2">{pay.paymentMethod}</td>
                      <td className="px-4 py-2 text-center">
                        <select
                          value={pay.status}
                          onChange={(e) => handlePaymentStatusChange(e, pay)}
                          className={`${paymentStatusClass(pay.status)} w-28 text-white px-2 py-1 rounded-full hover:shadow-lg transition-colors duration-200 mx-auto`}
                        >
                          <option value="authorized">Authorized</option>
                          <option value="completed">Completed</option>
                          <option value="approved">Approved</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 flex gap-2 justify-center">
                        <button
                          onClick={() => handlePaymentView(pay)}
                          className="bg-green-500 text-white px-2 py-1 rounded-full hover:bg-green-600 transition-colors duration-200 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setSelectedPayment(pay)}
                          className="bg-blue-500 text-white px-2 py-1 rounded-full hover:bg-blue-600 transition-colors duration-200 text-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/*Budget Table*/}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Budget Details</h2>
            <div className="overflow-auto">
              <table className="min-w-full table-fixed border border-gray-300">
                <thead className="bg-white">
                  <tr className="divide-x divide-gray-100">
                    <th className="px-4 py-2 text-left">Allocated Budget</th>
                    <th className="px-4 py-2 text-left">Spent</th>
                    <th className="px-4 py-2 text-left">Remaining Budget</th>
                    <th className="px-4 py-2 text-center" style={{ width: "2.5rem" }}>Status</th>
                    <th className="px-4 py-2 text-center" style={{ width: "2.5rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {dashboardData.budget && (
                    <tr className="hover:shadow-md transition-shadow duration-200">
                      <td className="px-4 py-2">{dashboardData.budget.allocatedBudget}</td>
                      <td className="px-4 py-2">
                        {dashboardData.budget.allocatedBudget - dashboardData.budget.remainingBudget}
                      </td>
                      <td className="px-4 py-2">{dashboardData.budget.remainingBudget}</td>
                      <td className="px-4 py-2 text-center">
                        <select
                          value={dashboardData.budget.status || 'pending'}
                          onChange={(e) => handleBudgetStatusChange(e, dashboardData.budget)}
                          className={`${budgetStatusClass(dashboardData.budget.status)} w-28 text-white px-2 py-1 rounded-full hover:shadow-lg transition-colors duration-200 mx-auto`}
                        >
                          <option value="approved">Approved</option>
                          <option value="declined">Declined</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 flex gap-2 justify-center">
                        <button
                          onClick={() => toast(`Viewing budget details`)}
                          className="bg-green-500 text-white px-2 py-1 rounded-full hover:bg-green-600 transition-colors duration-200 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setSelectedBudget(dashboardData.budget)}
                          className="bg-blue-500 text-white px-2 py-1 rounded-full hover:bg-blue-600 transition-colors duration-200 text-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )}
                  {!dashboardData.budget && (
                    <tr>
                      <td className="px-4 py-2 text-center" colSpan={5}>
                        No budget data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


          {/* Refunds Table */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Refunds</h2>
            <div className="overflow-auto max-h-96">
              <table className="min-w-full table-fixed border border-gray-300">
                <thead className="bg-white">
                  <tr className="divide-x divide-gray-100">
                    <th className="px-4 py-2 text-left">Refund Amount (RS)</th>
                    <th className="px-4 py-2 text-left">Reason</th>
                    <th className="px-4 py-2 text-center" style={{ width: "2.5rem" }}>Status</th>
                    <th className="px-4 py-2 text-center" style={{ width: "2.5rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {dashboardData.refunds?.map((ref) => (
                    <tr key={ref._id} className="hover:shadow-md transition-shadow duration-200">
                      <td className="px-4 py-2">{ref.refundAmount}</td>
                      <td className="px-4 py-2">{ref.reason}</td>
                      <td className="px-4 py-2 text-center">
                        <select
                          value={ref.status}
                          onChange={(e) => handleRefundStatusChange(e, ref)}
                          className={`${refundStatusClass(ref.status)} w-28 text-white px-2 py-1 rounded-full hover:shadow-lg transition-colors duration-200 mx-auto`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 flex gap-2 justify-center">
                        <button
                          onClick={() => handleRefundView(ref)}
                          className="bg-green-500 text-white px-2 py-1 rounded-full hover:bg-green-600 transition-colors duration-200 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setSelectedRefund(ref)}
                          className="bg-blue-500 text-white px-2 py-1 rounded-full hover:bg-blue-600 transition-colors duration-200 text-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modals / Forms */}
          {selectedBudget && (
            <BudgetForm
              budget={selectedBudget}
              onClose={() => setSelectedBudget(null)}
              onUpdated={(newBudget) => {
                setDashboardData({ ...dashboardData, budget: newBudget });
                setSelectedBudget(null);
              }}
            />
          )}
          {selectedInvoice && (
            <InvoiceForm
              invoice={selectedInvoice}
              onClose={() => setSelectedInvoice(null)}
              onUpdated={(newInvoice) => {
                const updatedInvoices = dashboardData.invoices.map((inv) =>
                  inv._id === newInvoice._id ? newInvoice : inv
                );
                setDashboardData({ ...dashboardData, invoices: updatedInvoices });
                setSelectedInvoice(null);
              }}
            />
          )}
          {selectedPayment && (
            <PaymentForm
              payment={selectedPayment}
              onClose={() => setSelectedPayment(null)}
              onUpdated={(newPayment) => {
                const updatedPayments = dashboardData.payments.map((pay) =>
                  pay._id === newPayment._id ? newPayment : pay
                );
                setDashboardData({ ...dashboardData, payments: updatedPayments });
                setSelectedPayment(null);
              }}
            />
          )}
          {selectedRefund && (
            <RefundForm
              refund={selectedRefund}
              onClose={() => setSelectedRefund(null)}
              onUpdated={(newRefund) => {
                const updatedRefunds = dashboardData.refunds.map((ref) =>
                  ref._id === newRefund._id ? newRefund : ref
                );
                setDashboardData({ ...dashboardData, refunds: updatedRefunds });
                setSelectedRefund(null);
              }}
            />
          )}
        </>
      ) : (
        <p>Loading dashboard data...</p>
      )}
    </div>
  );
};

export default FinancialDashboard;
