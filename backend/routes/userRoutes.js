import express from 'express';
const router = express.Router();

import { 
    getApplicationDetailsForAccountCreation, 
    createUserFromApplication, 
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    getAllUsers,
    updatePassword,
    checkEmail
  } from '../controllers/userController.js';
// GET /api/users/create?applicationId=xxx -> Returns fullName and email from the MemberApplication
router.get('/create', getApplicationDetailsForAccountCreation);

// POST /api/users/create -> Creates a new user account based on the application details
router.post('/create', createUserFromApplication);
router.post('/login', loginUser);

// Route to get the profile of the authenticated user
router.get('/profile', getUserProfile);

// Route to update the profile of the authenticated user
router.put('/profile', updateUserProfile);

// Route to delete the authenticated user's account
router.delete('/profile', deleteUser);

// Route to get a list of all users (admin access recommended)
router.get('/', getAllUsers);

// Route to update the user's password
router.put('/password', updatePassword);

router.get('/check-email', checkEmail);

export default router;