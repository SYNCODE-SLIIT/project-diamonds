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
} from '../controllers/financialController.js';
import upload from '../middleware/uploadmiddleware.js';

const router = express.Router();

// Protect all endpoints
router.use(protect);

// POST endpoints
router.post('/cb', createBudget);
router.post('/ef', requestRefund);
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
router.get("/report", getFinancialReport);


// DELETE
router.delete('/:recordType/:id', deleteFinancialRecord);

// PATCH endpoints for update operations
router.patch('/:recordType/:id', updateFinancialRecord);

// Salary endpoints
router.get('/salary/members', getAllMembers);
router.post('/salary/pay', paySalary);

export default router;
