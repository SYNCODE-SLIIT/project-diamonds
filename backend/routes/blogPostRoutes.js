import express from "express";
import { 
  createBlogPost, 
  getAllBlogPosts, 
  getBlogPostById, 
  updateBlogPost, 
  deleteBlogPost, 
  getPublishedBlogPosts 
} from "../controllers/blogPostController.js";
import { protect } from "../middleware/authmiddleware.js"; // Protect routes for authenticated users
import upload from "../middleware/uploadmiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getPublishedBlogPosts); // Get all published blog posts

// Protected Routes (require authentication)
router.use(protect);
router.post("/create", upload.single('featuredImage'), createBlogPost); // Create a new blog post
router.get("/all", getAllBlogPosts); // Get all blog posts
router.get("/:id", getBlogPostById); // Get a single blog post by ID
router.put("/update/:id", upload.single('featuredImage'), updateBlogPost); // Update a blog post
router.delete("/delete/:id", deleteBlogPost); // Delete a blog post

export default router;
