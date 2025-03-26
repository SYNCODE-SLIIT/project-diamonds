import express from 'express';
import {
  getAdditionalServices,
  getAdditionalServiceById,
  createAdditionalService,
  updateAdditionalService,
  deleteAdditionalService
} from '../controllers/additionalServiceController.js';

const router = express.Router();

router.get('/', getAdditionalServices); // http://localhost:4000/api/services/
router.get('/:id', getAdditionalServiceById); // http://localhost:4000/api/services/:id
router.post('/', createAdditionalService); // http://localhost:4000/api/services/
router.put('/:id', updateAdditionalService); // http://localhost:4000/api/services/:id
router.delete('/:id', deleteAdditionalService); // http://localhost:4000/api/services/:id

export default router;