import mongoose from "mongoose";

const ManagePostSchema = new mongoose.Schema(
  {
    mediaTitle: { type: String, required: true }, // Title of the media
    description: { type: String }, // Description of the media
    mediaType: { type: String, enum: ["image", "video", "audio", "document"], required: true }, // Type of media
    category: { type: String, required: true }, // Example: Events, Performances, Behind the Scenes
    privacy: { type: String, enum: ["public", "private", "restricted"], default: "public" }, // Privacy setting
    tags: [{ type: String }], // Array of tags for categorization
    uploadDate: { type: Date, default: Date.now }, // Date of upload
    file: { type: String, required: true }, // URL or path to the uploaded file
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user who uploaded
  },
  { timestamps: true }
);

export default mongoose.model("ManagePost", ManagePostSchema);
