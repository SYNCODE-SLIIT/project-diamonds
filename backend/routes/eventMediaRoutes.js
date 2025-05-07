// routes/eventMediaRoutes.js
import express from 'express';
import multer from 'multer';
import { uploadEventMedia, getEventMedia } from '../controllers/eventMediaController.js';

const router = express.Router();
const upload = multer({ dest: 'temp/' }); // temp dir for uploads

router.post(
  '/upload',
  upload.fields([
    { name: 'featureImage', maxCount: 1 },
    { name: 'poster', maxCount: 1 },
    { name: 'eventImages', maxCount: 10 },
    { name: 'eventVideos', maxCount: 5 }
  ]),
  uploadEventMedia
);

router.get('/:eventId', getEventMedia);

export default router;