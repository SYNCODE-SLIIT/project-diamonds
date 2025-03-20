import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Refund from "../models/Refund.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Transaction from "../models/Transaction.js";
import xlsx from "xlsx";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

export const processFullPayment = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const {
      invoiceNumber, invoiceAmount, invoiceCategory, userId, paymentAmount,
      paymentMethod, allocatedBudget, currentSpend, transactionDetails,
    } = req.body;

    const bankSlipPath = req.file ? req.file.path : null;

    // Step 1: Generate Invoice
    const invoice = new Invoice({
      invoiceNumber, amount: invoiceAmount, category: invoiceCategory, paymentStatus: "paid",
    });
    await invoice.save({ session });

    // Step 2: Process Payment
    const payment = new Payment({
      invoiceId: invoice._id, userId, amount: paymentAmount, paymentMethod, bankSlipFile: bankSlipPath, status: "completed",
    });
    await payment.save({ session });

    // Step 3: Record Transaction
    const transaction = new Transaction({
      transactionType: "payment", invoiceId: invoice._id, userId, totalAmount: paymentAmount,
      details: transactionDetails || { note: "Payment processed successfully" },
    });
    await transaction.save({ session });

    // Step 4: Update Budget
    const newCurrentSpend = parseFloat(currentSpend) + parseFloat(paymentAmount);
    const remainingBudget = parseFloat(allocatedBudget) - newCurrentSpend;
    const budget = await Budget.findOneAndUpdate(
      {}, { allocatedBudget, currentSpend: newCurrentSpend, remainingBudget },
      { new: true, upsert: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ invoice, payment, transaction, budget });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};

export const generateExcelReport = async (req, res) => {
  try {
    // Retrieve all transactions (customize your query as needed)
    const transactions = await Transaction.find({}).lean();

    // Create a new workbook and worksheet from transactions data
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(transactions);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Write workbook to a buffer
    const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Financial_Report.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send the buffer as the response
    res.send(excelBuffer);
  } catch (error) {
    console.error("Error generating Excel report:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET aggregated dashboard data (all users)
export const getDashboardData = async (req, res) => {
  try {
    // Aggregate total income from all records
    const incomeAgg = await Income.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalIncome = incomeAgg.length > 0 ? incomeAgg[0].total : 0;

    // Aggregate total expense from all records
    const expenseAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].total : 0;

    // Get all transactions, refunds, invoices, payments and budget
    const transactions = await Transaction.find({}).lean();
    const refunds = await Refund.find({}).lean();
    const budget = await Budget.findOne({}).lean();
    const invoices = await Invoice.find({}).lean();
    const payments = await Payment.find({}).lean();

    // Consolidate all data
    const dashboardData = {
      totalIncome,
      totalExpense,
      transactions,
      refunds,
      budget,
      invoices,
      payments,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({}).lean();
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { allocatedBudget, currentSpend } = req.body;
    // Calculate remaining budget
    const remainingBudget = allocatedBudget - currentSpend;
    const updatedBudget = await Budget.findOneAndUpdate(
      {},
      { allocatedBudget, currentSpend, remainingBudget, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    res.status(200).json(updatedBudget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({}).lean();
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // For example, paymentStatus, amount, etc.
    const updatedInvoice = await Invoice.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).lean();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // e.g., status: "approved"
    const updatedPayment = await Payment.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find({}).lean();
    res.status(200).json(refunds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // e.g., status: "approved", reason updated, etc.
    const updatedRefund = await Refund.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedRefund);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

