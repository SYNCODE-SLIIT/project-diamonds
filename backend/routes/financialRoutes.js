// routes/financialRoutes.js
import express from 'express';
import { 
  generateFinancialReport, 
  generateInvoice,
  processPayment, 
  processRefund, 
  recordTransaction, 
  updateBudget 
} from '../controllers/financialController.js';

const router = express.Router();

router.post('/invoice', generateInvoice);
router.post('/payment', processPayment);
router.post('/transaction', recordTransaction);
router.put('/budget', updateBudget);
router.post('/refund', processRefund);
router.get('/report', generateFinancialReport);

export default router;
