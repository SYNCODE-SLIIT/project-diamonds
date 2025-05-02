import express from "express";
import { getAllRefunds, addRefund, updateRefund } from "../controllers/refundController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadmiddleware.js";

const router = express.Router();

router.get("/get", protect, getAllRefunds);

// Use centralized upload middleware for file upload
router.post("/add", protect, upload.single("receiptFile"), addRefund);
router.patch("/:id", protect, updateRefund);

export default router;