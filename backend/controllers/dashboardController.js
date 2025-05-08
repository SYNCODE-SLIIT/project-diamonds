import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import { isValidObjectId, Types } from "mongoose";
import User from "../models/User.js";
import ChatGroup from "../models/ChatGroup.js";
import MemberApplication from "../models/MemberApplication.js";
import Event from "../models/Event.js";
import EventRequest from "../models/EventRequest.js";

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

// Admin Dashboard Data
export const getAdminDashboardData = async (req, res) => {
  try {
    // Count all users with role 'member'
    const totalMembers = await User.countDocuments({ role: 'member' });

    // Count all member applications currently pending (case-insensitive)
    const pendingApplications = await MemberApplication.countDocuments({ applicationStatus: { $in: ['Pending', 'pending'] } });

    // Count upcoming confirmed events
    const now = new Date();
    const activeEvents = await Event.countDocuments({ status: 'confirmed', eventDate: { $gte: now } });

    // Count pending event requests
    const pendingRequests = await EventRequest.countDocuments({ status: 'pending' });

    // Get financial summaries
    const totalIncome = await Income.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Build recent activity from latest member applications, approved events, and event requests
    // Recent applications
    const recentApps = await MemberApplication.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const appActivities = recentApps.map(app => ({
      id: app._id,
      user: app.fullName,
      type: 'application',
      action: `Application ${app.applicationStatus}`,
      timestamp: app.createdAt,
      status: app.applicationStatus.toLowerCase()
    }));
    // Recent confirmed events
    const recentEvents = await Event.find({ status: 'confirmed' })
      .sort({ approvedAt: -1 })
      .limit(5)
      .lean();
    const eventActivities = recentEvents.map(ev => ({
      id: ev._id,
      user: ev.eventName,
      type: 'event',
      action: `Event '${ev.eventName}' confirmed`,
      timestamp: ev.approvedAt || ev.createdAt,
      status: 'completed'
    }));
    // Recent event requests
    const recentReqs = await EventRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const reqActivities = recentReqs.map(req => ({
      id: req._id,
      user: req.organizerID,
      type: 'event', // treat as event-related
      action: `Request '${req.eventName}' is ${req.status}`,
      timestamp: req.createdAt,
      status: req.status
    }));
    // Merge and sort by timestamp desc, limit 3
    const recentActivity = [...appActivities, ...eventActivities, ...reqActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);

    res.json({
      stats: {
        totalMembers,
        pendingApplications,
        activeEvents,
        pendingRequests,
        totalIncome: totalIncome[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.total || 0,
        unreadMessages: 0
      },
      recentActivity
    });
  } catch (error) {
    console.error("Admin dashboard data error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
