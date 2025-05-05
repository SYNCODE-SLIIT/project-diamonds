import express from 'express';
import { 
  getPracticeRequests, 
  createPracticeRequest, 
  acceptPracticeRequest, 
  rejectPracticeRequest,
  updatePracticeRequest,
  deletePracticeRequest
} from '../controllers/practiceRequestController.js';

const router = express.Router();

// Get all practice requests
router.get('/requests', getPracticeRequests);

// Create a new practice request
router.post('/requests', createPracticeRequest);

// Update a practice request
router.put('/requests/:id', updatePracticeRequest);

// Delete a practice request
router.delete('/requests/:id', deletePracticeRequest);

// Accept a practice request
router.put('/requests/:id/accept', acceptPracticeRequest);

// Reject a practice request
router.put('/requests/:id/reject', rejectPracticeRequest);

export default router; 