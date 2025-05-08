// models/EventMedia.js
import mongoose from 'mongoose';

const DEFAULT_FEATURE_IMAGE_URL = "https://res.cloudinary.com/du5c9fw6s/image/upload/v1746620459/default_event_j82gdq.jpg"
const DEFAULT_POSTER_IMAGE_URL = "https://res.cloudinary.com/du5c9fw6s/image/upload/v1746620459/default_poster_smflli.jpg"

const EventMediaSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    unique: true
  },

  featureImage: {
    type: String,
    default: DEFAULT_FEATURE_IMAGE_URL
  }, // only one feature image

  eventImages: [
    {
      type: String
    }
  ], // multiple images allowed

  eventVideos: [
    {
      type: String
    }
  ], // multiple videos allowed

  poster: {
    type: String,
    default: DEFAULT_POSTER_IMAGE_URL
  }, // optional poster image

  socialMediaLinks: {
    instagram: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    facebook: { type: String, default: "" },
    tiktok: { type: String, default: "" },
    x: { type: String, default: "" } // Twitter as 'x'
  }
}, { timestamps: true });

const EventMedia = mongoose.model('EventMedia', EventMediaSchema);
export default EventMedia;