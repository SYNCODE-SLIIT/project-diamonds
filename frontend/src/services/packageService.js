// src/services/packageService.js - API service using Axios
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/packages';

// Get all packages
export const getPackages = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch packages' };
  }
};

// Get a single package by ID
export const getPackageById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch package' };
  }
};

// Create a new package
export const createPackage = async (packageData) => {
  try {
    const response = await axios.post(API_URL, packageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create package' };
  }
};

// Update an existing package
export const updatePackage = async (id, packageData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, packageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update package' };
  }
};

// Delete a package
export const deletePackage = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete package' };
  }
};