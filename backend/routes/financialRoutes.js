import express from 'express';
import { protect } from '../middleware/authmiddleware.js';
import {
  getAllPaymentsWithUserData,
  getAllBudgetsWithUserData,
  getAllInvoicesWithUserData,
  getAllRefundsWithUserData,
  getAllTransactionsWithUserData,
  createBudget,
  requestRefund,
  makePayment,
  getDashboardData,
  generateInvoiceReport,
  generateExcelReport,
  sendPdfByEmail,
  deleteFinancialRecord,
  updateFinancialRecord,
  getAllMembers,
  paySalary,
  getFinancialReport,
  getPaymentStatus,
} from '../controllers/financialController.js';
import upload from '../middleware/uploadmiddleware.js';
import Payment from '../models/Payment.js';

const router = express.Router();

// Protect all endpoints
router.use(protect);

// POST endpoints
router.post('/cb', upload.single('infoFile'), createBudget); // Updated to process file upload for budget
router.post('/ef', upload.single('receiptFile'), requestRefund);
router.post('/mp', upload.single('bankSlip'), makePayment);
router.post('/send-email', sendPdfByEmail);

// GET endpoints
router.get('/getp', getAllPaymentsWithUserData);
router.get('/getb', getAllBudgetsWithUserData);
router.get('/geti', getAllInvoicesWithUserData);
router.get('/getr', getAllRefundsWithUserData);
router.get('/gett', getAllTransactionsWithUserData);
router.get('/dashboard', getDashboardData);
router.get('/invoice-report', generateInvoiceReport);
router.get('/excel-report', generateExcelReport);
router.get('/report', getFinancialReport);
router.get('/getp/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('invoiceId');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    const paymentObj = payment.toObject();
    paymentObj.invoiceNumber = paymentObj.invoiceId?.invoiceNumber || '';
    res.json(paymentObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
});
router.get('/payment-status/:orderId', getPaymentStatus);

// DELETE
router.delete('/:recordType/:id', deleteFinancialRecord);

// PATCH endpoints for update operations
router.patch('/:recordType/:id', updateFinancialRecord);

// Salary endpoints
router.get('/salary/members', getAllMembers);
router.post('/salary/pay', paySalary);

export default router;
