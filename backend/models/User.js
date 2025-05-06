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
  updatedAt: { type: Date, default: Date.now },
  refreshTokens: [{ type: String }]
});

const User = mongoose.model('User', UserSchema);
export default User;