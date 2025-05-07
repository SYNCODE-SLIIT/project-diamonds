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
import { upload, memoryUpload } from '../middleware/uploadmiddleware.js';
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
import { ticketPayment } from '../controllers/financialController.js';

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

router.post('/mp', memoryUpload.single('bankSlip'), async (req, res, next) => {
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

    // Create PDF with smaller margins to fit more content
    const doc = new PDFDocument({ 
      margin: 20, 
      size: 'A4',
      bufferPages: true // Enable page buffering to calculate content height
    });
    
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // --- HEADER ---
    doc.rect(0, 0, doc.page.width, 70).fill('#2c3e50'); // Dark blue header
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 25, 10, { 
          width: 50,
          height: 50
        });
      } else {
        doc.fillColor('#ffffff')
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('TD', 30, 20);
      }
    } catch (logoError) {
      doc.fillColor('#ffffff')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('TD', 30, 20);
    }
    
    doc.fillColor('#ffffff')
       .fontSize(26)
       .font('Helvetica-Bold')
       .text('INVOICE', doc.page.width - 140, 20, { align: 'right' });

    // --- CUSTOMER AND INVOICE INFO ---
    const leftCol = 25;
    const rightCol = 340;
    
    // Left Column - Invoice To
    doc.font('Helvetica-Bold').fillColor('#2c3e50').fontSize(11).text('BILL TO:', leftCol, 90);
    doc.font('Helvetica').fillColor('#333333').fontSize(10)
      .text(invoice.user?.fullName || 'N/A', leftCol, 105)
      .text(invoice.user?.email || 'N/A', leftCol, 120);

    // Right Column - Invoice Details
    doc.font('Helvetica-Bold').fillColor('#2c3e50').fontSize(10)
      .text('INVOICE #:', rightCol, 90)
      .text('DATE:', rightCol, 105)
      .text('ACCOUNT #:', rightCol, 120);
      
    doc.font('Helvetica').fillColor('#333333').fontSize(10)
      .text(invoice.invoiceNumber, rightCol + 70, 90)
      .text(new Date(invoice.createdAt).toLocaleDateString(), rightCol + 70, 105)
      .text(invoice.user?._id?.toString().slice(-6) || 'N/A', rightCol + 70, 120);

    // --- TABLE ---
    const tableTop = 150;
    const tableWidth = doc.page.width - 50;
    
    // Table Header with background
    doc.rect(leftCol, tableTop, tableWidth, 20).fill('#f5f5f5');
    doc.strokeColor('#cccccc').lineWidth(1)
      .rect(leftCol, tableTop, tableWidth, 20)
      .stroke();
    
    // Table Header Text
    doc.fillColor('#2c3e50').fontSize(10).font('Helvetica-Bold');
    doc.text('DESCRIPTION', leftCol + 10, tableTop + 6)
      .text('PRICE', leftCol + 300, tableTop + 6)
      .text('QTY', leftCol + 380, tableTop + 6)
      .text('TOTAL', leftCol + 450, tableTop + 6);
    
    // Table Row
    const rowY = tableTop + 30;
    doc.rect(leftCol, rowY - 10, tableWidth, 25).fillAndStroke('#ffffff', '#cccccc');
    
    doc.font('Helvetica').fillColor('#333333').fontSize(9);
    if (payment && payment.productName) {
      doc.text(payment.productName, leftCol + 10, rowY)
        .text(`RS. ${payment.amount.toLocaleString()}`, leftCol + 300, rowY)
        .text(payment.quantity || '1', leftCol + 380, rowY)
        .text(`RS. ${(payment.amount * (payment.quantity || 1)).toLocaleString()}`, leftCol + 450, rowY);
    } else {
      doc.text(invoice.category || 'Service', leftCol + 10, rowY)
        .text(`RS. ${invoice.amount.toLocaleString()}`, leftCol + 300, rowY)
        .text('1', leftCol + 380, rowY)
        .text(`RS. ${invoice.amount.toLocaleString()}`, leftCol + 450, rowY);
    }

    // --- TOTALS ---
    const totalY = rowY + 40;
    doc.rect(leftCol + 300, totalY, tableWidth - 300, 25).fill('#f5f5f5');
    doc.strokeColor('#cccccc').lineWidth(1)
      .rect(leftCol + 300, totalY, tableWidth - 300, 25)
      .stroke();
      
    doc.font('Helvetica-Bold').fillColor('#2c3e50').fontSize(10)
      .text('TOTAL DUE:', leftCol + 310, totalY + 8)
      .text(`RS. ${invoice.amount.toLocaleString()}`, leftCol + 450, totalY + 8);

    // --- PAYMENT AND CONTACT INFO (Side by side with less height) ---
    const infoY = totalY + 50;
    
    // Add background for payment and contact info
    doc.rect(leftCol, infoY - 5, tableWidth, 80).fillAndStroke('#f9f9f9', '#e0e0e0');
    
    // Left side - Payment info
    doc.font('Helvetica-Bold').fillColor('#2c3e50').fontSize(10)
      .text('Payment Information', leftCol + 10, infoY);
    doc.font('Helvetica').fillColor('#333333').fontSize(9)
      .text('Please make payment within 7 days.', leftCol + 10, infoY + 15)
      .text('Bank transfers and online payments accepted.', leftCol + 10, infoY + 30);
    
    // Right side - Contact info
    doc.font('Helvetica-Bold').fillColor('#2c3e50').fontSize(10)
      .text('Contact Information', rightCol, infoY);
    doc.font('Helvetica').fillColor('#333333').fontSize(9)
      .text('Email: TeamDiamond@gmail.com', rightCol, infoY + 15)
      .text('Phone: +94 23141506', rightCol, infoY + 30)
      .text('Web: www.teamdiamond.com', rightCol, infoY + 45);

    // --- FOOTER ---
    // Calculate the position for footer to ensure it's at the bottom of page 1
    const footerHeight = 30;
    const pageHeight = doc.page.height;
    
    // Add a styled footer at the bottom of the page
    doc.rect(0, pageHeight - footerHeight, doc.page.width, footerHeight)
      .fillColor('#2c3e50')
      .fill();
    
    // Thank you message with style
    doc.fontSize(10)
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .text('Thank you for your business!', doc.page.width / 2, pageHeight - footerHeight + 10, {
        width: doc.page.width - 50,
        align: 'center'
      });

    // Finalize the document
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


router.post('/tp', memoryUpload.single('bankSlip'), async (req, res, next) => {
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
}, ticketPayment);

export default router;
