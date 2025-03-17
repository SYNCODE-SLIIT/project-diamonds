import express from 'express';
const router = express.Router();

import User from'../models/User.js';
import Organizer  from'../models/Organizer.js';
import MemberApplication  from'../models/MemberApplication.js';

// -------------------------
// Organizer Registration
// -------------------------
router.post('/register/organizer', async (req, res) => {
  try {
    const { fullName, organizationName, email, contactNumber, password } = req.body;
    
    // Create Organizer
    const newOrganizer = new Organizer({
      fullName,
      organizationName,
      email,
      contactNumber,
      passwordHashed: password
    });
    const savedOrganizer = await newOrganizer.save();

    // Create corresponding User record
    const newUser = new User({
      fullName,
      email,
      passwordHashed: password,
      role: 'organizer',
      profileId: savedOrganizer._id,
      profileModel: 'Organizer'
    });
    await newUser.save();

    res.status(201).json({ message: 'Organizer registered successfully', organizer: savedOrganizer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering organizer' });
  }
});

// -------------------------
// Member Application Submission
// -------------------------
// router.post('/register/member/application', async (req, res) => {
//   try {
//     const {
//       fullName, email, contactNumber, age, danceStyle, yearsOfExperience, availability, biography, achievements
//     } = req.body;

//     const newApplication = new MemberApplication({
//       fullName,
//       email,
//       contactNumber,
//       age,
//       danceStyle,
//       yearsOfExperience,
//       availability,
//       biography,
//       achievements,
//       applicationStatus: 'Pending'
//     });

//     const savedApplication = await newApplication.save();
//     res.status(201).json({ message: 'Member application submitted successfully', application: savedApplication });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error submitting member application' });
//   }
// });

// -------------------------
// Member Account Creation (after approval)
// -------------------------
router.post('/register/member/createAccount', async (req, res) => {
  try {
    const { applicationId, password } = req.body;

    // Look up the member application
    const application = await MemberApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.applicationStatus !== 'Approved') {
      return res.status(400).json({ message: 'Application not approved yet' });
    }
    
    // Create User record for member using application data
    const newUser = new User({
      fullName: application.fullName,
      email: application.email,
      passwordHashed: password,
      role: 'member',
      profileId: application._id,
      profileModel: 'MemberApplication'
    });
    const savedUser = await newUser.save();

    res.status(201).json({ message: 'Member account created successfully', user: savedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating member account' });
  }
});

// -------------------------
// Unified Login Endpoint
// -------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.passwordHashed !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // In a real app, generate a JWT token here.
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during login' });
  }
});

export default router;