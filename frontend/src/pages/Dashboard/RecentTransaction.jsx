// pages/RecentTransactionPage.jsx
import React, { useEffect, useState } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';

import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import IncomeList from '../../components/Income/IncomeList';
import ExpenseList from '../../components/Expense/ExpenseList';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import DeleteAlert from '../../components/DeleteAlert';
import { LuDownload } from 'react-icons/lu';

const RecentTransactionPage = () => {
  // Ensure the user is authenticated
  useUserAuth();

  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Track delete alert state for both income and expense
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
    type: null, // "income" or "expense"
  });

  // Fetch income and expense data concurrently
  const fetchTransactions = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME),
        axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE),
      ]);

      setIncomeData(incomeRes.data || []);
      setExpenseData(expenseRes.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transaction details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Delete Income Transaction
  const deleteIncome = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
      toast.success("Income details deleted successfully");
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting income:", error.response?.data?.message || error.message);
    }
  };

  // Delete Expense Transaction
  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
      toast.success("Expense details deleted successfully");
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting expense:", error.response?.data?.message || error.message);
    }
  };

  // Download Income Transactions (individual)
  const handleDownloadIncomeDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Income_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading income details", error);
      toast.error("Failed to download income details. Please try again.");
    }
  };

  // Download Expense Transactions (individual)
  const handleDownloadExpenseDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading expense details", error);
      toast.error("Failed to download expense details. Please try again.");
    }
  };

  // Combined Download Handler for both Income and Expense Transactions
  const handleDownloadAllTransactions = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TRANSACTION.DOWNLOAD_ALL, {
        responseType: "blob",
      });
      // Create a Blob with an explicit MIME type to ensure proper file interpretation
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Transactions.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading all transactions", error);
      toast.error("Failed to download transactions. Please try again.");
    }
  };

  // Handlers to open delete alert for income and expense
  const handleIncomeDelete = (id) => {
    setOpenDeleteAlert({ show: true, data: id, type: 'income' });
  };

  const handleExpenseDelete = (id) => {
    setOpenDeleteAlert({ show: true, data: id, type: 'expense' });
  };

  return (

      <div className="my-5 mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">All Transactions</h2>
          {/* Combined Download Button */}
          <button className="card-btn" onClick={handleDownloadAllTransactions}>
            <LuDownload className="text-base" />  Download All Transactions
          </button>
                      
        </div>
        {loading ? (
          <p>Loading transactions...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Income Transactions */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2">Income Transactions</h3>
              <IncomeList
                transactions={incomeData}
                onDelete={handleIncomeDelete}
                onDownload={handleDownloadIncomeDetails}
              />
            </div>
            {/* Expense Transactions */}
            <div className="border border-gray-200 rounded-lg p-4 mt-6">
              <h3 className="text-xl font-semibold mb-2">Expense Transactions</h3>
              <ExpenseList
                transactions={expenseData}
                onDelete={handleExpenseDelete}
                onDownload={handleDownloadExpenseDetails}
              />
            </div>
          </div>
        )}

        {/* Delete Alert Modal */}
        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null, type: null })}
          title={openDeleteAlert.type === 'income' ? "Delete Income" : "Delete Expense"}
        >
          <DeleteAlert
            content={
              openDeleteAlert.type === 'income'
                ? "Are you sure you want to delete this income detail?"
                : "Are you sure you want to delete this expense detail?"
            }
            onDelete={() => {
              if (openDeleteAlert.type === 'income') {
                deleteIncome(openDeleteAlert.data);
              } else if (openDeleteAlert.type === 'expense') {
                deleteExpense(openDeleteAlert.data);
              }
              setOpenDeleteAlert({ show: false, data: null, type: null });
            }}
          />
        </Modal>
      </div>

  );
};

export default RecentTransactionPage;
