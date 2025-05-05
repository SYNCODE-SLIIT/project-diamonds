import express from 'express';
import { assignMemberToEvent } from '../controllers/eventController.js';
import { createPracticeSession, assignMemberToPracticeSession } from '../controllers/practiceSessionController.js';
import Member from '../models/MemberApplication.js'; // Update with correct path/model name

const router = express.Router();

// Admin endpoint to assign member to an event
router.post('/events/assign', assignMemberToEvent);

// Admin endpoint to create a practice session
router.post('/practice-sessions/create', createPracticeSession);

// Admin endpoint to assign member to a practice session
router.post('/practice-sessions/assign', assignMemberToPracticeSession);

// Additional routes (e.g., fetching events & sessions for calendar view) can be added:
router.get('/events', async (req, res) => {
  try {
    const events = await (await import('../models/Event.js')).default.find({});
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
});

router.get('/practice-sessions', async (req, res) => {
  try {
    const sessions = await (await import('../models/PracticeSession.js')).default.find({});
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching practice sessions', error });
  }
});

// Get all approved members
router.get('/members/approved', async (req, res) => {
  try {
    const approvedMembers = await Member.find({ status: 'approved' }); // or whatever your approval logic is
    res.json(approvedMembers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
