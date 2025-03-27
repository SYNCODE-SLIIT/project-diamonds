import ContentCreator from '../models/Contentcreator.js';

// Create a new content creator
export const createContentCreator = async (req, res) => {
  try {
    const newContentCreator = new ContentCreator(req.body);
    await newContentCreator.save();
    res.status(201).json(newContentCreator);
  } catch (error) {
    console.error("Error creating content creator:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all content creators
export const getAllContentCreators = async (req, res) => {
  try {
    const contentCreators = await ContentCreator.find().sort({ createdAt: -1 });
    res.json(contentCreators);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get a single content creator by ID
export const getContentCreatorById = async (req, res) => {
  try {
    const contentCreator = await ContentCreator.findById(req.params.id);
    if (!contentCreator) {
      return res.status(404).json({ message: "Content creator not found" });
    }
    res.json(contentCreator);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update a content creator
export const updateContentCreator = async (req, res) => {
  try {
    const contentCreator = await ContentCreator.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!contentCreator) {
      return res.status(404).json({ message: "Content creator not found" });
    }

    res.status(200).json({ 
      message: "Content creator updated successfully", 
      contentCreator 
    });
  } catch (error) {
    console.error("Error updating content creator:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete a content creator
export const deleteContentCreator = async (req, res) => {
  try {
    const contentCreator = await ContentCreator.findByIdAndDelete(req.params.id);
    
    if (!contentCreator) {
      return res.status(404).json({ message: "Content creator not found" });
    }

    res.status(200).json({ message: "Content creator deleted successfully" });
  } catch (error) {
    console.error("Error deleting content creator:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get content creators by status
export const getContentCreatorsByStatus = async (req, res) => {
  try {
    const contentCreators = await ContentCreator.find({ 
      status: req.params.status 
    }).sort({ createdAt: -1 });

    res.json(contentCreators);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};