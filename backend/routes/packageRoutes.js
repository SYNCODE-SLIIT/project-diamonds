// routes/packageRoutes.js - API routes for package operations
import express from 'express';
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
} from '../controllers/packageController.js';

const router = express.Router();

// GET all packages
router.get('/', getAllPackages);

// GET single package by ID
router.get('/:id', getPackageById);

// POST create new package
router.post('/', createPackage);

// PUT update package
router.put('/:id', updatePackage);

// DELETE package
router.delete('/:id', deletePackage);

export default router;