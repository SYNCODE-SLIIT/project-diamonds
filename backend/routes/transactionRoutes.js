import express from "express";
import { 
  addIncome, 
  getAllIncome, 
  deleteIncome, 
  downloadIncomeExcel 
} from "../controllers/incomeController.js";
import { 
  addExpense, 
  getAllExpense, 
  deleteExpense, 
  downloadExpenseExcel 
} from "../controllers/expenseController.js";
import { protect } from "../middleware/authmiddleware.js";
import { downloadAllTransactions } from "../controllers/transactionController.js";

const router = express.Router();

router.get("/downloadall", protect, downloadAllTransactions);

// Income Endpoints
router.get("/income/get", protect, getAllIncome);
router.get("/income/downloadexcel", protect, downloadIncomeExcel);
router.delete("/income/:id", protect, deleteIncome);

// Expense Endpoints
router.get("/expense/get", protect, getAllExpense);
router.get("/expense/downloadexcel", protect, downloadExpenseExcel);
router.delete("/expense/:id", protect, deleteExpense);

export default router;
