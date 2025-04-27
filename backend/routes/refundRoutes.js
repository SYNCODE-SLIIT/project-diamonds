import express from "express";
import { getAllRefunds, addRefund, updateRefund } from "../controllers/refundController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `refund-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept images and PDFs
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and PDF files are allowed"), false);
    }
  },
});

const router = express.Router();

router.get("/get", protect, getAllRefunds);

// Use multer middleware for file upload
router.post("/add", protect, upload.single("receiptFile"), addRefund);
router.patch("/:id", protect, updateRefund);

export default router;