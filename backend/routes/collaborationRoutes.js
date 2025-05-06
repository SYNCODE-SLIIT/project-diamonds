// routes/collaborationRoutes.js
import express from 'express';
import {
    addCollaborator,
  getCollaborators,
  updateCollaborator,
  deleteCollaborator,
} from '../controllers/collaborationController.js';

const router = express.Router();

router.post('/add-collaborator', addCollaborator);
router.get('/collaborators', getCollaborators);
router.put('/collaborators/:id', updateCollaborator);
router.delete('/collaborators/:id', deleteCollaborator);

export default router;
