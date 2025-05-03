import express from 'express';
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
  deleteFinancialRecord,
  updateFinancialRecord,
  getAllMembers,
  paySalary,
  getFinancialReport,
  getPaymentStatus,
  getAnomalies,
} from '../controllers/financialController.js';
import { upload } from '../middleware/uploadmiddleware.js';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import PDFDocument from 'pdfkit';
import { protect } from '../middleware/authMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Transaction from '../models/Transaction.js';
import { uploadToSupabase } from '../utils/supabaseUpload.js';
import { uploadFile } from '../utils/fileUpload.js';

const router = express.Router();

// Protect all endpoints
router.use(protect);

// POST endpoints with Supabase and Cloudinary fallback
router.post('/cb', upload.single('infoFile'), async (req, res, next) => {
  try {
    if (req.file) {
      try {
        const uploadResult = await uploadToSupabase(req.file, 'budget_files');
        req.fileUrl = uploadResult.url;
        req.fileProvider = uploadResult.provider;
      } catch (supabaseError) {
        console.warn('Supabase upload failed, falling back to Cloudinary:', supabaseError.message);
        const uploadResult = await uploadFile(req.file, 'budget_files');
        req.fileUrl = uploadResult.url;
        req.fileProvider = uploadResult.provider;
      }
    }
    next();
  } catch (error) {
    console.error('Budget file upload error:', error);
    return res.status(500).json({ message: 'File upload failed', error: error.message });
  }
}, createBudget);

router.post('/ef', upload.single('receiptFile'), async (req, res, next) => {
  try {
    if (req.file) {
      try {
        const uploadResult = await uploadToSupabase(req.file, 'refund_receipts');
        req.fileUrl = uploadResult.url;
        req.fileProvider = uploadResult.provider;
      } catch (supabaseError) {
        console.warn('Supabase upload failed, falling back to Cloudinary:', supabaseError.message);
        const uploadResult = await uploadFile(req.file, 'refund_receipts');
        req.fileUrl = uploadResult.url;
        req.fileProvider = uploadResult.provider;
      }
    }
    next();
  } catch (error) {
    console.error('Refund receipt upload error:', error);
    return res.status(500).json({ message: 'File upload failed', error: error.message });
  }
}, requestRefund);

router.post('/mp', upload.single('bankSlip'), async (req, res, next) => {
  try {
    if (req.file) {
      try {
        const uploadResult = await uploadToSupabase(req.file, 'bank_slips');
        req.fileUrl = uploadResult.url;
        req.fileProvider = uploadResult.provider;
      } catch (supabaseError) {
        console.warn('Supabase upload failed, falling back to Cloudinary:', supabaseError.message);
        const uploadResult = await uploadFile(req.file, 'bank_slips');
        req.fileUrl = uploadResult.url;
        req.fileProvider = uploadResult.provider;
      }
    }
    next();
  } catch (error) {
    console.error('Bank slip upload error:', error);
    return res.status(500).json({ message: 'File upload failed', error: error.message });
  }
}, makePayment);

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
router.get('/anomalies', getAnomalies);
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

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the logo file
const logoPath = path.join(__dirname, '../../frontend/src/assets/logos/logo.jpeg');

// Download invoice by ID
router.get('/invoice/:invoiceId/download', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId).populate('user');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Fetch payment details for this invoice
    const payment = await Payment.findOne({ invoiceId: invoice._id });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // --- HEADER BAR ---
    doc.rect(0, 0, doc.page.width, 70).fill('#FFD700'); // Gold color for header
    
    // Add logo from assets file
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 10, { 
          width: 50,
          height: 50
        });
      } else {
        // Fallback to text logo if file doesn't exist
        doc.fillColor('#000000')
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('TD', 50, 20, { width: 50, align: 'center' });
      }
    } catch (logoError) {
      console.error('Error adding logo:', logoError);
      // Fallback to text logo if there's an error
      doc.fillColor('#000000')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('TD', 50, 20, { width: 50, align: 'center' });
    }
    
    doc.fillColor('#000000')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('INVOICE', 130, 25, { align: 'left' });
    doc.fillColor('black');

    // --- INVOICE TO & DETAILS ---
    doc.moveDown(1.5);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#FFD700').text('INVOICE TO:', 50, 90);
    doc.font('Helvetica').fillColor('black').text(invoice.user?.fullName || 'N/A', 50, 105);
    doc.text(invoice.user?.email || '', 50, 120);
    // Add more user info if available

    doc.font('Helvetica-Bold').fillColor('#FFD700').text('Invoice No:', 350, 90, { continued: true }).font('Helvetica').fillColor('black').text(invoice.invoiceNumber);
    doc.font('Helvetica-Bold').fillColor('#FFD700').text('Invoice Date:', 350, 105, { continued: true }).font('Helvetica').fillColor('black').text(invoice.createdAt.toLocaleDateString());
    doc.font('Helvetica-Bold').fillColor('#FFD700').text('Account No:', 350, 120, { continued: true }).font('Helvetica').fillColor('black').text(invoice.user?._id?.toString().slice(-6) || '');

    // --- SIDEBAR (Payment Method & Terms) ---
    doc.roundedRect(40, 150, 180, 80, 8).fillOpacity(0.08).fill('#FFD700').fillOpacity(1);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFD700').text('PAYMENT METHOD', 50, 160);
    doc.font('Helvetica').fillColor('black').text(payment?.paymentMethod || 'N/A', 50, 175);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fillColor('#FFD700').text('TERMS & CONDITIONS', 50, 195);
    doc.font('Helvetica').fillColor('black').fontSize(9).text('Payment is due upon receipt. Please contact us if you have any questions about this invoice.', 50, 210, { width: 160 });

    // --- PRODUCT TABLE ---
    const tableTop = 250;
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFD700');
    doc.text('PRODUCT', 250, tableTop);
    doc.text('PRICE', 370, tableTop);
    doc.text('QTY', 440, tableTop);
    doc.text('TOTAL', 500, tableTop);
    doc.moveTo(250, tableTop + 18).lineTo(doc.page.width - 40, tableTop + 18).stroke('#FFD700');
    doc.font('Helvetica').fontSize(11).fillColor('black');
    let rowY = tableTop + 28;
    // If payment has productName/quantity, show as line item, else show generic
    if (payment && payment.productName) {
      doc.text(payment.productName, 250, rowY);
      doc.text(`RS. ${payment.amount}`, 370, rowY);
      doc.text(payment.quantity ? payment.quantity.toString() : '1', 440, rowY);
      doc.text(`RS. ${payment.amount * (payment.quantity || 1)}`, 500, rowY);
      rowY += 20;
    } else {
      doc.text(invoice.category, 250, rowY);
      doc.text(`RS. ${invoice.amount}`, 370, rowY);
      doc.text('1', 440, rowY);
      doc.text(`RS. ${invoice.amount}`, 500, rowY);
      rowY += 20;
    }
    // Add more rows if needed
    doc.moveTo(250, rowY).lineTo(doc.page.width - 40, rowY).stroke('#FFD700');

    // --- TOTALS ---
    doc.font('Helvetica-Bold').fillColor('#FFD700').text('SUB TOTAL', 370, rowY + 15, { continued: true }).font('Helvetica').fillColor('black').text(`RS. ${invoice.amount}`, 470, rowY + 15);
    doc.font('Helvetica-Bold').fillColor('#FFD700').text('TAX', 370, rowY + 30, { continued: true }).font('Helvetica').fillColor('black').text('RS. 0.00', 470, rowY + 30);
    doc.font('Helvetica-Bold').fillColor('#FFD700').text('TOTAL', 370, rowY + 45, { continued: true }).font('Helvetica').fillColor('black').text(`RS. ${invoice.amount}`, 470, rowY + 45);

    // --- FOOTER ---
    doc.fontSize(10).fillColor('gray').text('Thank you for your business!', 40, doc.page.height - 60, { align: 'center' });
    doc.fontSize(10).fillColor('gray').text('Team Diamond | +123 456 7890 | studio@company.com | www.company.com', 40, doc.page.height - 45, { align: 'center' });
    doc.fontSize(10).fillColor('gray').text('General Manager', 470, doc.page.height - 30);
    doc.moveTo(470, doc.page.height - 40).lineTo(560, doc.page.height - 40).stroke('#FFD700');

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Error downloading invoice', error: error.message });
  }
});

// GET transaction details with documents
router.get('/transaction/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user')
      .populate('invoiceId');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Get associated payment if exists
    const payment = await Payment.findOne({ invoiceId: transaction.invoiceId })
      .populate('user')
      .lean();

    // Get associated documents
    const documents = [];
    if (payment?.bankSlipFile) {
      documents.push({
        type: 'Bank Slip',
        url: payment.bankSlipFile,
        uploadDate: payment.createdAt
      });
    }

    // Combine all data
    const transactionDetails = {
      ...transaction.toObject(),
      payment: payment || null,
      documents: documents
    };

    res.json(transactionDetails);
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({ message: 'Error fetching transaction details', error: error.message });
  }
});

// DELETE
router.delete('/:recordType/:id', deleteFinancialRecord);

// PATCH endpoints for update operations
router.patch('/:recordType/:id', updateFinancialRecord);

// Salary endpoints
router.get('/salary/members', getAllMembers);
router.post('/salary/pay', paySalary);

// Resolve anomaly
router.post('/anomalies/:id/resolve', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update the transaction with resolved status
    transaction.anomalyStatus = 'resolved';
    await transaction.save();

    res.json({ 
      success: true, 
      message: 'Anomaly resolved successfully',
      transaction 
    });
  } catch (error) {
    console.error('Error resolving anomaly:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resolving anomaly', 
      error: error.message 
    });
  }
});

export default router;
