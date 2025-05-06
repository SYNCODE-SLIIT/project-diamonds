import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const uploadFile = async (file, folder = 'general') => {
  try {
    // Use buffer if available, otherwise use path
    let uploadOptions = {
      folder: folder,
      resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'auto',
    };
    let uploadResult;
    if (file.buffer) {
      // Use upload_stream for buffer
      uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        stream.end(file.buffer);
      });
    } else if (file.path) {
      uploadResult = await cloudinary.uploader.upload(file.path, uploadOptions);
    } else {
      throw new Error('No file buffer or path found');
    }

    return {
      url: uploadResult.secure_url,
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