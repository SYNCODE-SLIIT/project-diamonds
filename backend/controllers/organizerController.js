import Organizer from '../models/Organizer.js';
import User from '../models/User.js';

export const createOrganizerAccount = async (req, res) => {
  const {
    fullName,
    organizationName,
    email,
    contactNumber,
    profilePicture,
    organizationDescription,
    businessAddress,
    website,
    socialMediaLinks, // Expected to be an object: { facebook, twitter, instagram }
    password // Plaintext password for now (no encryption)
  } = req.body;

  // Check for required fields
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full name, email, and password are required." });
  }

  try {
    // Check if a user with this email already exists (in any role)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with that email already exists." });
    }

    // Create the Organizer document
    const newOrganizer = new Organizer({
      fullName,
      organizationName,
      email,
      contactNumber,
      profilePicture,
      organizationDescription,
      businessAddress,
      website,
      socialMediaLinks
    });
    const savedOrganizer = await newOrganizer.save();

    // Create the User document that references the Organizer profile
    const newUser = new User({
      fullName,
      email,
      passwordHashed: password, // plaintext for now
      role: "organizer",
      profileId: savedOrganizer._id,
      profileModel: "Organizer"
    });
    const savedUser = await newUser.save();

    return res.status(201).json({ 
      message: "Organizer account created successfully.", 
      organizer: savedOrganizer, 
      user: savedUser 
    });
  } catch (error) {
    console.error("Error creating organizer account:", error);
    return res.status(500).json({ message: "Error creating organizer account", error: error.message });
  }
};