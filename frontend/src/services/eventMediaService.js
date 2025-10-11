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
 * Upload event poster image(s)
 * @param {string} eventId - ID of the event
 * @param {FileList|File} posterFiles - Single poster file or multiple poster files
 * @returns {Promise<Object>} - Updated event media data
 */
export const uploadEventPoster = async (eventId, posterFiles) => {
  try {
    const formData = new FormData();
    formData.append('eventId', eventId);
    
    // Handle both single file and multiple files
    if (posterFiles instanceof FileList || Array.isArray(posterFiles)) {
      Array.from(posterFiles).forEach(file => {
        formData.append('posterImages', file);
      });
    } else {
      // Single file case
      formData.append('posterImages', posterFiles);
    }
    
    // Include existing media data to prevent overwrite
    const currentMedia = await fetchEventMedia(eventId);
    
    // Preserve feature image and other data
    if (currentMedia.featureImage) {
      formData.append('preserveFeatureImage', 'true');
    }
    
    // Add social media links to prevent overwrite
    formData.append('socialMediaLinks', JSON.stringify(currentMedia.socialMediaLinks || {}));
    
    // Include existing event images and videos
    if (currentMedia.eventImages && currentMedia.eventImages.length > 0) {
      formData.append('preserveEventImages', 'true');
    }
    
    if (currentMedia.eventVideos && currentMedia.eventVideos.length > 0) {
      formData.append('preserveEventVideos', 'true');
    }
    
    const response = await axiosInstance.post('/api/event-media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading event poster:', error);
    throw error;
  }
};

/**
 * Upload multiple event images
 * @param {string} eventId - ID of the event
 * @param {FileList} imageFiles - The image files to upload
 * @returns {Promise<Object>} - Updated event media data
 */
export const uploadEventImages = async (eventId, imageFiles) => {
  try {
    const formData = new FormData();
    formData.append('eventId', eventId);
    
    // Append each image file to the form data
    Array.from(imageFiles).forEach(file => {
      formData.append('eventImages', file);
    });
    
    // Include existing media data to prevent overwrite
    const currentMedia = await fetchEventMedia(eventId);
    
    // Preserve feature image
    if (currentMedia.featureImage) {
      formData.append('preserveFeatureImage', 'true');
    }
    
    // Preserve poster
    if (currentMedia.poster) {
      formData.append('preservePoster', 'true');
    }
    
    // Preserve event videos
    if (currentMedia.eventVideos && currentMedia.eventVideos.length > 0) {
      formData.append('preserveEventVideos', 'true');
    }
    
    // Add social media links to prevent overwrite
    formData.append('socialMediaLinks', JSON.stringify(currentMedia.socialMediaLinks || {}));
    
    const response = await axiosInstance.post('/api/event-media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading event images:', error);
    throw error;
  }
};

/**
 * Upload multiple event videos
 * @param {string} eventId - ID of the event
 * @param {FileList} videoFiles - The video files to upload
 * @returns {Promise<Object>} - Updated event media data
 */
export const uploadEventVideos = async (eventId, videoFiles) => {
  try {
    const formData = new FormData();
    formData.append('eventId', eventId);
    
    // Append each video file to the form data
    Array.from(videoFiles).forEach(file => {
      formData.append('eventVideos', file);
    });
    
    // Include existing media data to prevent overwrite
    const currentMedia = await fetchEventMedia(eventId);
    
    // Preserve feature image
    if (currentMedia.featureImage) {
      formData.append('preserveFeatureImage', 'true');
    }
    
    // Preserve poster
    if (currentMedia.poster) {
      formData.append('preservePoster', 'true');
    }
    
    // Preserve event images
    if (currentMedia.eventImages && currentMedia.eventImages.length > 0) {
      formData.append('preserveEventImages', 'true');
    }
    
    // Add social media links to prevent overwrite
    formData.append('socialMediaLinks', JSON.stringify(currentMedia.socialMediaLinks || {}));
    
    const response = await axiosInstance.post('/api/event-media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading event videos:', error);
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