import MemberApplication from '../models/MemberApplication.js';
import Organizer from '../models/Organizer.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

import bcrypt from 'bcrypt';
import DirectChat from '../models/DirectChat.js';
import DirectMessage from '../models/DirectMessage.js';

import { deleteUserFinancialData } from '../utils/deleteUserFinancialData.js';


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

// POST endpoint: Create user account based on the member application
export const createUserFromApplication = async (req, res) => {
  const { applicationId, password } = req.body;
  if (!applicationId || !password) {
    return res.status(400).json({ message: "Application ID and password are required" });
  }
  
  // Basic password validation
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }
  // Optionally, additional regex checks for numbers, uppercase, lowercase, and symbols can be added here.
  
  try {
    // Retrieve the application details
    const application = await MemberApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Check if a user already exists with this email
    const existingUser = await User.findOne({ email: application.email });
    if (existingUser) {
      return res.status(400).json({ message: "User with that email already exists" });
    }
    
    // Create the new user using data from the application
    const hashed = await bcrypt.hash(password, 12);
    const newUser = new User({
      fullName: application.fullName,
      email: application.email,
      passwordHashed: hashed,
      role: "member",
      profileId: application._id,
      profileModel: "MemberApplication"
    });
    
    const savedUser = await newUser.save();
    return res.status(201).json({ message: "User account created successfully", user: savedUser });
  } catch (error) {
    return res.status(500).json({ message: "Error creating user account", error: error.message });
  }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      
      // Compare password with bcrypt
      const match = await bcrypt.compare(password, user.passwordHashed);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET || "defaultsecret",
        { expiresIn: "1d" }
      );
      
      return res.status(200).json({ token, user });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error during login." });
    }
};

export const getUserProfile = async (req, res) => {
  try {
    // Assuming req.user contains the authenticated user's ID (set by auth middleware)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Update allowed fields in the user collection
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
    // Optionally update the email if you want it to be synchronized
    if (req.body.email) user.email = req.body.email;
    
    const updatedUser = await user.save();
    return res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    // Delete all financial data for this user
    await deleteUserFinancialData(req.user.id);
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old and new passwords are required." });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Compare current password
    const match = await bcrypt.compare(oldPassword, user.passwordHashed);
    if (!match) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long." });
    }
    // Hash new password
    user.passwordHashed = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error updating password", error: error.message });
  }
};

// Check if an email already exists in the database
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    // Assuming you have imported the User model
    const user = await User.findOne({ email });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    // Find only users whose role is 'member'
    const members = await User.find({ role: 'member' });
    return res.status(200).json(members);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching members", error: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const memberId = req.params.id; // ID of the user to delete
    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role !== 'member') {
      return res.status(400).json({ message: "Only members can be deleted from membership management." });
    }
    // Delete all financial data for this user
    await deleteUserFinancialData(memberId);
    // Delete the user
    await User.findByIdAndDelete(memberId);
    // Also delete the corresponding member application if a reference exists
    if (user.profileId) {
      await MemberApplication.findByIdAndDelete(user.profileId);
    }
    // Also delete all direct chat threads and messages involving this member
    const threads = await DirectChat.find({ participants: memberId }).select('_id').lean();
    const threadIds = threads.map(t => t._id);
    if (threadIds.length > 0) {
      await DirectMessage.deleteMany({ thread: { $in: threadIds } });
      await DirectChat.deleteMany({ _id: { $in: threadIds } });
    }
    return res.status(200).json({ message: "Member and associated application deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting member", error: error.message });
  }
};

// Get all organizers from the User collection
export const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({ role: 'organizer' });
    return res.status(200).json(organizers);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching organizers", error: error.message });
  }
};

// Delete an organizer (and associated profile if exists)
export const deleteOrganizer = async (req, res) => {
  try {
    const organizerId = req.params.id; // ID of the organizer user document
    const user = await User.findById(organizerId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role !== 'organizer') {
      return res.status(400).json({ message: "Only organizers can be deleted from organizer management." });
    }
    // Delete all financial data for this user
    await deleteUserFinancialData(organizerId);
    // Delete the corresponding organizer profile from the Organizer collection if it exists
    if (user.profileId) {
      await Organizer.findByIdAndDelete(user.profileId);
    }
    // Delete the organizer user from the User collection
    await User.findByIdAndDelete(organizerId);
    return res.status(200).json({ message: "Organizer and associated profile deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting organizer", error: error.message });
  }
};