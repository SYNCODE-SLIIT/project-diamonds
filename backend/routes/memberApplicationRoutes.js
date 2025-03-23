import express from 'express';
const router = express.Router();

import { createApplication, updateApplicationStatus, getApplicationById, updateProfilePicture, upload, updateMemberProfile } from '../controllers/memberApplicationController.js';
import { validateMemberApplication } from '../middleware/validateMemberApplication.js';

// Route to submit a new member application
router.post('/register/member/application', validateMemberApplication, createApplication);

// Route to update profile picture
router.put('/profile-picture', upload.single('profilePicture'), updateProfilePicture);

// Route to update member details (email, contact, availability)
router.put('/update-profile', updateMemberProfile);

// Route to update the application status (for manager to approve/reject)
router.put('/:id/status', updateApplicationStatus);

router.get('/:id', getApplicationById);
export default router;