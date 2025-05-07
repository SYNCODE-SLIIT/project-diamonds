import express from 'express';
import {
  createSponsorship,
  getSponsorships,
  updateSponsorship,
  deleteSponsorship,
  downloadSponsorshipReport
} from '../controllers/sponsorshipController.js';

const router = express.Router();

// Create and fetch sponsorships
router.post('/sponsorships', createSponsorship);
router.get('/sponsorships', getSponsorships);
// Download sponsorships report
router.get('/sponsorships/report', downloadSponsorshipReport);
router.put('/sponsorships/:id', updateSponsorship);
router.delete('/sponsorships/:id', deleteSponsorship);

export default router;
