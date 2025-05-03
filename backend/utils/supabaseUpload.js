import { supabase } from '../config/supabaseClient.js';
import fs from 'fs';

export const uploadToSupabase = async (file, folder = 'general') => {
  try {
    // Read file as buffer
    const fileBuffer = fs.readFileSync(file.path);
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('financial-documents')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('financial-documents')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      provider: 'supabase'
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    throw new Error('File upload failed');
  }
};

export const deleteFromSupabase = async (url) => {
  try {
    if (url.includes('supabase')) {
      // Extract file path from Supabase URL
      const filePath = url.split('/storage/v1/object/public/financial-documents/')[1];
      
      const { error } = await supabase.storage
        .from('financial-documents')
        .remove([filePath]);

      if (error) throw error;
    }
  } catch (error) {
    console.error('Supabase deletion error:', error);
    throw new Error('File deletion failed');
  }
}; 