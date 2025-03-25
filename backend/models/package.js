import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
    packageID: { type: String, required: true, unique: true, trim: true },
    packageName: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, minlength: 10, maxlength: 500 },
    performances: [
        {
            type: { type: String, required: true, trim: true },
            duration: { type: String, required: true, match: /^[1-9][0-9]*\s?(minutes|minute|hours|hour)$/ }
        }
    ],
    danceStyle: { type: [String], required: true },
    customizationOptions: { type: [String], default: [] },
    teamInvolvement: {
        dancers: { type: Number, required: true, min: 1 },
        choreographer: { type: Number, required: true, min: 1 },
        MC: { type: Number, min: 0 }
    },
    additionalServices: [
        {
            service: { type: String, required: true, trim: true },
            price: { type: Number, required: true, min: 0 }
        }
    ],
    travelFees: { type: Number, default: 0, min: 0 },
    bookingTerms: { type: String, required: true, minlength: 10 },
    price: { type: Number, default: null, min: 0 },
    image: { type: String, default: 'https://i.pinimg.com/736x/b8/32/ff/b832ff90757e0cc6075e752976bdfe3c.jpg' },
    type: { type: String, enum: ["system", "custom"], required: true },
    status: { type: String, enum: ["approved", "pending"], default: "pending" },
    createdBy: { type: String, default: null }  // Null for system packages, user ID for custom packages
}, { timestamps: true });

const Package = mongoose.model('Package', PackageSchema);
export default Package;