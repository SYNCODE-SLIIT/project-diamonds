import express from 'express';
const router = express.Router();

import { createOrganizerAccount,
    getOrganizerProfile,
    getAllOrganizers,
    getOrganizerById,
    getOrganizerByUserId,
    deleteOrganizer
 } from '../controllers/organizerController.js';

 import { protect } from '../middleware/authmiddleware.js'; 

// POST /api/organizers/create - Create a new organizer account
router.post('/create', createOrganizerAccount);

// GET /api/organizers/profile - Get the logged-in organizer's profile (protected)
router.get('/profile', protect, getOrganizerProfile);

// GET /api/organizers - Get all organizers
router.get('/', getAllOrganizers);

// GET /api/organizers/user/:userId - Get organizer by user ID
router.get('/user/:userId', getOrganizerByUserId);

// GET /api/organizers/:id - Get organizer by ID
router.get('/:id', getOrganizerById);

// DELETE /api/organizers/:id - Delete an organizer
router.delete('/:id', deleteOrganizer);

export default router;