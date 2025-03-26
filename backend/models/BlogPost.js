import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true }, // Example: News, Events, Updates
    featuredImage: { type: String }, // URL or path to the featured image
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to the User model
    publishDate: { type: Date, default: Date.now }, // Date when the post is scheduled to be published
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" }, // Status of the post
    metaDescription: { type: String }, // A brief meta description for SEO
  },
  { timestamps: true } // This adds createdAt and updatedAt timestamps
);

export default mongoose.model("BlogPost", BlogPostSchema);
