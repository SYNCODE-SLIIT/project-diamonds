import express from "express";
import multer from "multer";
import { generateExcelReport, getBudget, getDashboardData, getInvoices, getPayments, getRefunds, processFullPayment, updateBudget, updateInvoice, updatePayment, updateRefund } from "../controllers/financialController.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/full-payment", upload.single("bankSlip"), processFullPayment);

// New route for Excel report download
router.get("/report", generateExcelReport);

router.get('/', getDashboardData);

router.get('/b', getBudget);
router.patch('/b/:id', updateBudget);

router.get('/i', getInvoices);
router.patch('/i/:id', updateInvoice);

router.get('/p', getPayments);
router.patch('/p/:id', updatePayment);

router.get('/r/', getRefunds);
router.patch('/r/:id', updateRefund);




export default router;
