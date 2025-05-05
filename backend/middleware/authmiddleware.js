import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      console.log("Authentication failed: No token provided");
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.id) {
      console.log("Authentication failed: Invalid token payload", decoded);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
    
    // Find the user
    const user = await User.findById(decoded.id).select('-passwordHashed');
    
    if (!user) {
      console.log("Authentication failed: User not found for ID", decoded.id);
      return res.status(401).json({ message: "Not authorized, user not found" });
    }
    
    // Set the user in request
    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    res.status(401).json({ message: "Not authorized, token failed", error: err.message });
  }
};
