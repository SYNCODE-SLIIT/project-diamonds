
import express from 'express';
import {
    createEventRequest,
  getAllEventRequests,
  getRequestsByOrganizer,
  updateEventRequest,
  deleteEventRequest,
  updateRequestStatus
} from '../controllers/eventRequestController.js';

const router = express.Router();

router.post('/', createEventRequest); // POST /api/event-requests
router.get('/', getAllEventRequests); // GET /api/event-requests?status=pending
router.get('/organizer/:organizerID', getRequestsByOrganizer); // GET by organizer
router.put('/:id', updateEventRequest); // PUT update
router.delete('/:id', deleteEventRequest); // DELETE
router.patch('/:id/status', updateRequestStatus); // PATCH status

export default router;