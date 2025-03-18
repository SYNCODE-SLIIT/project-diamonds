import express from 'express';
const router = express.Router();

import { 
    getApplicationDetailsForAccountCreation, 
    createUserFromApplication, 
    loginUser 
  } from '../controllers/userController.js';
// GET /api/users/create?applicationId=xxx -> Returns fullName and email from the MemberApplication
router.get('/create', getApplicationDetailsForAccountCreation);

// POST /api/users/create -> Creates a new user account based on the application details
router.post('/create', createUserFromApplication);
router.post('/login', loginUser);
export default router;