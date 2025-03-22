// controllers/transactionController.js
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import xlsx from "xlsx";

export const downloadAllTransactions = async (req, res) => {
  const userId = req.user.id;
  try {
    // Fetch income and expense data for the logged-in user
    const income = await Income.find({ userId }).sort({ date: -1 });
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    // Debug logs to verify data counts
    console.log("Income transactions count:", income.length);
    console.log("Expense transactions count:", expense.length);

    // Prepare Income data
    const incomeData = income.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: new Date(item.date).toLocaleDateString(),
    }));

    // Prepare Expense data
    const expenseData = expense.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: new Date(item.date).toLocaleDateString(),
    }));

    // Create a new workbook and add two worksheets — one for income and one for expense
    const wb = xlsx.utils.book_new();
    const incomeSheet = xlsx.utils.json_to_sheet(incomeData);
    const expenseSheet = xlsx.utils.json_to_sheet(expenseData);
    xlsx.utils.book_append_sheet(wb, incomeSheet, "Income");
    xlsx.utils.book_append_sheet(wb, expenseSheet, "Expense");

    // Write workbook to a buffer
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    // Set headers to trigger file download in the client
    res.setHeader("Content-Disposition", "attachment; filename=Transactions.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    // Send the buffer as a response
    res.send(buffer);
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
