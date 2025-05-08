// File: /backend/controllers/memberApplicationController.js

import MemberApplication from '../models/MemberApplication.js';
import emailService from '../services/emailService.js';
import multer from 'multer';
import path from 'path';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import User from '../models/User.js';

// Using memory storage for Cloudinary upload
export const upload = multer({ storage: multer.memoryStorage() });

// GET endpoint: Fetch application details for account creation
export const getApplicationDetailsForAccountCreation = async (req, res) => {
  const { applicationId } = req.query;
  if (!applicationId) {
    return res.status(400).json({ message: "Application ID is required" });
  }
  try {
    const application = await MemberApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    return res.status(200).json({
      fullName: application.fullName,
      email: application.email
    });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving application details", error: error.message });
  }
};

// Helper function to calculate age from birthDate
const calculateAge = (birthDateStr) => {
  const birthDateObj = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

// POST endpoint: Create user account based on the member application.
// Instead of receiving an "age", we now expect a "birthDate" (e.g., "YYYY-MM-DD")
// and automatically calculate the age.
export const createApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      contactNumber,
      birthDate,         // New field for birth date
      danceStyle,
      yearsOfExperience,
      availability,
      biography,
      achievements
    } = req.body;
    
    // Check if an application with the provided email already exists
    const existingApplication = await MemberApplication.findOne({ email });
    if(existingApplication) {
      return res.status(400).json({ message: "An application with that email already exists" });
    }
    
    // Calculate age from birthDate
    const computedAge = calculateAge(birthDate);
    
    const newApplication = new MemberApplication({
      fullName,
      email,
      contactNumber,
      birthDate,            // store the birth date
      age: computedAge,     // computed age from birthDate
      danceStyle,
      yearsOfExperience,
      availability,
      biography,
      achievements,
      applicationStatus: 'Pending'
    });
    
    const savedApplication = await newApplication.save();
    res.status(201).json({ message: 'Member application submitted successfully', application: savedApplication });
  } catch (error) {
    console.error('Error creating member application:', error);
    res.status(500).json({ message: 'Error submitting member application' });
  }
};

// Update application status (approve or reject) and send email notifications
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "Approved" or "Rejected".' });
    }

    const application = await MemberApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.applicationStatus = status;
    application.updatedAt = new Date();
    const updatedApplication = await application.save();

    // Send an email notification based on the new status
    if (status === 'Approved') {
      // Construct the account creation link (adjust port/path as needed)
      const accountCreationLink = `http://localhost:5173/register/member/createAccount?applicationId=${updatedApplication._id}`;
      await emailService.sendApprovalEmail(updatedApplication, accountCreationLink);
    } else if (status === 'Rejected') {
      await emailService.sendRejectionEmail(updatedApplication);
    }

    res.status(200).json({ message: `Application ${status.toLowerCase()} successfully`, application: updatedApplication });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
};

// Get all pending applications
export const getPendingApplications = async (req, res) => {
  try {
    const pendingApplications = await MemberApplication.find({ applicationStatus: 'Pending' });
    res.status(200).json({ applications: pendingApplications });
  } catch (error) {
    console.error("Error fetching pending applications:", error);
    res.status(500).json({ message: "Error fetching pending applications" });
  }
};

// Get details of a single application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await MemberApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(200).json({ application });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Error fetching application" });
  }
};

// Function to update profile picture in both collections
export const updateProfilePicture = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Upload buffer to Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'member_profile_images' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };
    const result = await streamUpload(req.file.buffer);
    const profilePicture = result.secure_url;

    // Update profile picture in both collections
    await MemberApplication.findByIdAndUpdate(userId, { profilePicture });
    await User.findOneAndUpdate({ profileId: userId }, { profilePicture });

    res.status(200).json({ message: 'Profile picture updated successfully', profilePicture });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile picture', error: error.message });
  }
};

// Delete profile picture by clearing the field in both collections
export const deleteProfilePicture = async (req, res) => {
  try {
    console.log('deleteProfilePicture called with', req.method, req.path, 'query:', req.query);
    const userId = req.body.userId || req.query.userId;
    if (!userId) {
      console.log('deleteProfilePicture missing userId');
      return res.status(400).json({ message: 'User ID is required' });
    }
    console.log('Deleting profilePicture for userId=', userId);
    // Clear profilePicture in MemberApplication and User
    await MemberApplication.findByIdAndUpdate(userId, { $unset: { profilePicture: '' } });
    await User.findOneAndUpdate({ profileId: userId }, { $unset: { profilePicture: '' } });
    res.status(200).json({ message: 'Profile picture removed successfully' });
  } catch (error) {
    console.error('deleteProfilePicture error:', error);
    res.status(500).json({ message: 'Error removing profile picture', error: error.message });
  }
};

// Function to update user profile details
export const updateMemberProfile = async (req, res) => {
  try {
    const { userId, email, contactNumber, availability, danceStyle, achievements } = req.body;

    // Update email in the User collection
    const updatedUser = await User.findOneAndUpdate({ profileId: userId }, { email }, { new: true });

    // Update the MemberApplication document with additional fields:
    await MemberApplication.findByIdAndUpdate(userId, { 
      email, 
      contactNumber, 
      availability, 
      danceStyle, 
      achievements 
    });

    res.status(200).json({ message: "Profile updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

export const checkMemberEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    const existingApplication = await MemberApplication.findOne({ email });
    res.status(200).json({ exists: !!existingApplication });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// In MemberApplicationController.js
// In /backend/controllers/memberApplicationController.js

export const inviteApplication = async (req, res) => {
  try {
    const { id } = req.params; // Application ID
    const { auditionDate, auditionTime, location } = req.body;
    // Validate that audition details are provided (for the email content)
    if (!auditionDate || !auditionTime || !location) {
      return res.status(400).json({ message: "All audition details are required." });
    }
    
    // Update the MemberApplication status to "Invited" only
    const updatedApplication = await MemberApplication.findByIdAndUpdate(
      id,
      { $set: { applicationStatus: 'Invited' } },
      { new: true, runValidators: true }
    );
    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found." });
    }
    
    // Construct the account creation link (adjust port/path as needed)
    const invitationLink = `http://localhost:3000/register/member/createAccount?applicationId=${updatedApplication._id}`;
    
    // Send the audition invitation email using the provided audition details (for email content only)
    await emailService.sendAuditionInvitationEmail(
      updatedApplication,
      auditionDate,
      auditionTime,
      location,
      invitationLink
    );
    
    return res.status(200).json({
      message: "Invitation sent successfully.",
      application: updatedApplication
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getInvitedApplications = async (req, res) => {
  try {
    // Find applications with status "Invited" (exact case or you can make it case-insensitive)
    const invitedApplications = await MemberApplication.find({ applicationStatus: 'Invited' });
    res.status(200).json({ applications: invitedApplications });
  } catch (error) {
    console.error("Error fetching invited applications:", error);
    res.status(500).json({ message: "Error fetching invited applications" });
  }
};

export const getFinalizedApplications = async (req, res) => {
  try {
    // Find applications with status "Approved" or "Rejected" (exact case)
    const finalizedApplications = await MemberApplication.find({
      applicationStatus: { $in: ['Approved', 'Rejected'] }
    });
    res.status(200).json({ applications: finalizedApplications });
  } catch (error) {
    console.error("Error fetching finalized applications:", error);
    res.status(500).json({ message: "Error fetching finalized applications" });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await MemberApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }
    if (application.applicationStatus !== 'Rejected') {
      return res.status(400).json({ message: "Only rejected applications can be deleted." });
    }
    await MemberApplication.findByIdAndDelete(id);
    return res.status(200).json({ message: "Application deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// controllers/memberApplicationController.js
export const getApprovedMembers = async (req, res) => {
  try {
    const approvedMembers = await MemberApplication.find({ applicationStatus: 'Approved' });
    res.status(200).json(approvedMembers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching approved members', error: error.message });
  }
};


