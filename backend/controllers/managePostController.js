import ManagePost from "../models/ManagePost.js";

// Create Media (Image Upload)
export const createMedia = async (req, res) => {
  try {
    const { mediaTitle, description, category, privacy, tags, uploadedBy } = req.body;
    const file = req.file ? req.file.path : null;
    
    if (!file) return res.status(400).json({ message: "Image file is required" });
    
    // Convert tags to an array (if provided as comma-separated string)
    const tagsArray = tags
      ? Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim())
      : [];
    
    const newMedia = new ManagePost({ 
      mediaTitle, 
      description, 
      category, 
      privacy, 
      tags: tagsArray, 
      file, 
      uploadedBy 
    });
    await newMedia.save();
    res.status(201).json(newMedia);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Media
export const getAllMedia = async (req, res) => {
  try {
    const mediaList = await ManagePost.find().sort({ uploadDate: -1 });
    res.status(200).json(mediaList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get Media by ID (with all details)
export const getMediaById = async (req, res) => {
  try {
    const media = await ManagePost.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });
    res.status(200).json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Update Media
export const updateMedia = async (req, res) => {
  try {
    const { mediaTitle, description, category, privacy, tags } = req.body;
    const file = req.file ? req.file.path : undefined;
    
    // Convert tags to array if necessary
    const tagsArray = tags
      ? Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim())
      : undefined;
    
    const updateFields = { mediaTitle, description, category, privacy };
    if (tagsArray !== undefined) updateFields.tags = tagsArray;
    if (file) updateFields.file = file;
    
    const updatedMedia = await ManagePost.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!updatedMedia) return res.status(404).json({ message: "Media not found" });
    
    res.status(200).json(updatedMedia);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Media
export const deleteMedia = async (req, res) => {
  try {
    const deletedMedia = await ManagePost.findByIdAndDelete(req.params.id);
    if (!deletedMedia) return res.status(404).json({ message: "Media not found" });
    res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
