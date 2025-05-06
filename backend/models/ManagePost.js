import mongoose from "mongoose";

const ManagePostSchema = new mongoose.Schema(
  {
    mediaTitle: { type: String, required: true },
    description: { type: String },
    // Allow images and videos
    mediaType: { type: String, enum: ["image", "video"], default: "image", required: true },
    category: { type: String, required: true },
    privacy: { type: String, enum: ["public", "private", "restricted"], default: "public" },
    tags: [{ type: String }],
    uploadDate: { type: Date, default: Date.now },
    // Path or URL of the uploaded image
    file: { type: String, required: true },
    //uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ManagePost", ManagePostSchema);
