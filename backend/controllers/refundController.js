import Refund from "../models/Refund.js";
import Payment from "../models/Payment.js";
import Expense from "../models/Expense.js";
import cloudinary from "../config/cloudinary.js";
// If you wish to update the Payment record when a refund is requested,
// you could also import Payment from "../models/Payment.js";

export const getAllRefunds = async (req, res) => {
  try {
    // Only fetch refunds created by the current user
    const refunds = await Refund.find({ user: req.user.id }).populate("user");
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

export const addRefund = async (req, res) => {
  try {
    const { refundAmount, reason, paymentId, invoiceNumber } = req.body;
    
    // Validate required fields
    if (!refundAmount || !reason || !invoiceNumber) {
      return res.status(400).json({
        success: false,
        message: "Refund amount, reason, and invoice number are required"
      });
    }

    let payment = null;
    // If paymentId is provided, validate it
    if (paymentId) {
      payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found"
        });
      }

      // Check if refund amount is valid compared to payment amount
      if (refundAmount <= 0 || refundAmount > payment.amount) {
        return res.status(400).json({
          success: false,
          message: "Invalid refund amount"
        });
      }
    }

    // Handle file upload if provided
    let receiptFileUrl = null;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "refunds"
        });
        receiptFileUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading receipt file"
        });
      }
    }

    // Create a new refund request with status "pending"
    const refund = new Refund({
      refundAmount,
      reason,
      paymentId: payment ? payment._id : null,
      user: req.user.id,
      status: "pending",
      receiptFile: receiptFileUrl,
      invoiceNumber
    });

    await refund.save();

    // If payment exists, update its refund status
    if (payment) {
      await Payment.findByIdAndUpdate(paymentId, { 
        refundStatus: "pending",
        refundId: refund._id
      });

      // If this payment is linked to an expense, update the expense as well
      const expense = await Expense.findOne({ paymentId });
      if (expense) {
        await Expense.findByIdAndUpdate(expense._id, {
          refundStatus: "pending",
          refundId: refund._id
        });
      }
    }

    return res.status(201).json({ 
      success: true,
      message: "Refund requested successfully", 
      refund 
    });
  } catch (error) {
    console.error("Error requesting refund:", error);
    return res.status(500).json({
      success: false,
      message: "Error requesting refund",
      error: error.message,
    });
  }
};

export const updateRefund = async (req, res) => {
  try {
    const { status } = req.body;
    const refund = await Refund.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found"
      });
    }

    // Update the corresponding Payment record if it exists
    if (refund.paymentId) {
      await Payment.findByIdAndUpdate(refund.paymentId, { 
        refundStatus: status 
      });
    }

    // Update the corresponding Expense record if it exists
    const expense = await Expense.findOne({ paymentId: refund.paymentId });
    if (expense) {
      await Expense.findByIdAndUpdate(expense._id, {
        refundStatus: status
      });
    }

    return res.status(200).json({ 
      success: true,
      message: "Refund updated successfully", 
      refund 
    });
  } catch (error) {
    console.error("Error updating refund:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating refund",
      error: error.message,
    });
  }
};