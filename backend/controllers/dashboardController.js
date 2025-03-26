import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import { isValidObjectId, Types } from "mongoose";

// Dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    // Create an ObjectId from userId for use in aggregations
    const userObjectId = new Types.ObjectId(String(userId));

    // Fetch total income using aggregation
    const totalIncome = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    console.log("totalIncome", {
      totalIncome,
      isValidId: isValidObjectId(userId),
    });

    // Fetch total expense using aggregation
    const totalExpense = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Calculate date boundaries
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get income transactions in the last 60 days
    const last60DaysIncomeTransactions = await Income.find({
      userId,
      date: { $gte: sixtyDaysAgo }
    }).sort({ date: -1 });

    // Get total income for last 60 days
    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Get expense transactions in the last 30 days
    const last30DaysExpenseTransactions = await Expense.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    // Get total expenses for last 30 days
    const expensesLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Fetch the last 5 transactions for both income and expense
    const recentIncome = (await Income.find({ userId })
      .sort({ date: -1 })
      .limit(5)).map((txn) => ({
        ...txn.toObject(),
        type: "income",
      }));

    const recentExpense = (await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(5)).map((txn) => ({
        ...txn.toObject(),
        type: "expense",
      }));

    // Combine and sort both transactions by date (latest first)
    const lastTransactions = [...recentIncome, ...recentExpense].sort(
      (a, b) => b.date - a.date
    );

    // Final Response
    res.json({
      totalBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpense[0]?.total || 0,
      last30DaysExpenses: {
        total: expensesLast30Days,
        transactions: last30DaysExpenseTransactions,
      },
      last60DaysIncome: {
        total: incomeLast60Days,
        transactions: last60DaysIncomeTransactions,
      },
      recentTransactions: lastTransactions,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
