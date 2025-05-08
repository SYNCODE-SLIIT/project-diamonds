import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

const DrillDownReports = () => {
  const [report, setReport] = useState(null);
  const [reportRange, setReportRange] = useState("monthly"); // Options: daily, monthly, quarterly
  const [loading, setLoading] = useState(true);

  // Fetch report data based on the selected report range.
  const fetchReport = async () => {
    setLoading(true);
    try {
      // Pass the report range as a query parameter.
      const response = await axiosInstance.get(
        `api/finance/report?range=${reportRange}`
      );
      setReport(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to fetch financial report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportRange]);

  // Map transactions to chart data.
  const data =
    report?.transactions?.map((tx) => ({
      date: moment(tx.date).format("YYYY-MM-DD"),
      amount: tx.totalAmount,
    })) || [];

  // Export Excel by opening the backend endpoint.
  const exportToExcel = () => {
    window.open(
      `http://localhost:4000/api/finance/report?range=${reportRange}`,
      "_blank"
    );
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold text-purple-700 mb-4">
        Interactive & Drill-Down Reports
      </h2>
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center mb-4">
          <label htmlFor="filter" className="text-sm text-gray-700 mr-2">
            Select Report Range:
          </label>
          <select
            id="filter"
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Use interactive filters to drill down by time period, transaction type,
          or user segment. This enables more granular analysis.
        </p>
        <Toaster />
        {loading ? (
          <p>Loading report...</p>
        ) : report ? (
          <div>
            <p className="mb-2">
              Total Revenue: ${report.totalRevenue}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#555" }} />
                <YAxis tick={{ fontSize: 12, fill: "#555" }} />
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
          <p>No report data found.</p>
        )}
      </div>
    </section>
  );
};

export default DrillDownReports;