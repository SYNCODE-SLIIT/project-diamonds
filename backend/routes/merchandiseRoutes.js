import express from 'express';
import {
  getAllMerchandise,
  getMerchandiseById,
  createMerchandise,
  updateMerchandise,
  deleteMerchandise
} from '../controllers/merchandiseController.js';

import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
const memoryUpload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Public routes
router.get('/', getAllMerchandise);
router.get('/:id', getMerchandiseById);

// Admin routes (protected)
router.post('/', protect, memoryUpload.single('image'), createMerchandise);
router.put('/:id', protect, memoryUpload.single('image'), updateMerchandise);
router.delete('/:id', protect, deleteMerchandise);

export default router; 