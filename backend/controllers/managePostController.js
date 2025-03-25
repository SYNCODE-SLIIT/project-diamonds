import ManagePost from "../models/ManagePost.js";

// Create Media
export const createMedia = async (req, res) => {
  try {
    const { mediaTitle, description, mediaType, category, privacy, tags, uploadedBy } = req.body;
    const file = req.file ? req.file.path : null; // Ensure file is uploaded

    if (!file) return res.status(400).json({ message: "File is required" });

    const newMedia = new ManagePost({ mediaTitle, description, mediaType, category, privacy, tags, file, uploadedBy });
    await newMedia.save();

    res.status(201).json(newMedia);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Media
export const getAllMedia = async (req, res) => {
  try {
    const mediaList = await ManagePost.find().sort({ uploadDate: -1 }); // Sort by latest
    res.status(200).json(mediaList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Media by ID
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
    const { mediaTitle, description, mediaType, category, privacy, tags } = req.body;
    const file = req.file ? req.file.path : undefined;

    const updatedMedia = await ManagePost.findByIdAndUpdate(
      req.params.id,
      { mediaTitle, description, mediaType, category, privacy, tags, ...(file && { file }) },
      { new: true }
    );

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
