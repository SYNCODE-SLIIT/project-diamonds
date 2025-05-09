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
    const response = await axiosInstance.get(`/api/event-media/${eventId}`);
    return response.data.data || { featureImage: DEFAULT_FEATURE_IMAGE_URL };
  } catch (error) {
    console.error('Error fetching event media:', error);
    // Return default Cloudinary image if fetch fails
    return { featureImage: DEFAULT_FEATURE_IMAGE_URL };
  }
};

/**
 * Upload feature image for an event
 * @param {string} eventId - ID of the event
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} - Updated event media data
 */
export const uploadEventFeatureImage = async (eventId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('eventId', eventId);
    formData.append('featureImage', imageFile);
    
    // If there are existing social media links, include them to prevent overwrite
    const currentMedia = await fetchEventMedia(eventId);
    formData.append('socialMediaLinks', JSON.stringify(currentMedia.socialMediaLinks || {}));
    
    const response = await axiosInstance.post('/api/event-media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading feature image:', error);
    throw error;
  }
};

/**
 * Update social media links for an event
 * @param {string} eventId - ID of the event
 * @param {Object} links - Object containing social media links
 * @returns {Promise<Object>} - Updated event media data
 */
export const updateSocialMediaLinks = async (eventId, links) => {
  try {
    const formData = new FormData();
    formData.append('eventId', eventId);
    formData.append('socialMediaLinks', JSON.stringify(links));
    
    const response = await axiosInstance.post('/api/event-media/updateSocialLinks', formData);
    return response.data;
  } catch (error) {
    console.error('Error updating social media links:', error);
    throw error;
  }
}; 