import express from 'express';
import { createCertificate, getAllCertificates } from '../controllers/certificateController.js';

const router = express.Router();

router.post('/certificates', createCertificate);
router.get('/certificates', getAllCertificates);

export default router;
