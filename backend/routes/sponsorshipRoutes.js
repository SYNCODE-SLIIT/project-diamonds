import express from 'express';
import {
  createSponsorship,
  getSponsorships,
  updateSponsorship,
  deleteSponsorship
} from '../controllers/sponsorshipController.js';

const router = express.Router();

router.post('/sponsorships', createSponsorship);
router.get('/sponsorships', getSponsorships);
router.put('/sponsorships/:id', updateSponsorship);
router.delete('/sponsorships/:id', deleteSponsorship);

export default router;
