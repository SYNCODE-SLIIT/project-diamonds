import express from 'express';
import { createCertificate, getAllCertificates, deleteCertificate } from '../controllers/certificateController.js';

const router = express.Router();

router.post('/certificates', createCertificate);
router.get('/certificates', getAllCertificates);
router.delete('/certificates/:id', deleteCertificate);

export default router;
