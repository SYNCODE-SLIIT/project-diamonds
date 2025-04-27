import express from "express";
import { getAllRefunds, addRefund, updateRefund } from "../controllers/refundController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/get", protect, getAllRefunds);

router.post("/add", protect, addRefund);
router.patch("/:id", protect, updateRefund);

export default router;