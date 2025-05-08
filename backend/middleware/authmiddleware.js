import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    // Treat literal 'null' or 'undefined' as missing token
    if (!token || token === 'null' || token === 'undefined') {
      console.log("Authentication failed: No token provided or invalid token string");
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
    // Suppress logging for expected JWT errors (invalid signature, expired, etc.)
    if (!(err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError')) {
      console.error("Authentication error:", err.message);
    }
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
