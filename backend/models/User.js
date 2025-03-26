import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHashed: { type: String, required: true },
  profilePicture: { type: String },
  role: { 
    type: String, 
    required: true, 
    enum: ['member', 'organizer', 'admin', 'financialManager', 'teamManager', 'contentManager'] 
  },
  // For members and organizers, this holds a reference to their profile details.
  profileId: { type: Schema.Types.ObjectId, refPath: 'profileModel' },
  profileModel: { 
    type: String,
    enum: ['MemberApplication', 'Organizer'],
    required: function() { return this.role === 'member' || this.role === 'organizer'; }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// module.exports = mongoose.model('User', UserSchema);
const User = mongoose.model('User', UserSchema);
export default User;

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
    // Update allowed fields
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
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