import axios from 'axios';
import { supabase } from '../config/supabaseClient';

// Cloudinary config
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_CLOUDINARY_PRESET';
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUDINARY_CLOUD_NAME';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Uploads a file to Cloudinary (for images) or Supabase (for PDFs).
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export async function uploadFile(file) {
  if (!file) throw new Error('No file provided');

  if (file.type.startsWith('image/')) {
    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await axios.post(CLOUDINARY_URL, formData);
    return res.data.secure_url;
  } else if (file.type === 'application/pdf') {
    // Upload to Supabase
    const filePath = `pdfs/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { contentType: 'application/pdf' });
    if (error) throw new Error('PDF upload failed: ' + error.message);
    const { publicURL } = supabase.storage.from('documents').getPublicUrl(data.path);
    return publicURL;
  } else {
    throw new Error('Unsupported file type');
  }
} 