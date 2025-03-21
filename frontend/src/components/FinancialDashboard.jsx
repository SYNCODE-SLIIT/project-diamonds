// src/components/FinancialDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import InfoCard from './Cards/InfoCard';
import TransactionInfoCard from './Cards/TransactionInfoCard';
import CustomBarChart from './Charts/CustomBarChart';
import CustomLineChart from './Charts/CustomLineChart';
import CustomPieChart from './Charts/CustomPieChart';
import BudgetForm from './Financial/BudgetForm';
import InvoiceForm from './Financial/InvoiceForm';
import PaymentForm from './Financial/PaymentForm';
import RefundForm from './Financial/RefundForm';

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

  const aggregateByMonth = () => {
    if (!dashboardData || !dashboardData.transactions) return [];
    const monthData = {};
    dashboardData.transactions.forEach((tx) => {
      const month = new Date(tx.date).toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      });
      monthData[month] = (monthData[month] || 0) + tx.totalAmount;
    });
    return Object.entries(monthData).map(([month, amount]) => ({ month, amount }));
  };

  const aggregateByCategory = () => {
    if (!dashboardData || !dashboardData.transactions) return [];
    const categoryData = {};
    dashboardData.transactions.forEach((tx) => {
      const category = tx.details?.category || 'Others';
      categoryData[category] = (categoryData[category] || 0) + tx.totalAmount;
    });
    return Object.entries(categoryData).map(([name, amount]) => ({ name, amount }));
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-4">Financial Manager Dashboard</h1>
      {dashboardData ? (
        <>
          {/* Analytics Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <InfoCard 
              icon={<i className="fas fa-money-bill-wave"></i>} 
              label="Total Income" 
              value={dashboardData.totalIncome || 0} 
              color="bg-green-500" 
            />
            <InfoCard 
              icon={<i className="fas fa-money-bill-wave"></i>} 
              label="Total Expense" 
              value={dashboardData.totalExpense || 0} 
              color="bg-red-500" 
            />
            <InfoCard 
              icon={<i className="fas fa-wallet"></i>} 
              label="Allocated Budget" 
              value={dashboardData.budget?.allocatedBudget ?? "N/A"} 
              color="bg-blue-500" 
              onClick={() => setSelectedBudget(dashboardData.budget)}
            />
            <InfoCard 
              icon={<i className="fas fa-piggy-bank"></i>} 
              label="Remaining Budget" 
              value={dashboardData.budget?.remainingBudget ?? "N/A"} 
              color="bg-yellow-500" 
              onClick={() => setSelectedBudget(dashboardData.budget)}
            />
          </div>

          {/* Transactions List */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Transactions</h2>
            {(dashboardData.transactions || []).map((tx) => (
              <TransactionInfoCard
                key={tx._id}
                title={tx.transactionType}
                date={new Date(tx.date).toLocaleDateString()}
                amount={tx.totalAmount}
                type={tx.transactionType === 'payment' ? 'income' : 'expense'}
              />
            ))}
          </div>

          {/* Charts */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Monthly Revenue</h2>
            <CustomBarChart data={aggregateByMonth()} />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Revenue Trend</h2>
            <CustomLineChart data={aggregateByMonth()} />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Revenue by Category</h2>
            <CustomPieChart 
              data={aggregateByCategory()} 
              label="Categories" 
              totalAmount={dashboardData.totalIncome} 
              colors={['#875cf5', '#cfbefb', '#FF8042', '#82ca9d']} 
              showTextAnchor={true} 
            />
          </div>

          {/* Invoices */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Invoices</h2>
            {(dashboardData.invoices || []).map((inv) => (
              <div key={inv._id} className="p-2 border rounded mb-2 flex justify-between items-center">
                <div>
                  <p>Invoice #: {inv.invoiceNumber}</p>
                  <p>Amount: RS.{inv.amount}</p>
                  <p>Status: {inv.paymentStatus}</p>
                </div>
                <button 
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => setSelectedInvoice(inv)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>

          {/* Payments */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Payments</h2>
            {(dashboardData.payments || []).map((pay) => (
              <div key={pay._id} className="p-2 border rounded mb-2 flex justify-between items-center">
                <div>
                  <p>Payment Amount: RS.{pay.amount}</p>
                  <p>Method: {pay.paymentMethod}</p>
                  <p>Status: {pay.status}</p>
                  {pay.bankSlipFile && (
                    <img 
                      src={`http://localhost:4000/${pay.bankSlipFile.replace(/\\/g, "/")}`} 
                      alt="Bank Slip" 
                      className="w-20 h-20 object-cover mt-1" 
                    />
                  )}
                </div>
                <button 
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => setSelectedPayment(pay)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>

               {/* Invoices */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Invoices</h2>
            {(dashboardData.invoices || []).map((inv) => (
              <div key={inv._id} className="p-2 border rounded mb-2 flex justify-between items-center">
                <div>
                  <p>Invoice #: {inv.invoiceNumber}</p>
                  <p>Amount: RS.{inv.amount}</p>
                  <p>Status: {inv.paymentStatus}</p>
                </div>
                <button 
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => setSelectedInvoice(inv)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>

          {/* Refunds */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Refunds</h2>
            {(dashboardData.refunds || []).map((ref) => (
              <div key={ref._id} className="p-2 border rounded mb-2 flex justify-between items-center">
                <div>
                  <p>Refund Amount: RS.{ref.refundAmount}</p>
                  <p>Reason: {ref.reason}</p>
                  <p>Status: {ref.status}</p>
                </div>
                <button 
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => setSelectedRefund(ref)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Loading dashboard data...</p>
      )}

      {/* Modals/Forms for Editing */}
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
            // Update invoice list in dashboardData
            const updatedInvoices = dashboardData.invoices.map(inv => inv._id === newInvoice._id ? newInvoice : inv);
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
            const updatedPayments = dashboardData.payments.map(pay => pay._id === newPayment._id ? newPayment : pay);
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
            const updatedRefunds = dashboardData.refunds.map(ref => ref._id === newRefund._id ? newRefund : ref);
            setDashboardData({ ...dashboardData, refunds: updatedRefunds });
            setSelectedRefund(null);
          }}
        />
      )}
    </div>
  );
};

export default FinancialDashboard;
