import express from 'express';
import * as calendarController from '../controllers/calendarController.js';

const router = express.Router();

// POST /api/calendar/add -> Add an event and assign team members
router.post('/add', calendarController.addEvent);

// GET /api/calendar/events -> Get all events
router.get('/events', calendarController.getAllEvents);

// GET /api/calendar/events/:date -> Get events by a specific date
router.get('/events/:date', calendarController.getEventsByDate);

// DELETE /api/calendar/delete/:id -> Delete an event by ID
router.delete('/delete/:id', calendarController.deleteEvent);

export default router;

