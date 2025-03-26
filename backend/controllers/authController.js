// authController.js using ES Module syntax

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register User
export const registerUser = async (req, res) => {
  const { fullName, email, passwordHashed, profileImageUrl } = req.body;

  // Validation: Check for missing fields
  if (!fullName || !email || !passwordHashed) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create the user
    const user = await User.create({
      fullName,
      email,
      passwordHashed,
      profileImageUrl,
    });

    res.status(201).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
};

// Login User
// export const loginUser = async (req, res) => {
//   const { email, passwordHashed } = req.body;
//   if (!email || !passwordHashed) {
//     return res.status(400).json({ message: "All fields are required" });
//   }
//   try {
//     const user = await User.findOne({ email });
//     if (!user || !(await user.comparePassword(passwordHashed))) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }
//     res.status(200).json({
//       id: user._id,
//       user,
//       token: generateToken(user._id),
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Error logging in user", error: err.message });
//   }
// };

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

// Get User Info
export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHashed");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving user info", error: err.message });
  }
};
