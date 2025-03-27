import express from 'express';
import {
  createContentCreator,
  getAllContentCreators,
  getContentCreatorById,
  updateContentCreator,
  deleteContentCreator,
  getContentCreatorsByStatus
} from '../controllers/ContentcreatorController.js';

const router = express.Router();

// Route to create a new content creator
router.post('/', createContentCreator);

// Route to get all content creators
router.get('/get', getAllContentCreators);

// Route to get a single content creator by ID
router.get('/:id', getContentCreatorById);

// Route to update a content creator
router.put('/:id', updateContentCreator);

// Route to delete a content creator
router.delete('/:id', deleteContentCreator);

// Route to get content creators by status
router.get('/status/:status', getContentCreatorsByStatus);

export default router;