import express from 'express';
const router = express.Router();

import { createOrganizerAccount } from '../controllers/organizerController.js';

// POST /api/organizers/create - Create a new organizer account
router.post('/create', createOrganizerAccount);

export default router;