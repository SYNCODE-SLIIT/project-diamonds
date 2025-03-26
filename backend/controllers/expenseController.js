import User from "../models/User.js";
import Expense from "../models/Expense.js";
import xlsx from "xlsx";

// Add Expense Source
export const addExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, category, amount, date } = req.body;
    
    // Validation: Check for missing fields
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new expense document (renamed from newIncome to newExpense for clarity)
    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date: new Date(date)
    });

    await newExpense.save();
    res.status(200).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Expense Source
export const getAllExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fixed spacing: date: -1 instead of date :- 1
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Expense Source
export const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Download Excel
export const downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    // Prepare data for Excel export (changed "Excet" to "Excel" and format Date)
    const data = expense.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      // Format the date as a readable string. You can use toLocaleDateString()
      Date: item.date.toLocaleDateString()
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expense");
    const fileName = 'Expense_details.xlsx';
    xlsx.writeFile(wb, fileName);
    res.download(fileName);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
