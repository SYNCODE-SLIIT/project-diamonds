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

import nodemailer from "nodemailer";
import cloudinary from '../config/cloudinary.js';


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

    // If a file is uploaded, upload it to Cloudinary using resource_type "auto"
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "budget_files", // Optional: Organize budget files under a specific folder in Cloudinary
        use_filename: true,     // Optionally keep the original filename
        unique_filename: false, // Optionally disable Cloudinary's automatic renaming
      });
      infoFileUrl = result.secure_url;
    }

    const newBudget = new Budget({
      allocatedBudget,
      remainingBudget,
      status,
      reason,
      infoFile: infoFileUrl, // Save the Cloudinary URL (or null if no file was provided)
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

// Create Refund Request and record transaction.
export const requestRefund = async (req, res) => {
  try {
    const { refundAmount, reason, invoiceNumber } = req.body;
    let receiptFileUrl = null;

    // If a file is uploaded, use Cloudinary to upload it
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "refund_receipts",
        resource_type: "image",      
        use_filename: true,         
        unique_filename: false,     
      });
      receiptFileUrl = uploadResult.secure_url;
    }

    // Create a new Refund document using the Cloudinary file URL (or null if not provided)
    const refund = new Refund({
      refundAmount,
      reason,
      invoiceNumber,
      receiptFile: receiptFileUrl,
      user: req.user._id,
    });
    await refund.save();

    // Record the transaction details for the refund request
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


// Make Payment: auto-create an invoice and record the payment/transaction. 
export const makePayment = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Extract payment details from the request body, including paymentFor
    const { amount, paymentMethod, paymentFor } = req.body;
    let bankSlipFileUrl = null;

    // Upload file if available
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image',
        folder: "bank_slips",
        use_filename: true,
        unique_filename: false,
      });
      bankSlipFileUrl = uploadResult.secure_url;
    }
    
    const user = req.user;
    const invoiceNumber = `INV-${Date.now()}`;

    // Create and save the Invoice document
    const invoice = new Invoice({
      invoiceNumber,
      amount,
      category: "payment",
      paymentStatus: "paid",
      user: user._id,
    });
    await invoice.save({ session });
    
    // Create and save the Payment document, including paymentFor
    const payment = new Payment({
      invoiceId: invoice._id,
      user: user._id,
      amount,
      paymentMethod,
      bankSlipFile: bankSlipFileUrl,
      status: "paid", // Note: status is set to "paid" by default.
      paymentFor, // Captures what the user is paying for.
    });
    await payment.save({ session });
    
    // Create and save the Transaction document for auditing
    const paymentTransaction = new Transaction({
      transactionType: "payment",
      invoiceId: invoice._id,
      user: user._id,
      totalAmount: amount,
      details: { note: "Payment processed automatically with invoice creation" },
    });
    await paymentTransaction.save({ session });
    
    // Do NOT create an Expense record here.
    // Expense record creation should only occur when the payment status is changed to "approved"
    // (for example, in your PATCH update logic).
    
    // Commit the transaction and end the session
    await session.commitTransaction();
    session.endSession();
    
    // Populate payment for response clarity
    const populatedPayment = await Payment.findById(payment._id)
      .populate("user")
      .lean();
    
    res.status(201).json({
      message: "Payment processed successfully",
      invoice,
      payment: populatedPayment,
      transaction: paymentTransaction,
      // No expense record is returned here.
    });
  } catch (error) {
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
    const transactions = await Transaction.find({}).lean();
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(transactions);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=Financial_Report.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(excelBuffer);
  } catch (error) {
    console.error("Error generating Excel report:", error);
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

// Send PDF via Email: expects recordId, pdfData, and email in the request body.
export const sendPdfByEmail = async (req, res) => {
  try {
    const { recordId, pdfData } = req.body;

    // Retrieve the user (and email) from the database using recordId
    const user = await User.findById(recordId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const email = user.email;

    // Set up the NodeMailer transporter (using Gmail as an example)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "neeleee7@gmail.com", // your email
        pass: "12345@Npl",  // your email password or app-specific password
      },
    });

    // Define the mail options, including the PDF attachment
    const mailOptions = {
      from: "neeleee7@gmail.com",
      to: email,
      subject: "Your PDF Document",
      text: "Please find your PDF attached.",
      attachments: [
        {
          filename: "document.pdf",
          content: pdfData,
          encoding: "base64", // adjust if your pdfData is encoded differently
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: `PDF sent successfully to ${email}` });
  } catch (error) {
    res.status(500).json({
      message: "Error sending PDF email",
      error: error.message,
    });
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
      const payment = await Payment.findById(id);
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
      } else if (updateData.status !== 'approved' && previousStatus === 'approved') {
        // Remove the expense record if the payment is no longer approved.
        await Expense.deleteOne({ paymentId: id });
      }
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
    const { memberId, salaryAmount } = req.body;
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
    
    // Create an Income record with the specified icon and source
    const incomeRecord = await Income.create({
      userId: member._id,
      icon: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f483.png",
      source: "Team Diamond Salary",
      amount: salaryAmount,
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
 
