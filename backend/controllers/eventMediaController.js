// controllers/eventMediaController.js
import EventMedia from '../models/EventMedia.js';
import cloudinary from '../config/cloudinary.js';

// Upload helper
const uploadToCloudinary = async (file, folder) => {
  const uploaded = await cloudinary.uploader.upload(file.path, {
    folder: `eventMedia/${folder}`,
    resource_type: file.mimetype.startsWith("video") ? "video" : "image"
  });
  return uploaded.secure_url;
};

// Create or Update Event Media
export const uploadEventMedia = async (req, res) => {
  try {
    const { eventId } = req.body;
    const folderName = eventId;

    // Prepare upload URLs
    const uploadPromises = [];

    const media = {
      eventId,
      featureImage: "",
      eventImages: [],
      eventVideos: [],
      poster: "",
      socialMediaLinks: JSON.parse(req.body.socialMediaLinks || "{}")
    };

    // Feature image
    if (req.files.featureImage) {
      uploadPromises.push(
        uploadToCloudinary(req.files.featureImage[0], folderName).then(url => {
          media.featureImage = url;
        })
      );
    }

    // Poster
    if (req.files.poster) {
      uploadPromises.push(
        uploadToCloudinary(req.files.poster[0], folderName).then(url => {
          media.poster = url;
        })
      );
    }

    // Event Images
    if (req.files.eventImages) {
      for (const file of req.files.eventImages) {
        uploadPromises.push(
          uploadToCloudinary(file, folderName).then(url => {
            media.eventImages.push(url);
          })
        );
      }
    }

    // Event Videos
    if (req.files.eventVideos) {
      for (const file of req.files.eventVideos) {
        uploadPromises.push(
          uploadToCloudinary(file, folderName).then(url => {
            media.eventVideos.push(url);
          })
        );
      }
    }

    await Promise.all(uploadPromises);

    // Upsert media (create or update)
    const updated = await EventMedia.findOneAndUpdate(
      { eventId },
      media,
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed", error: err.message });
  }
};

// Get Event Media by Event ID
export const getEventMedia = async (req, res) => {
  try {
    const media = await EventMedia.findOne({ eventId: req.params.eventId });
    res.status(200).json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};