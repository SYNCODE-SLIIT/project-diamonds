import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment';

const FinancialReport = () => {
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/finance/report");
      setReport(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch financial report");
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Map transactions to chart data
  const data = report?.transactions?.map(tx => ({
    date: moment(tx.date).format('YYYY-MM-DD'),
    amount: tx.totalAmount
  })) || [];

  // Instead of using XLSX in the frontend, just open the backend endpoint to download the Excel file
  const exportToExcel = () => {
    window.open("http://localhost:4000/api/finance/report", "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white shadow-md rounded mt-8">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Financial Report</h2>
      {report ? (
        <div>
          <p className="mb-2">Total Revenue: ${report.totalRevenue}</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#82ca9d" name="Payment Amount" />
            </BarChart>
          </ResponsiveContainer>
          <button 
            onClick={exportToExcel} 
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Export to Excel
          </button>
        </div>
      ) : (
        <p>Loading report...</p>
      )}
    </div>
  );
};

export default FinancialReport;
