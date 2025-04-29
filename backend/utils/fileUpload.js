import cloudinary from '../config/cloudinary.js';

export const uploadFile = async (file, folder = 'general') => {
  try {
    // Use 'raw' for PDFs, 'auto' for others
    const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'auto';
    const cloudinaryUpload = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: resourceType,
    });

    return {
      url: cloudinaryUpload.secure_url,
      provider: 'cloudinary'
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('File upload failed');
  }
};

export const deleteFile = async (url) => {
  try {
    if (url.includes('cloudinary')) {
      // Extract public ID from Cloudinary URL
      const publicId = url.split('/upload/')[1].split('/').slice(1).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error('File deletion failed');
  }
}; 