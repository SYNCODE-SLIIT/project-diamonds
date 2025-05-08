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
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * target);
      setValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };
    animate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

const Dashboard = () => {
  // Always call hooks first!
  // Set default values to 0 to avoid undefined errors before data loads
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [anomaliesLoading, setAnomaliesLoading] = useState(true);
  const [anomalyStats, setAnomalyStats] = useState(null);
  const [anomalyFilters, setAnomalyFilters] = useState({
    severity: 'all',
    type: 'all',
    dateRange: 'all'
  });

  // These will be 0 until dashboardData is loaded
  const totalIncome = dashboardData?.totalIncome || 0;
  const totalExpense = dashboardData?.totalExpense || 0;
  const transactions = dashboardData?.transactions || [];
  const refunds = dashboardData?.refunds || [];
  const payments = dashboardData?.payments || [];
  const budget = dashboardData?.budget || {};
  const allocatedBudget = budget.allocatedBudget || 0;
  const remainingBudget = budget.remainingBudget || 0;
  const netProfit = totalIncome - totalExpense;
  const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalRefunds = refunds.reduce((acc, r) => acc + r.refundAmount, 0);
  const avgTransaction = transactions.length > 0 ? (transactions.reduce((acc, t) => acc + t.totalAmount, 0) / transactions.length).toFixed(2) : 0;
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
  const topUser = scatterData.length > 0 ? scatterData.reduce((a, b) => (a.totalSpend > b.totalSpend ? a : b)) : null;

  // Animated KPI values (always call hooks before any return)
  const animatedTotalIncome = useCountUp(totalIncome);
  const animatedTotalExpense = useCountUp(totalExpense);
  const animatedTotalPayments = useCountUp(totalPayments);
  const animatedNetProfit = useCountUp(netProfit);
  const animatedAvgTransaction = useCountUp(Number(avgTransaction));
  const animatedTopUserSpend = useCountUp(topUser ? topUser.totalSpend : 0);
  const animatedBudgetUsed = useCountUp(allocatedBudget - remainingBudget);

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

  // Fetch anomalies
  useEffect(() => {
    axiosInstance
      .get("/api/finance/anomalies")
      .then((res) => {
        if (res.data.success) {
          setAnomalies(res.data.anomalies);
        }
        setAnomaliesLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching anomalies:", err);
        setAnomaliesLoading(false);
      });
  }, []);

  // Filter anomalies based on selected filters
  const filteredAnomalies = anomalies.filter(anomaly => {
    if (anomalyFilters.severity !== 'all' && anomaly.severity !== anomalyFilters.severity) return false;
    if (anomalyFilters.type !== 'all' && !anomaly.anomalyTypes.includes(anomalyFilters.type)) return false;
    if (anomalyFilters.dateRange !== 'all') {
      const anomalyDate = new Date(anomaly.date);
      const now = new Date();
      switch (anomalyFilters.dateRange) {
        case 'today':
          return anomalyDate.toDateString() === now.toDateString();
        case 'week':
          return anomalyDate > new Date(now - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return anomalyDate > new Date(now - 30 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    }
    return true;
  });

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      case 'low': return 'bg-blue-100 border-blue-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  // Get anomaly type icon
  const getAnomalyTypeIcon = (type) => {
    switch (type) {
      case 'amount':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'frequency':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'time':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'user':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard data...</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  const dailyTrends = dashboardData?.dailyTrends || [];
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

  // Build waterfall chart data based on budget details.
  const waterfallData = [
    { name: "Allocated Budget", change: allocatedBudget },
    { name: "Current Spend", change: -remainingBudget },
    { name: "Refunds", change: totalRefunds },
    { name: "Net Balance", change: allocatedBudget - remainingBudget + totalRefunds },
  ];

  // Derived KPIs
  const budgetPercent = allocatedBudget > 0 ? ((allocatedBudget - remainingBudget) / allocatedBudget) * 100 : 0;
  const recentTransactions = transactions.slice(0, 5);

  // Export handlers
  const handleExportExcel = async () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Prepare data for each sheet
      const paymentData = payments.map(p => ({
        'User': p.user?.fullName || p.user?.email || 'Unknown',
        'Amount': p.amount,
        'Status': p.status,
        'Payment Method': p.paymentMethod,
        'Date': new Date(p.date).toLocaleDateString()
      }));

      const budgetData = budget ? [{
        'Allocated Budget': budget.allocatedBudget,
        'Current Spend': budget.currentSpend,
        'Remaining Budget': budget.remainingBudget,
        'Status': budget.status,
        'Reason': budget.reason
      }] : [];

      const refundData = refunds.map(r => ({
        'User': r.user?.fullName || r.user?.email || 'Unknown',
        'Refund Amount': r.refundAmount,
        'Reason': r.reason,
        'Status': r.status,
        'Date': new Date(r.date).toLocaleDateString()
      }));

      const transactionData = transactions.map(t => ({
        'User': t.user?.fullName || t.user?.email || 'Unknown',
        'Amount': t.totalAmount,
        'Type': t.transactionType,
        'Date': new Date(t.date).toLocaleDateString()
      }));
      
      // Add analytics data
      const analyticsData = [
        ['Financial Analytics Summary', ''],
        ['', ''],
        ['Key Performance Indicators', ''],
        ['Total Income', totalIncome],
        ['Total Expense', totalExpense],
        ['Net Profit', netProfit],
        ['Total Payments', totalPayments],
        ['Average Transaction', avgTransaction],
        ['Budget Utilization', `${budgetPercent.toFixed(2)}%`],
        ['', ''],
        ['Payment Status Distribution', ''],
      ];
      
      // Add payment status distribution
      paymentStatusDataArray.forEach(item => {
        analyticsData.push([item.name, item.amount]);
      });
      
      analyticsData.push(['', '']);
      analyticsData.push(['Top Users by Spend', '']);
      
      // Add top users
      const topUsers = scatterData
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 5);
        
      topUsers.forEach(user => {
        analyticsData.push([user.user, user.totalSpend]);
      });
      
      // Add daily trends
      analyticsData.push(['', '']);
      analyticsData.push(['Daily Transaction Trends', '']);
      analyticsData.push(['Date', 'Amount', 'Count']);
      
      dailyTrendsChartData.forEach(day => {
        analyticsData.push([day.date, day.total, day.count]);
      });

      // Create worksheets
      const paymentSheet = XLSX.utils.json_to_sheet(paymentData);
      const budgetSheet = XLSX.utils.json_to_sheet(budgetData);
      const refundSheet = XLSX.utils.json_to_sheet(refundData);
      const transactionSheet = XLSX.utils.json_to_sheet(transactionData);
      const analyticsSheet = XLSX.utils.aoa_to_sheet(analyticsData);
      
      // Add styling to analytics sheet
      if (!analyticsSheet['!cols']) analyticsSheet['!cols'] = [];
      analyticsSheet['!cols'][0] = { wch: 25 };
      analyticsSheet['!cols'][1] = { wch: 15 };
      
      // Fix column widths for other sheets
      const setColumnWidths = (sheet) => {
        if (!sheet['!ref']) return; // Skip if sheet is empty
        
        const cols = [];
        const range = XLSX.utils.decode_range(sheet['!ref']);
        
        // Initialize with default width
        for (let C = range.s.c; C <= range.e.c; ++C) {
          cols[C] = { wch: 15 }; // Default width
        }
        
        // Adjust based on content
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = sheet[cellAddress];
            if (!cell) continue;
            
            const cellValue = cell.v !== undefined ? String(cell.v) : '';
            const cellWidth = cellValue.length + 2; // Add padding
            
            if (cellWidth > cols[C].wch) {
              cols[C].wch = Math.min(cellWidth, 30); // Cap at 30 characters
            }
          }
        }
        
        sheet['!cols'] = cols;
      };

      setColumnWidths(paymentSheet);
      setColumnWidths(budgetSheet);
      setColumnWidths(refundSheet);
      setColumnWidths(transactionSheet);
      
      // Add sheets to workbook
      XLSX.utils.book_append_sheet(wb, analyticsSheet, "Analytics");
      XLSX.utils.book_append_sheet(wb, paymentSheet, "Payments");
      XLSX.utils.book_append_sheet(wb, budgetSheet, "Budget");
      XLSX.utils.book_append_sheet(wb, refundSheet, "Refunds");
      XLSX.utils.book_append_sheet(wb, transactionSheet, "Transactions");
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `Financial_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Excel report with analytics generated successfully');
    } catch (err) {
      console.error('Error exporting Excel:', err);
      toast.error('Failed to export Excel report: ' + err.message);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Try to use the jsPDF library directly for more reliable PDF generation
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add header with logo-like styling
      doc.setFillColor(44, 62, 80);
      doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('Team Diamond Financial Report', 15, 20);
      
      // Add date
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 40);
      
      // Add KPI summary
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text('Financial Overview', 15, 55);
      
      const kpiData = [
        ['Total Income', `RS. ${totalIncome.toLocaleString()}`],
        ['Total Expense', `RS. ${totalExpense.toLocaleString()}`],
        ['Net Profit', `RS. ${netProfit.toLocaleString()}`],
        ['Total Payments', `RS. ${totalPayments.toLocaleString()}`],
        ['Avg. Transaction', `RS. ${avgTransaction.toLocaleString()}`]
      ];
      
      autoTable(doc, {
        startY: 60,
        head: [['Metric', 'Value']],
        body: kpiData,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
      
      // Add transactions table
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text('Recent Transactions', 15, doc.lastAutoTable.finalY + 20);
      
      const transactionTableData = transactions.slice(0, 10).map(t => [
        t.user?.fullName || 'Unknown',
        `RS. ${t.totalAmount.toLocaleString()}`,
        t.transactionType,
        new Date(t.date).toLocaleDateString()
      ]);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 25,
        head: [['User', 'Amount', 'Type', 'Date']],
        body: transactionTableData,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
      
      // Add payment status chart data
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text('Payment Status Distribution', 15, doc.lastAutoTable.finalY + 20);
      
      const paymentStatusTableData = paymentStatusDataArray.map(item => [
        item.name,
        `RS. ${item.amount.toLocaleString()}`
      ]);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 25,
        head: [['Status', 'Amount']],
        body: paymentStatusTableData,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Team Diamond Financial Services', 15, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }
      
      // Save the PDF directly instead of trying to use the backend
      doc.save(`Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF report generated successfully');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      toast.error('Failed to export PDF report: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-100 py-10 px-2 md:px-10 animate-fadein">
      {/* Export Buttons - just above KPI Summary */}
      <div className="flex justify-end gap-3 mb-8">
        <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-2xl font-semibold text-base transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6m0 0l-2-2m2 2l2-2" /></svg>
          Export to Excel
        </button>
        <button onClick={handleExportPDF} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-2xl font-semibold text-base transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Export to PDF
        </button>
      </div>
      {/* KPI Summary */}
      <section className="mb-14">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6 tracking-tight flex items-center gap-3">
          <svg className="h-9 w-9 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m4 4h-1v-4h-1m-4 4h-1v-4h-1" /></svg>
          KPI Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* KPI Cards - no box, no shadow, no border, just spacing */}
          <div className="flex flex-col items-center gap-3 p-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-green-200 to-green-400 mb-2">
              <span className="text-4xl">💰</span>
            </div>
            <div className="text-gray-500 text-lg font-medium">Total Income</div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">RS.{animatedTotalIncome}</div>
          </div>
          <div className="flex flex-col items-center gap-3 p-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-red-200 to-red-400 mb-2">
              <span className="text-4xl">💸</span>
            </div>
            <div className="text-gray-500 text-lg font-medium">Total Expense</div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">RS.{animatedTotalExpense}</div>
          </div>
          <div className="flex flex-col items-center gap-3 p-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-200 to-blue-400 mb-2">
              <span className="text-4xl">🧾</span>
            </div>
            <div className="text-gray-500 text-lg font-medium">Total Payments</div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">RS.{animatedTotalPayments}</div>
          </div>
          <div className="flex flex-col items-center gap-3 p-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-200 to-emerald-400 mb-2">
              <span className="text-4xl">📈</span>
            </div>
            <div className="text-gray-500 text-lg font-medium">Net Profit</div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">RS.{animatedNetProfit}</div>
          </div>
          <div className="flex flex-col items-center gap-3 p-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-200 to-indigo-400 mb-2">
              <span className="text-4xl">📊</span>
            </div>
            <div className="text-gray-500 text-lg font-medium">Avg. Transaction</div>
            <div className="text-xl font-extrabold text-gray-900 tracking-tight">RS.{animatedAvgTransaction}</div>
          </div>
          <div className="flex flex-col items-center gap-3 p-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 mb-2">
              <span className="text-4xl">🏆</span>
            </div>
            <div className="text-gray-500 text-lg font-medium">Top User</div>
            <div className="text-lg font-bold text-gray-900 text-center">{topUser ? topUser.user : 'N/A'}</div>
            <div className="text-sm text-gray-700">{topUser ? `RS.${animatedTopUserSpend}` : ''}</div>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-green-200 to-green-400 mb-2">
              <span className="text-4xl">📊</span>
            </div>
            <div className="text-gray-500 text-lg font-medium">Budget Utilization</div>
            <div className="w-full mt-2">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full transition-all" style={{ width: `${budgetPercent}%` }}></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">{animatedBudgetUsed} / {allocatedBudget} used ({budgetPercent.toFixed(1)}%)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-14">
        <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-3">
          <svg className="h-7 w-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V6a4 4 0 00-8 0v4m8 0a4 4 0 01-8 0" /></svg>
          Recent Activity
        </h2>
          <ul className="divide-y divide-gray-200">
            {recentTransactions.map((tx, idx) => (
            <li key={tx._id || idx} className="py-4 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xl">
                  {(tx.user?.fullName ? tx.user.fullName.split(' ').map(n => n[0]).join('') : (tx.user?.email ? tx.user.email[0].toUpperCase() : '?'))}
                </div>
                <span className="font-medium text-gray-700 text-lg">{tx.user?.fullName || tx.user?.email || 'Unknown User'}</span>
              </div>
              <span className="text-gray-500 text-base">{tx.transactionType}</span>
              <span className="text-gray-700 font-semibold text-lg">RS.{tx.totalAmount}</span>
              <span className="text-gray-400 text-sm">{tx.date ? new Date(tx.date).toLocaleDateString() : ''}</span>
              </li>
            ))}
          </ul>
      </section>
      {/* Charts Section */}
      <section className="mb-14 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-4 p-6">
          <h4 className="font-semibold text-xl text-blue-700 mb-2 flex items-center gap-2">
            <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>
            Payment Status Distribution
          </h4>
          <CustomPieChart
            data={paymentStatusDataArray}
            label="Payments"
            totalAmount={paymentStatusDataArray.reduce((acc, cur) => acc + cur.amount, 0)}
            colors={["#4caf50", "#ff9800", "#f44336"]}
            showTextAnchor={true}
          />
        </div>
        <div className="flex flex-col gap-4 p-6">
          <h4 className="font-semibold text-xl text-green-700 mb-2 flex items-center gap-2">
            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>
            Refund Analysis
          </h4>
          <CustomBarChart
            data={refundDataArray.map((item) => ({
              category: item.reason,
              amount: item.refundAmount,
            }))}
          />
        </div>
      </section>
      {/* User-Centric Analysis & Forecasting */}
      <section className="mb-14 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-4 p-6">
          <h4 className="font-semibold text-xl text-indigo-700 mb-2 flex items-center gap-2">
            <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>
            Individual Financial Behavior
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey="transactions" name="Transactions" tick={{ fontSize: 12, fill: "#555" }} />
              <YAxis type="number" dataKey="totalSpend" name="Total Spend" tick={{ fontSize: 12, fill: "#555" }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Users" data={scatterData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <h4 className="font-semibold text-xl text-purple-700 mb-2 flex items-center gap-2">
            <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>
            Future Cash Flow Forecast
          </h4>
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
      {/* Comparative & Advanced Visualization */}
      <section className="mb-14 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-4 p-6">
          <h4 className="font-semibold text-xl text-blue-700 mb-2 flex items-center gap-2">
            <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>
            Payments: Today vs. Yesterday
          </h4>
            <CustomBarChart
              data={[
                { day: "Yesterday", amount: totalPayments * 0.9 },
                { day: "Today", amount: totalPayments },
              ]}
            />
          </div>
        <div className="flex flex-col gap-4 p-6">
          <h4 className="font-semibold text-xl text-green-700 mb-2 flex items-center gap-2">
            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>
            Refunds: Today vs. Yesterday
          </h4>
            <CustomBarChart
              data={[
                { day: "Yesterday", amount: totalRefunds * 0.9 },
                { day: "Today", amount: totalRefunds },
              ]}
            />
        </div>
      </section>
      <section className="mb-14">
        <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-3">
          <svg className="h-7 w-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>
          Advanced Visualization Techniques
        </h2>
        <div className="flex flex-col gap-4 p-6">
          <h4 className="font-semibold text-xl text-purple-700 mb-2 flex items-center gap-2">
            <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg>
            Waterfall Chart: Financial Flow Breakdown
          </h4>
          <WaterfallChart data={waterfallData} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
