import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Refund from '../models/Refund.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Transaction from '../models/Transaction.js';
import xlsx from 'xlsx';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Salary from '../models/Salary.js';
import User from '../models/User.js';

import cloudinary from '../config/cloudinary.js';
import { createFinanceNotification } from './financeNotificationController.js';
import { uploadFile, deleteFile } from '../utils/fileUpload.js';
import { uploadToSupabase, deleteFromSupabase } from '../utils/supabaseUpload.js';


// GET all payments with user data
export const getAllPaymentsWithUserData = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('user')
      .populate('invoiceId');
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payment details",
      error: error.message,
    });
  }
};

// GET all budgets with user data
export const getAllBudgetsWithUserData = async (req, res) => {
  try {
    const budgets = await Budget.find({}).populate('user');
    return res.status(200).json({ success: true, data: budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching budgets",
      error: error.message,
    });
  }
};

// GET all invoices with user data
export const getAllInvoicesWithUserData = async (req, res) => {
  try {
    const invoices = await Invoice.find({}).populate('user');
    return res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching invoices",
      error: error.message,
    });
  }
};

// GET all refunds with user data
export const getAllRefundsWithUserData = async (req, res) => {
  try {
    const refunds = await Refund.find({}).populate('user');
    return res.status(200).json({ success: true, data: refunds });
  } catch (error) {
    console.error("Error fetching refunds:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching refunds",
      error: error.message,
    });
  }
};

// GET all transactions with user data
export const getAllTransactionsWithUserData = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('user')
      .populate('invoiceId');
    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching transactions",
      error: error.message,
    });
  }
};

// Create Budget Request and record transaction.
export const createBudget = async (req, res) => {
  try {
    const { allocatedBudget, remainingBudget, status, reason } = req.body;
    let infoFileUrl = null;
    let fileProvider = null;
    if (req.file) {
      try {
        const uploadResult = await uploadToSupabase(req.file, 'budget_files');
        infoFileUrl = uploadResult.url;
        fileProvider = uploadResult.provider;
        console.log('Supabase upload success (budget):', infoFileUrl);
      } catch (supabaseError) {
        console.warn('Supabase upload failed (budget), falling back to Cloudinary:', supabaseError.message);
        const uploadResult = await uploadFile(req.file, 'budget_files');
        infoFileUrl = uploadResult.url;
        fileProvider = uploadResult.provider;
        console.log('Cloudinary upload success (budget):', infoFileUrl);
      }
    }
    const newBudget = new Budget({
      allocatedBudget,
      remainingBudget,
      status,
      reason,
      infoFile: infoFileUrl,
      fileProvider,
      user: req.user._id,
    });
    await newBudget.save();
    const budgetTransaction = new Transaction({
      transactionType: "budget",
      user: req.user._id,
      totalAmount: allocatedBudget,
      details: { note: "Budget request created" },
    });
    await budgetTransaction.save();
    res.status(201).json({
      message: "Budget created successfully",
      budget: newBudget,
      transaction: budgetTransaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating budget", error: error.message });
  }
};

// Make Payment: auto-create an invoice and record the payment/transaction. 
export const makePayment = async (req, res) => {
  console.log('makePayment controller called');
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { amount, paymentMethod, paymentFor } = req.body;
    let bankSlipFileUrl = null;
    let fileProvider = null;
    if (req.file) {
      try {
        const uploadResult = await uploadToSupabase(req.file, 'bank_slips');
        bankSlipFileUrl = uploadResult.url;
        fileProvider = uploadResult.provider;
        console.log('Supabase upload success (payment):', bankSlipFileUrl);
      } catch (supabaseError) {
        console.warn('Supabase upload failed (payment), falling back to Cloudinary:', supabaseError.message);
        const uploadResult = await uploadFile(req.file, 'bank_slips');
        bankSlipFileUrl = uploadResult.url;
        fileProvider = uploadResult.provider;
        console.log('Cloudinary upload success (payment):', bankSlipFileUrl);
      }
    }
    const user = req.user;
    const invoiceNumber = `INV-${Date.now()}`;
    const invoice = new Invoice({
      invoiceNumber,
      amount,
      category: "payment",
      paymentStatus: "paid",
      user: user._id,
    });
    await invoice.save({ session });
    const payment = new Payment({
      invoiceId: invoice._id,
      user: user._id,
      amount,
      paymentMethod,
      bankSlipFile: bankSlipFileUrl,
      fileProvider,
      status: "pending",
      paymentFor,
      productId: req.body.productId || undefined,
      productName: req.body.productName || undefined,
      quantity: req.body.quantity || undefined,
      orderId: req.body.orderId || undefined,
    });
    await payment.save({ session });
    const paymentTransaction = new Transaction({
      transactionType: "payment",
      invoiceId: invoice._id,
      user: user._id,
      totalAmount: amount,
      details: { note: "Payment processed automatically with invoice creation" },
    });
    await paymentTransaction.save({ session });
    await session.commitTransaction();
    session.endSession();
    const populatedPayment = await Payment.findById(payment._id)
      .populate("user")
      .lean();
    try {
      const manager = await User.findOne({ role: 'financial_manager' });
      if (manager) {
        await createFinanceNotification({
          userId: manager._id,
          message: `A new payment was made by ${user.fullName || user.email}. Invoice #${invoice.invoiceNumber}`,
          type: 'info',
        });
      }
    } catch (notifErr) {
      console.error('Error creating finance notification:', notifErr);
    }
    try {
      await createFinanceNotification({
        userId: user._id,
        message: `Your payment was successful. Invoice #${invoice.invoiceNumber} has been generated. Amount: RS. ${invoice.amount}`,
        type: 'success',
        invoiceId: invoice._id,
      });
    } catch (notifErr) {
      console.error('Error creating user invoice notification:', notifErr);
    }
    res.status(201).json({
      message: "Payment processed successfully",
      invoice,
      payment: populatedPayment,
      transaction: paymentTransaction,
    });
  } catch (error) {
    console.error('Error in makePayment:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error processing payment", error: error.message });
  }
};

// Generate Invoice Report 
export const generateInvoiceReport = async (req, res) => {
  try {
    const payments = await Payment.find({}).populate("user").lean();
    const refunds = await Refund.find({}).populate("user").lean();
    const budgetRequests = await Budget.find({}).populate("user").lean();
    const invoiceData = { payments, refunds, budgetRequests };
    res.status(200).json(invoiceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate Excel Report 
export const generateExcelReport = async (req, res) => {
  try {
    // Gather all analytics data
    const transactions = await Transaction.find({}).populate('user').lean();
    const payments = await Payment.find({}).lean();
    const refunds = await Refund.find({}).lean();
    const income = await Income.find({}).lean();
    const expense = await Expense.find({}).lean();

    // KPIs
    const totalIncome = income.reduce((acc, t) => acc + (t.amount || 0), 0);
    const totalExpense = expense.reduce((acc, t) => acc + (t.amount || 0), 0);
    const netProfit = totalIncome - totalExpense;
    const totalPayments = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalRefunds = refunds.reduce((acc, r) => acc + (r.refundAmount || 0), 0);
    const avgTransaction = transactions.length > 0 ? (transactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0) / transactions.length).toFixed(2) : 0;
    // Top user by spend
    const userSpendMap = {};
    transactions.forEach(tx => {
      if (tx.user && tx.user.fullName) {
        userSpendMap[tx.user.fullName] = (userSpendMap[tx.user.fullName] || 0) + (tx.totalAmount || 0);
      }
    });
    const topUser = Object.keys(userSpendMap).length > 0 ? Object.entries(userSpendMap).reduce((a, b) => a[1] > b[1] ? a : b) : null;
    // Top users table
    const topUsersTable = Object.entries(userSpendMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([user, spend]) => ({ User: user, TotalSpend: spend }));
    // Recent activity
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(tx => ({
        User: tx.user?.fullName || tx.user?.email || 'Unknown',
        Type: tx.transactionType,
        Amount: tx.totalAmount,
        Date: tx.date ? new Date(tx.date).toLocaleString() : ''
      }));

    // Build summary sheet data
    const summaryRows = [
      ['KPI', 'Value'],
      ['Total Income', totalIncome],
      ['Total Expense', totalExpense],
      ['Net Profit', netProfit],
      ['Total Payments', totalPayments],
      ['Total Refunds', totalRefunds],
      ['Avg Transaction', avgTransaction],
      ['Top User', topUser ? `${topUser[0]} (RS.${topUser[1]})` : 'N/A'],
      [],
      ['Recent Activity'],
      ['User', 'Type', 'Amount', 'Date'],
      ...recentTransactions.map(tx => [tx.User, tx.Type, tx.Amount, tx.Date]),
      [],
      ['Top Users'],
      ['User', 'Total Spend'],
      ...topUsersTable.map(u => [u.User, u.TotalSpend])
    ];
    const summarySheet = xlsx.utils.aoa_to_sheet(summaryRows);

    // Transactions sheet (as before)
    const worksheet = xlsx.utils.json_to_sheet(transactions.map(tx => ({
      ...tx,
      user: tx.user?.fullName || tx.user?.email || 'Unknown'
    })));

    // Build workbook
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=Financial_Report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({ error: error.message });
  }
};

// Dashboard Data: returns analytic overview for the financial manager.
export const getDashboardData = async (req, res) => {
  try {
    // Aggregate total income from the Income collection.
    const totalIncomeAgg = await Income.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalIncome = totalIncomeAgg.length > 0 ? totalIncomeAgg[0].total : 0;

    // Aggregate total expense from the Expense collection.
    const totalExpenseAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpense = totalExpenseAgg.length > 0 ? totalExpenseAgg[0].total : 0;
    
    // Retrieve all detailed financial records with populated user data.
    const transactions = await Transaction.find({}).populate("user").lean();
    const refunds = await Refund.find({}).populate("user").lean();
    const payments = await Payment.find({}).populate("user").lean();
    const invoices = await Invoice.find({}).populate("user").lean();
    const budget = await Budget.findOne({}).lean();

    const dailyTrends = await Transaction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sorts the results in ascending order by date.
    ]);
    
    // Return all the aggregated dashboard data including daily trends.
    res.status(200).json({
      totalIncome,
      totalExpense,
      transactions,
      refunds,
      payments,
      invoices,
      budget,
      dailyTrends, // New field: daily trends for transactions.
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a financial record (Payment, Budget, Invoice, Refund, or Transaction)
export const deleteFinancialRecord = async (req, res) => {
  try {
    // Get both recordType and id from URL parameters
    const { recordType, id } = req.params;
    
    let deletedRecord;
    
    // Select the appropriate model based on the record type
    switch (recordType) {
      case 'payment':
        deletedRecord = await Payment.findByIdAndDelete(id);
        break;
      case 'budget':
        deletedRecord = await Budget.findByIdAndDelete(id);
        break;
      case 'invoice':
        deletedRecord = await Invoice.findByIdAndDelete(id);
        break;
      case 'refund':
        deletedRecord = await Refund.findByIdAndDelete(id);
        break;
      case 'transaction':
        deletedRecord = await Transaction.findByIdAndDelete(id);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid record type. Must be one of: payment, budget, invoice, refund, transaction."
        });
    }
    
    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: `No ${recordType} record found with id: ${id}`
      });
    }
    
    // If deleting a payment, optionally delete the associated invoice and transaction
    if (recordType === 'payment' && deletedRecord.invoiceId) {
      await Invoice.findByIdAndDelete(deletedRecord.invoiceId);
      await Transaction.findOneAndDelete({ 
        invoiceId: deletedRecord.invoiceId,
        transactionType: 'payment'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `${recordType} record deleted successfully`,
      data: deletedRecord
    });
    
  } catch (error) {
    console.error(`Error deleting ${req.params.recordType || 'financial'} record:`, error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting record",
      error: error.message
    });
  }
};

//Edit financial record 
export const updateFinancialRecord = async (req, res) => {
  try {
    const { recordType, id } = req.params;
    const updateData = req.body;
    let updatedRecord;

    if (recordType === 'p') { // Payment
      const payment = await Payment.findById(id).populate('invoiceId');
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: `No payment record found with id: ${id}`
        });
      }
      const previousStatus = payment.status;
      updatedRecord = await Payment.findByIdAndUpdate(id, updateData, { new: true });

      // If the status has changed and is now "approved."
      if (updateData.status === 'approved' && previousStatus !== 'approved') {
        const expenseExists = await Expense.findOne({ paymentId: id });
        if (!expenseExists) {
          const expenseCategory =
            payment.paymentFor === 'merchandise'
              ? 'Merchandise Payment'
              : payment.paymentFor === 'package'
                ? 'Package Payment'
                : 'Other Payment';
          const expense = new Expense({
            userId: payment.user,
            icon: payment.bankSlipFile || "default_payment_icon_url",
            category: expenseCategory,
            amount: payment.amount,
            date: new Date(),
            paymentId: payment._id   // Linking the expense record to this payment
          });
          await expense.save();
        }
        // Send notification to the user about approval
        await createFinanceNotification({
          userId: payment.user,
          message: `Your payment of RS. ${payment.amount}${payment.invoiceId ? ` for invoice ${payment.invoiceId.invoiceNumber}` : ''} has been approved.`,
          type: 'success',
          invoiceId: payment.invoiceId?._id,
          paymentId: payment._id
        });
      } else if (updateData.status === 'rejected' && previousStatus !== 'rejected') {
        // Send notification to the user about rejection
        await createFinanceNotification({
          userId: payment.user,
          message: `Your payment of RS. ${payment.amount}${payment.invoiceId ? ` for invoice ${payment.invoiceId.invoiceNumber}` : ''} has been rejected.`,
          type: 'error',
          invoiceId: payment.invoiceId?._id,
          paymentId: payment._id
        });
      } else if (updateData.status !== 'approved' && previousStatus === 'approved') {
        // Remove the expense record if the payment is no longer approved.
        await Expense.deleteOne({ paymentId: id });
      }
    } else if (recordType === 'r') { // Refund
      const refund = await Refund.findById(id);
      if (!refund) {
        return res.status(404).json({
          success: false,
          message: `No refund record found with id: ${id}`
        });
      }
      const previousStatus = refund.status;
      updatedRecord = await Refund.findByIdAndUpdate(id, updateData, { new: true });
      // Notify user if refund is approved or rejected
      if (updateData.status === 'approved' && previousStatus !== 'approved') {
        await createFinanceNotification({
          userId: refund.user,
          message: `Your refund request of RS. ${refund.refundAmount}${refund.invoiceNumber ? ` for invoice ${refund.invoiceNumber}` : ''} has been approved.`,
          type: 'success',
          refundId: refund._id
        });
      } else if (updateData.status === 'rejected' && previousStatus !== 'rejected') {
        await createFinanceNotification({
          userId: refund.user,
          message: `Your refund request of RS. ${refund.refundAmount}${refund.invoiceNumber ? ` for invoice ${refund.invoiceNumber}` : ''} has been rejected.`,
          type: 'error',
          refundId: refund._id
        });
      }
    } else if (recordType === 'b') { // Budget
      const budget = await Budget.findById(id);
      if (!budget) {
        return res.status(404).json({
          success: false,
          message: `No budget record found with id: ${id}`
        });
      }
      updatedRecord = await Budget.findByIdAndUpdate(
        id, 
        { ...updateData, lastUpdated: new Date() }, 
        { new: true }
      );
    } else if (recordType === 'i') { // Invoice
      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: `No invoice record found with id: ${id}`
        });
      }
      updatedRecord = await Invoice.findByIdAndUpdate(id, { paymentStatus: updateData.paymentStatus }, { new: true });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid record type. Must be one of: p, b, i, r, t."
      });
    }
    return res.status(200).json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error("Error updating record:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating record",
      error: error.message
    });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).lean();
    return res.status(200).json({ success: true, data: members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching members",
      error: error.message,
    });
  }
};

export const paySalary = async (req, res) => {
  try {
    const { memberId, salaryAmount, incomeType, note } = req.body;
    if (!memberId || !salaryAmount) {
      return res.status(400).json({ success: false, message: "memberId and salaryAmount are required." });
    }
    
    // Find the member by id
    const member = await User.findById(memberId).lean();
    if (!member || member.role !== 'member') {
      return res.status(404).json({ success: false, message: "Member not found." });
    }
    
    // Create a Salary record for the member
    const salaryRecord = await Salary.create({
      userId: member._id,
      fullName: member.fullName,
      email: member.email,
      salaryAmount,
    });
    
    // Create an Income record with the specified icon, source, and note/description
    const incomeRecord = await Income.create({
      userId: member._id,
      icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f483.png",
      source: incomeType || "Team Diamond Salary",
      amount: salaryAmount,
      description: note || undefined,
    });
    
    return res.status(200).json({
      success: true,
      message: "Salary paid successfully",
      data: { salaryRecord, incomeRecord },
    });
  } catch (error) {
    console.error("Error paying salary:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while paying salary",
      error: error.message,
    });
  }
};

export const getFinancialReport = async (req, res) => {
  try {
    const { range } = req.query; // expected values: daily, monthly, quarterly
    const now = new Date();
    let filteredTransactions = dummyTransactions;

    // Filter transactions based on the selected range.
    if (range === "daily") {
      filteredTransactions = dummyTransactions.filter((tx) =>
        moment(tx.date).isSame(now, "day")
      );
    } else if (range === "monthly") {
      filteredTransactions = dummyTransactions.filter((tx) =>
        moment(tx.date).isSame(now, "month")
      );
    } else if (range === "quarterly") {
      filteredTransactions = dummyTransactions.filter((tx) =>
        moment(tx.date).isSame(now, "quarter")
      );
    }

    // Calculate total revenue
    const totalRevenue = filteredTransactions.reduce(
      (acc, cur) => acc + cur.totalAmount,
      0
    );

    // Format transactions for the frontend (e.g., you can convert the date to ISO string or a formatted version)
    const transactionsFormatted = filteredTransactions.map((tx) => ({
      date: moment(tx.date).format("YYYY-MM-DD"),
      totalAmount: tx.totalAmount,
    }));

    return res.status(200).json({
      success: true,
      totalRevenue,
      transactions: transactionsFormatted,
    });
  } catch (error) {
    console.error("Error in getFinancialReport:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Internal Server Error" });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) {
      return res.status(404).json({ status: 'Not found' });
    }
    res.json({ status: payment.status });
  } catch (error) {
    res.status(500).json({ status: 'Error', error: error.message });
  }
};

// Create Refund Request and record transaction.
export const requestRefund = async (req, res) => {
  try {
    const { refundAmount, reason, invoiceNumber } = req.body;
    let receiptFileUrl = null;
    let fileProvider = null;
    if (req.file) {
      try {
        const uploadResult = await uploadToSupabase(req.file, 'refund_receipts');
        receiptFileUrl = uploadResult.url;
        fileProvider = uploadResult.provider;
        console.log('Supabase upload success (refund):', receiptFileUrl);
      } catch (supabaseError) {
        console.warn('Supabase upload failed (refund), falling back to Cloudinary:', supabaseError.message);
        const uploadResult = await uploadFile(req.file, 'refund_receipts');
        receiptFileUrl = uploadResult.url;
        fileProvider = uploadResult.provider;
        console.log('Cloudinary upload success (refund):', receiptFileUrl);
      }
    }
    const refund = new Refund({
      refundAmount,
      reason,
      invoiceNumber,
      receiptFile: receiptFileUrl,
      fileProvider,
      user: req.user._id,
    });
    await refund.save();
    const refundTransaction = new Transaction({
      transactionType: "refund",
      user: req.user._id,
      totalAmount: refundAmount,
      details: { note: "Refund requested" },
    });
    await refundTransaction.save();
    res.status(201).json({
      message: "Refund requested successfully",
      refund,
      transaction: refundTransaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error requesting refund",
      error: error.message,
    });
  }
};

// ANOMALY DETECTION: Get anomalous transactions using multiple detection methods
export const getAnomalies = async (req, res) => {
  try {
    // Fetch all transactions with user data
    const transactions = await Transaction.find({})
      .populate('user')
      .populate('invoiceId')
      .sort({ date: -1 }); // Sort by date descending

    if (!transactions.length) {
      return res.status(200).json({ success: true, anomalies: [] });
    }

    const anomalies = [];
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // 1. Amount-based anomalies (Z-score)
    const amounts = transactions.map(t => t.totalAmount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const std = Math.sqrt(amounts.map(a => Math.pow(a - mean, 2)).reduce((a, b) => a + b, 0) / amounts.length);
    const threshold = 2.5;

    // 2. Frequency-based anomalies
    const userTransactionCounts = {};
    transactions.forEach(t => {
      const userId = t.user?._id?.toString();
      if (userId) {
        userTransactionCounts[userId] = (userTransactionCounts[userId] || 0) + 1;
      }
    });

    // 3. Time-based anomalies (transactions outside business hours)
    const isBusinessHour = (date) => {
      const hour = date.getHours();
      return hour >= 9 && hour <= 17; // 9 AM to 5 PM
    };

    // 4. User-based anomalies (unusual activity for specific users)
    const userAverageAmounts = {};
    transactions.forEach(t => {
      const userId = t.user?._id?.toString();
      if (userId) {
        if (!userAverageAmounts[userId]) {
          userAverageAmounts[userId] = { total: 0, count: 0 };
        }
        userAverageAmounts[userId].total += t.totalAmount;
        userAverageAmounts[userId].count += 1;
      }
    });

    // Calculate user averages
    Object.keys(userAverageAmounts).forEach(userId => {
      userAverageAmounts[userId].average = userAverageAmounts[userId].total / userAverageAmounts[userId].count;
    });

    // Process each transaction
    transactions.forEach(transaction => {
      const anomaly = {
        _id: transaction._id,
        user: transaction.user,
        totalAmount: transaction.totalAmount,
        transactionType: transaction.transactionType,
        date: transaction.date,
        details: transaction.details,
        anomalyTypes: [],
        severity: 'medium'
      };

      // Check for amount-based anomaly
      if (std !== 0) {
        const z = (transaction.totalAmount - mean) / std;
        if (Math.abs(z) > threshold) {
          anomaly.anomalyTypes.push('amount');
          anomaly.severity = Math.abs(z) > 3.5 ? 'high' : 'medium';
          anomaly.details = {
            ...anomaly.details,
            note: `Unusual amount: ${z > 0 ? 'significantly higher' : 'significantly lower'} than average`
          };
        }
      }

      // Check for frequency-based anomaly
      const userId = transaction.user?._id?.toString();
      if (userId && userTransactionCounts[userId] > 10) { // More than 10 transactions
        const recentTransactions = transactions.filter(t => 
          t.user?._id?.toString() === userId && 
          new Date(t.date) > oneDayAgo
        );
        if (recentTransactions.length > 5) { // More than 5 transactions in 24 hours
          anomaly.anomalyTypes.push('frequency');
          anomaly.severity = 'high';
          anomaly.details = {
            ...anomaly.details,
            note: `High frequency: ${recentTransactions.length} transactions in 24 hours`
          };
        }
      }

      // Check for time-based anomaly
      if (!isBusinessHour(new Date(transaction.date))) {
        anomaly.anomalyTypes.push('time');
        anomaly.details = {
          ...anomaly.details,
          note: 'Transaction outside business hours'
        };
      }

      // Check for user-based anomaly
      if (userId && userAverageAmounts[userId]) {
        const userAvg = userAverageAmounts[userId].average;
        if (transaction.totalAmount > userAvg * 3) { // 3x user's average
          anomaly.anomalyTypes.push('user');
          anomaly.severity = 'high';
          anomaly.details = {
            ...anomaly.details,
            note: `Amount significantly higher than user's average`
          };
        }
      }

      // Add to anomalies if any type detected
      if (anomaly.anomalyTypes.length > 0) {
        anomalies.push(anomaly);
      }
    });

    // Sort anomalies by severity and date
    anomalies.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.date) - new Date(a.date);
    });

    return res.status(200).json({ 
      success: true, 
      anomalies,
      stats: {
        totalTransactions: transactions.length,
        anomalyCount: anomalies.length,
        anomalyPercentage: (anomalies.length / transactions.length * 100).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error detecting anomalies', 
      error: error.message 
    });
  }
};
 