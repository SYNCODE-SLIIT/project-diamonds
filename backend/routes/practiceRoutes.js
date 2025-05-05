import express from 'express';
import { getAllPractices, createPractice, getPracticeAssignments, assignMembers } from '../controllers/practiceController.js';

const router = express.Router();

// Get all practices
router.get('/', getAllPractices);

// Create a new practice
router.post('/', createPractice);

// Get practice assignments
router.get('/:id/assignments', getPracticeAssignments);

// Assign members to practice
router.post('/assign', assignMembers);

export default router; 