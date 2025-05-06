// authController.js using ES Module syntax

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";

// Generate JWT access token with 1h expiry
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Generate a random string for refresh tokens
const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

// Register User
export const registerUser = async (req, res) => {
  const { fullName, email, password, profileImageUrl } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      passwordHashed: hashed,
      profileImageUrl,
    });

    // Issue tokens
    const accessToken = generateToken({ id: user._id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken();
    user.refreshTokens.push(refreshToken);
    await user.save();
    res.status(201).json({ id: user._id, user, token: accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
};

// Login User
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
    const match = await bcrypt.compare(password, user.passwordHashed);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    // Issue tokens
    const accessToken = generateToken({ id: user._id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken();
    user.refreshTokens.push(refreshToken);
    await user.save();
    return res.status(200).json({ token: accessToken, refreshToken, user });
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

// Refresh access token
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });
  try {
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });
    // Rotate tokens
    const newAccessToken = generateToken({ id: user._id, role: user.role, email: user.email });
    const newRefreshToken = generateRefreshToken();
    // Replace old refresh token
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();
    res.status(200).json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Error refreshing token', error: err.message });
  }
};

// Logout user (invalidate one refresh token)
export const logoutUser = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(204);
  try {
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      await user.save();
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: 'Error logging out', error: err.message });
  }
};
