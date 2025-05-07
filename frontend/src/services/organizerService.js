import axios from 'axios';

const API = 'http://localhost:4000/api/organizers';

/**
 * Fetch all organizers
 * @returns {Promise<Array>} List of organizers
 */
export const getAllOrganizers = async () => {
  try {
    const response = await axios.get(API);
    return response.data;
  } catch (error) {
    console.error('Error fetching organizers:', error);
    throw error.response?.data || { message: 'Failed to fetch organizers' };
  }
};

/**
 * Fetch organizer details by ID
 * @param {string} id - Organizer ID
 * @returns {Promise<Object>} Organizer details
 */
export const getOrganizerById = async (id) => {
  try {
    const response = await axios.get(`${API}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching organizer with ID ${id}:`, error);
    throw error.response?.data || { message: 'Failed to fetch organizer details' };
  }
};

/**
 * Find organizer by user ID
 * This is helpful when you have a user ID from a request and need to find the associated organizer
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Organizer details
 */
export const findOrganizerByUserId = async (userId) => {
  try {
    // Use the endpoint we just created
    const response = await axios.get(`${API}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error finding organizer for user ID ${userId}:`, error);
    throw error.response?.data || { message: 'Failed to find organizer' };
  }
}; 