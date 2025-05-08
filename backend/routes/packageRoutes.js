import express from 'express';
import multer from 'multer';
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
} from '../controllers/packageController.js';

const router = express.Router();

// Define multer storage in the routes file
const upload = multer({ storage: multer.memoryStorage() });

// Apply multer for POST and PUT routes
router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.post('/', upload.single('image'), createPackage);
router.put('/:id', upload.single('image'), updatePackage);
router.delete('/:id', deletePackage);

export default router;