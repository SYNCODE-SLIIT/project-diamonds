import MemberApplication from '../models/MemberApplication.js';
import emailService from '../services/emailService.js';

// Create new member application
export const createApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      contactNumber,
      age,
      danceStyle,
      yearsOfExperience,
      availability,
      biography,
      achievements
    } = req.body;

    const newApplication = new MemberApplication({
      fullName,
      email,
      contactNumber,
      age,
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

// Update application status (approve or reject)
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
      const accountCreationLink = `http://localhost:3000/register/member/createAccount?applicationId=${updatedApplication._id}`;
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