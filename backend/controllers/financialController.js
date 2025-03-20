// controllers/financialController.js
import Budget from '../models/Budget.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Refund from '../models/Refund.js';
import Transaction from '../models/Transaction.js';

// 1. Generate Invoice
export const generateInvoice = async (req, res) => {
  try {
    const { invoiceNumber, amount, category } = req.body;
    // Optionally calculate fees/taxes here
    const invoice = await Invoice.create({ invoiceNumber, amount, category });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Process Payment
export const processPayment = async (req, res) => {
  try {
    const { invoiceId, userId, amount, paymentMethod } = req.body;
    const payment = await Payment.create({
      invoiceId,
      userId,
      amount,
      paymentMethod,
      status: 'authorized'
    });
    // Optionally update invoice paymentStatus here.
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Record Transaction
export const recordTransaction = async (req, res) => {
  try {
    const { transactionType, invoiceId, bookingId, userId, totalAmount, details } = req.body;
    const transaction = await Transaction.create({
      transactionType,
      invoiceId,
      bookingId,
      userId,
      totalAmount,
      details
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Update Budget
export const updateBudget = async (req, res) => {
  try {
    const { allocatedBudget, currentSpend } = req.body;
    const remainingBudget = allocatedBudget - currentSpend;
    const budget = await Budget.findOneAndUpdate(
      {},
      { allocatedBudget, currentSpend, remainingBudget, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Process Refund
export const processRefund = async (req, res) => {
  try {
    const { refundAmount, reason, transactionId } = req.body;
    const refund = await Refund.create({
      refundAmount,
      reason,
      transactionId,
      status: 'approved'
    });
    res.status(201).json(refund);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Generate Financial Report
export const generateFinancialReport = async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    const totalRevenue = transactions.reduce(
      (sum, t) => t.transactionType === 'payment' ? sum + t.totalAmount : sum,
      0
    );
    res.status(200).json({ totalRevenue, transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
