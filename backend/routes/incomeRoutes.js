import express from "express";
import { addIncome, getAllIncome, deleteIncome, downloadIncomeExcel } from "../controllers/incomeController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/add", protect, addIncome);
router.get("/get", protect, getAllIncome);
router.get("/downloadexcel", protect, downloadIncomeExcel);
router.delete("/:id", protect, deleteIncome);

export default router;
