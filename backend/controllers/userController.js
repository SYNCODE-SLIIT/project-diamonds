import MemberApplication from '../models/MemberApplication.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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
    const newUser = new User({
      fullName: application.fullName,
      email: application.email,
      passwordHashed: password,  // No encryption for now
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
      
      // Since we're not encrypting, we simply compare the plaintext password.
      if (password !== user.passwordHashed) {
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
    // Since password is stored in plaintext for now, compare directly
    if (oldPassword !== user.passwordHashed) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long." });
    }
    user.passwordHashed = newPassword;
    await user.save();
    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error updating password", error: error.message });
  }
};

