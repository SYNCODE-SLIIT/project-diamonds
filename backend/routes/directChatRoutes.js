// backend/routes/directChatRoutes.js
import express from 'express';
import {
  startDirectChat,
  sendDirectMessage,
  getDirectMessages,
  markAllDMsRead,
  getThreadsForUser
} from '../controllers/directChatController.js';
import { protect } from '../middleware/authmiddleware.js';  // same one you use now

const router = express.Router();

router.use(protect);                 // all endpoints below require a valid JWT

router.post('/start',        startDirectChat);
router.get ('/user/:userId', getThreadsForUser);

router.post('/:threadId/messages',  sendDirectMessage);
router.get ('/:threadId/messages',  getDirectMessages);
router.put ('/:threadId/read-all',  markAllDMsRead);

export default router;