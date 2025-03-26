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
      passwordHashed: password, 
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

export const getOrganizerProfile = async (req, res) => {
  try {
    // req.user is set by your auth middleware (protect)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check that the logged-in user is an organizer
    if (user.role !== "organizer") {
      return res.status(403).json({ message: "Not authorized to view organizer profile." });
    }

    // Use the profileId reference in the user document to fetch the organizer profile
    const organizer = await Organizer.findById(user.profileId);
    if (!organizer) {
      return res.status(404).json({ message: "Organizer profile not found." });
    }

    return res.status(200).json(organizer);
  } catch (error) {
    console.error("Error fetching organizer profile:", error);
    return res.status(500).json({ message: "Error fetching organizer profile", error: error.message });
  }
};

// Fetch all organizers
export const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await Organizer.find();
    return res.status(200).json(organizers);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching organizers", error: error.message });
  }
};

// Delete an organizer (and optionally, the corresponding user)
export const deleteOrganizer = async (req, res) => {
  try {
    const { id } = req.params;
    const organizer = await Organizer.findById(id);
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found." });
    }
    // Delete the organizer document
    await Organizer.findByIdAndDelete(id);

    // Optionally, delete the corresponding user document if user.profileId references this organizer
    await User.findOneAndDelete({ profileId: id, role: 'organizer' });

    return res.status(200).json({ message: "Organizer and associated user deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting organizer", error: error.message });
  }
};

// NEW: Get a single organizer by ID
export const getOrganizerById = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.params.id);
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found." });
    }
    return res.status(200).json(organizer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};