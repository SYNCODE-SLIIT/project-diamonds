import axiosInstance from '../utils/axiosInstance';

// Default feature image from Cloudinary
const DEFAULT_FEATURE_IMAGE_URL = "https://res.cloudinary.com/du5c9fw6s/image/upload/v1746620459/default_event_j82gdq.jpg";

/**
 * Fetch event media including feature image for a specific event
 * @param {string} eventId - ID of the event to fetch media for
 * @returns {Promise<Object>} - Event media data with feature image URL
 */
export const fetchEventMedia = async (eventId) => {
  try {
    const response = await axiosInstance.get(`/api/eventMedia/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event media:', error);
    // Return default Cloudinary image if fetch fails
    return { featureImage: DEFAULT_FEATURE_IMAGE_URL };
  }
}; 