import BlogPost from "../models/BlogPost.js";
import User from "../models/User.js";

// Create a new blog post
export const createBlogPost = async (req, res) => {
  const { title, content, category, featuredImage, publishDate, status, metaDescription } = req.body;
  const userId = req.user.id;

  try {
    // Validation: Ensure required fields are provided
    if (!title || !content || !category) {
      return res.status(400).json({ message: "Title, content, and category are required" });
    }

    const newBlogPost = new BlogPost({
      title,
      content,
      category,
      featuredImage,
      author: userId,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      status,
      metaDescription,
    });

    await newBlogPost.save();
    res.status(201).json(newBlogPost);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get all blog posts
export const getAllBlogPosts = async (req, res) => {
  try {
    const blogPosts = await BlogPost.find().populate("author", "name email").sort({ publishDate: -1 });
    res.json(blogPosts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get a single blog post by ID
export const getBlogPostById = async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id).populate("author", "name email");
    if (!blogPost) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json(blogPost);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update a blog post
export const updateBlogPost = async (req, res) => {
  const { title, content, category, featuredImage, publishDate, status, metaDescription } = req.body;

  try {
    const blogPost = await BlogPost.findById(req.params.id);
    if (!blogPost) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Ensure the author is updating their own post
    if (blogPost.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to edit this blog post" });
    }

    // Update fields only if new values are provided
    blogPost.title = title ?? blogPost.title;
    blogPost.content = content ?? blogPost.content;
    blogPost.category = category ?? blogPost.category;
    blogPost.featuredImage = featuredImage ?? blogPost.featuredImage;
    blogPost.publishDate = publishDate ? new Date(publishDate) : blogPost.publishDate;
    blogPost.status = status ?? blogPost.status;
    blogPost.metaDescription = metaDescription ?? blogPost.metaDescription;

    const updatedBlogPost = await blogPost.save();
    res.status(200).json({ message: "Blog post updated successfully", blogPost: updatedBlogPost });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Delete a blog post
export const deleteBlogPost = async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id);
    if (!blogPost) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Ensure the author is deleting their own post
    if (blogPost.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this blog post" });
    }

    await BlogPost.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get published blog posts
export const getPublishedBlogPosts = async (req, res) => {
  try {
    const blogPosts = await BlogPost.find({ status: "published" }).populate("author", "name email").sort({ publishDate: -1 });
    res.json(blogPosts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
