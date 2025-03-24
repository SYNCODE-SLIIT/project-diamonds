// controllers/packageController.js - Controller functions for package CRUD operations
import Package from '../models/Package.js';
import mongoose from 'mongoose';

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
    const newPackage = req.body;
    
    // Validate required fields
    if (!newPackage.packageID || !newPackage.packageName || !newPackage.description || 
        !newPackage.danceStyle || !newPackage.bookingTerms || !newPackage.type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if packageID already exists
    const existingPackage = await Package.findOne({ packageID: newPackage.packageID });
    if (existingPackage) {
      return res.status(400).json({ message: 'Package ID already exists' });
    }
    
    // Create and save the new package
    const packageData = new Package(newPackage);
    await packageData.save();
    
    res.status(201).json(packageData);
  } catch (error) {
    // Handle Mongoose validation errors
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
    const updates = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid package ID format' });
    }
    
    // If updating packageID, check if it already exists (except for this package)
    if (updates.packageID) {
      const existingPackage = await Package.findOne({ 
        packageID: updates.packageID,
        _id: { $ne: id }
      });
      
      if (existingPackage) {
        return res.status(400).json({ message: 'Package ID already exists' });
      }
    }
    
    // Find and update the package
    const updatedPackage = await Package.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!updatedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    res.status(200).json(updatedPackage);
  } catch (error) {
    // Handle Mongoose validation errors
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