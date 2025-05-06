import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a file to Cloudinary with retry mechanism
 * @param {string} filePath - Path to the file to upload
 * @param {Object} options - Cloudinary upload options
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinaryWithRetry = async (filePath, options, maxRetries = 3) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Determine resource type based on file MIME type
      const resourceType = options.resource_type || 
        (filePath.toLowerCase().endsWith('.pdf') ? 'raw' : 'image');
      
      const uploadOptions = {
        ...options,
        resource_type: resourceType
      };
      
      const result = await cloudinary.uploader.upload(filePath, uploadOptions);
      return result;
    } catch (error) {
      retries++;
      console.error(`Cloudinary upload attempt ${retries} failed:`, error);
      
      if (retries === maxRetries) {
        throw new Error(`Failed to upload file after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      const delay = 1000 * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Validates a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<boolean>} - True if valid, throws error if invalid
 */
export const validatePDF = async (filePath) => {
  try {
    // Basic validation - check if file exists and has PDF extension
    if (!filePath.toLowerCase().endsWith('.pdf')) {
      throw new Error('File must have a .pdf extension');
    }
    
    // Additional validation could be added here
    // For example, using pdf-lib to check PDF structure
    
    return true;
  } catch (error) {
    console.error('PDF validation error:', error);
    throw new Error(`Invalid PDF: ${error.message}`);
  }
}; 