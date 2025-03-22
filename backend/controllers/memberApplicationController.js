// File: /backend/controllers/memberApplicationController.js

import MemberApplication from '../models/MemberApplication.js';
import emailService from '../services/emailService.js';

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