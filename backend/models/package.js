// 1. Backend Model: models/package.js
import mongoose from 'mongoose';

const DEFAULT_IMAGE_URL = "https://res.cloudinary.com/du5c9fw6s/image/upload/v1742922785/default_zojwtj.avif"

const PackageSchema = new mongoose.Schema({
    packageID: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        default: function () {
            const prefix = this.type === 'custom' ? 'CUS' : 'PKG';
            return `${prefix}-${Date.now().toString(36)}`;
        }
    },
    packageName: { 
        type: String, 
        required: true, 
        trim: true, 
        minlength: 3, 
        maxlength: 100 
    },
    description: { 
        type: String, 
        required: true, 
        minlength: 10, 
        maxlength: 500 
    },
    performances: [
        {
            type: { type: String, required: true, trim: true },
            duration: { 
                type: String, 
                required: true, 
                match: /^[1-9][0-9]*\s?(minutes|minute|hours|hour)$/ 
            }
        }
    ],
    danceStyles: { type: [String], required: true },
    teamInvolvement: {
        maleDancers: { type: Number, required: true, min: 0 }, 
        femaleDancers: { type: Number, required: true, min: 0 },
        choreographers: { type: Number, required: true, min: 1 },
        MC: { type: Number, min: 0, default: 0 }
    },
    travelFees: { type: Number, default: 0, min: 0 },
    bookingTerms: { type: String, required: false, minlength: 10 },
    price: { type: Number, default: 0, min: 0 },
    image: { 
        type: String, 
        default: DEFAULT_IMAGE_URL
    },
    type: { 
        type: String, 
        enum: ["system", "custom"], 
        required: true,
        default: "system"
    },
    status: { 
        type: String, 
        enum: ["approved", "pending"], 
        default: "pending" 
    },
    createdBy: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('Package', PackageSchema);