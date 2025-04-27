import Merchandise from '../models/Merchandise.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Get all merchandise (public)
export const getAllMerchandise = async (req, res) => {
  try {
    const items = await Merchandise.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching merchandise', error: error.message });
  }
};

// Get one merchandise item by ID (public)
export const getMerchandiseById = async (req, res) => {
  try {
    const item = await Merchandise.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Merchandise not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching merchandise', error: error.message });
  }
};

// Create merchandise (admin only)
export const createMerchandise = async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'merchandise_images' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };
      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
    }
    const newItem = new Merchandise({
      ...req.body,
      image: imageUrl || req.body.image // fallback to text URL if no file
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating merchandise', error: error.message });
  }
};

// Update merchandise (admin only)
export const updateMerchandise = async (req, res) => {
  try {
    let imageUrl = req.body.image;
    if (req.file) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'merchandise_images' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };
      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
    }
    const updated = await Merchandise.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image: imageUrl },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Merchandise not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating merchandise', error: error.message });
  }
};

// Delete merchandise (admin only)
export const deleteMerchandise = async (req, res) => {
  try {
    const deleted = await Merchandise.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Merchandise not found' });
    res.status(200).json({ message: 'Merchandise deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting merchandise', error: error.message });
  }
}; 