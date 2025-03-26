import express from 'express';
const router = express.Router();

import { getPendingApplications, getApplicationById, updateApplicationStatus } from '../controllers/memberApplicationController.js';

// Route to list all pending applications
router.get('/', getPendingApplications);

// Route to get details of a specific application
router.get('/:id', getApplicationById);

// Route to update the application status (approve/reject) for admin
router.put('/:id/status', updateApplicationStatus);

export default router;