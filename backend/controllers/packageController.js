import Package from '../models/package.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import multer from 'multer';

const DEFAULT_IMAGE_URL = "https://res.cloudinary.com/du5c9fw6s/image/upload/v1742922785/default_zojwtj.avif"

const upload = multer({ storage: multer.memoryStorage() });

// Get all packages
export const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching packages', error: error.message });
  }
};

// Get a single package by ID
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid package ID format' });
    }
    const packageData = await Package.findById(id);
    if (!packageData) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json(packageData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching package', error: error.message });
  }
};

// Create a new package
export const createPackage = async (req, res) => {
  try {
    let imageUrl = DEFAULT_IMAGE_URL;

    if (req.file) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'package_images' },
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

    const newPackage = new Package({
      ...req.body,
      image: imageUrl
    });

    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    console.error('CREATE PACKAGE ERROR:', error); // Full error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors: validationErrors });
    }
    res.status(500).json({ message: 'Error creating package', error: error.message });
  }
};

// Update an existing package
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid package ID format' });
    }

    let updates = { ...req.body };
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'package_images' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(req.file.buffer);
      });
      updates.image = result.secure_url;
    }

    const updatedPackage = await Package.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json(updatedPackage);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors: validationErrors });
    }
    res.status(500).json({ message: 'Error updating package', error: error.message });
  }
};

// Delete a package
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid package ID format' });
    }
    const deletedPackage = await Package.findByIdAndDelete(id);
    if (!deletedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting package', error: error.message });
  }
};
