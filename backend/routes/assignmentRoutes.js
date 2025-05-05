import express from 'express';
import {
  assignMembersToEvent,
  getAssignmentsByEvent,
  updateAssignmentStatus,
  getAssignmentRequests,
  updateRequestStatus
} from '../controllers/assignmentController.js';

const router = express.Router();

// Route to assign members to an event
router.post('/assign', assignMembersToEvent);

// Route to get assignments for a specific event
router.get('/:eventID/assignments', getAssignmentsByEvent);

// Route to update the status of an individual member's assignment (e.g., accept/reject)
router.put('/assignments/:assignmentId/member/:memberId/status', updateAssignmentStatus);

// New routes for assignment requests
router.get('/requests', getAssignmentRequests);
router.put('/requests/:requestId/status', updateRequestStatus);

export default router;