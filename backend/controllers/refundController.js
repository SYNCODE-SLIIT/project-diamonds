import Refund from "../models/Refund.js";
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
    const { refundAmount, reason, paymentId } = req.body;
    
    // Create a new refund request with status "pending"
    const refund = new Refund({
      refundAmount,
      reason,
      paymentId,
      user: req.user.id,
      status: "pending",
    });

    await refund.save();

    // Optionally, update the corresponding Payment record to set a refundStatus, e.g.:
    // await Payment.findByIdAndUpdate(paymentId, { refundStatus: "pending" });

    return res.status(201).json({ message: "Refund requested successfully", refund });
  } catch (error) {
    return res.status(500).json({
      message: "Error requesting refund",
      error: error.message,
    });
  }
};

export const updateRefund = async (req, res) => {
  try {
    const { status } = req.body;
    const refund = await Refund.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return res.status(200).json({ message: "Refund updated successfully", refund });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating refund",
      error: error.message,
    });
  }
};