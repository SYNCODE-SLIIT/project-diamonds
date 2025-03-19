import express from 'express';
const router = express.Router();

import { createApplication, updateApplicationStatus } from '../controllers/memberApplicationController.js';
import { validateMemberApplication } from '../middleware/validateMemberApplication.js';

// Route to submit a new member application
router.post('/register/member/application', validateMemberApplication, createApplication);

// Route to update the application status (for manager to approve/reject)
router.put('/:id/status', updateApplicationStatus);

export default router;