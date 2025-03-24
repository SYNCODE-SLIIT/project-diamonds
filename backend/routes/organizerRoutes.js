import express from 'express';
const router = express.Router();

import { createOrganizerAccount,
    getOrganizerProfile
 } from '../controllers/organizerController.js';

 import { protect } from '../middleware/authmiddleware.js'; 

// POST /api/organizers/create - Create a new organizer account
router.post('/create', createOrganizerAccount);

// NEW: GET /api/organizers/profile - Retrieve logged-in organizer's profile details
router.get('/profile', protect, getOrganizerProfile);

export default router;