import express from 'express';
import { getAllPractices, createPractice, getPracticeAssignments, assignMembers, deletePractice, getAllPracticeAssignments } from '../controllers/practiceController.js';

const router = express.Router();

// Get all practices
router.get('/', getAllPractices);

// Create a new practice
router.post('/', createPractice);

// Get all practice assignments
router.get('/assignments', getAllPracticeAssignments);

// Get practice assignments for a specific practice
router.get('/:id/assignments', getPracticeAssignments);

// Assign members to practice
router.post('/assign', assignMembers);

// Delete a practice
router.delete('/:id', deletePractice);

export default router; 