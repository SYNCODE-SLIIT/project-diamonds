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