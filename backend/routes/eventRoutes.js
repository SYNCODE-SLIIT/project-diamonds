// eventRoutes.js
import express from 'express';
import EventRequest from '../models/EventRequest.js';

const router = express.Router();

// Route to get approved events
router.get('/approved', async (req, res) => {
  try {
    // Fetch events with the status 'approved'
    const approvedEvents = await EventRequest.find({ status: 'approved' });
    res.status(200).json(approvedEvents); // Return approved events as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching approved events', error: error.message });
  }
  
});


export default router;