import express from "express";
import multer from "multer";
import { generateExcelReport, getBudget, getDashboardData, getInvoices, processFullPayment, updateBudget, updateInvoice } from "../controllers/financialController.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/full-payment", upload.single("bankSlip"), processFullPayment);

// New route for Excel report download
router.get("/report", generateExcelReport);

router.get('/', getDashboardData);

router.get('/b', getBudget);
router.patch('b/:id', updateBudget);

router.get('/i', getInvoices);
router.patch('i/:id', updateInvoice);


export default router;
