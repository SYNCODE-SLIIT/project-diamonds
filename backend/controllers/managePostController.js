import ManagePost from "../models/ManagePost.js";

// Create Media (Image Upload)
export const createMedia = async (req, res) => {
  try {
    const { mediaTitle, description, category, privacy, tags, uploadedBy, thumbnail } = req.body;
    const file = req.file ? req.file.path : null;
    // Determine media type from mimetype
    const mediaType = req.file
      ? (req.file.mimetype.startsWith('video/') ? 'video' : 'image')
      : 'image';
    
    if (!file) return res.status(400).json({ message: "Media file is required" });
    
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
      mediaType,
      tags: tagsArray, 
      file,
      thumbnail: mediaType === 'video' ? thumbnail : undefined,
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
    const { mediaTitle, description, category, privacy, tags, thumbnail } = req.body;
    const file = req.file ? req.file.path : undefined;
    // Determine new mediaType if file uploaded
    const mediaType = req.file
      ? (req.file.mimetype.startsWith('video/') ? 'video' : 'image')
      : undefined;
    
    // Convert tags to array if necessary
    const tagsArray = tags
      ? Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim())
      : undefined;
    
    const updateFields = { mediaTitle, description, category, privacy };
    if (mediaType) updateFields.mediaType = mediaType;
    if (tagsArray !== undefined) updateFields.tags = tagsArray;
    if (file) updateFields.file = file;
    if (thumbnail && mediaType === 'video') updateFields.thumbnail = thumbnail;
    
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

// Like Media
export const likeMedia = async (req, res) => {
  try {
    const media = await ManagePost.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    const userId = req.user._id;
    const isLiked = media.likes.includes(userId);

    if (isLiked) {
      media.likes = media.likes.filter(id => id.toString() !== userId.toString());
    } else {
      media.likes.push(userId);
    }

    await media.save();
    res.status(200).json({ likes: media.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Comment
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const media = await ManagePost.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    const comment = {
      user: req.user._id,
      content,
      createdAt: new Date()
    };

    media.comments.push(comment);
    await media.save();

    // Populate user information for the new comment
    const populatedComment = await ManagePost.findOne(
      { _id: media._id, "comments._id": media.comments[media.comments.length - 1]._id },
      { "comments.$": 1 }
    ).populate("comments.user", "name");

    res.status(201).json(populatedComment.comments[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save Media
export const saveMedia = async (req, res) => {
  try {
    const media = await ManagePost.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    const userId = req.user._id;
    const isSaved = media.saves.includes(userId);

    if (isSaved) {
      media.saves = media.saves.filter(id => id.toString() !== userId.toString());
    } else {
      media.saves.push(userId);
    }

    await media.save();
    res.status(200).json({ saved: !isSaved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
