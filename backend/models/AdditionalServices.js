import mongoose from 'mongoose';

const AdditionalServiceSchema = new mongoose.Schema({
    serviceID: { type: String, required: true, unique: true, trim: true },
    serviceName: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, minlength: 10, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, enum: ["Choreography", "Styling", "Stage Effects", "Photography", "Workshops","Other"] },
    createdBy: { type: String, required: true },
    status: { type: String, enum: ["available", "unavailable"], default: "available" }
}, { timestamps: true });

const AdditionalService = mongoose.model('AdditionalService', AdditionalServiceSchema);
export default AdditionalService;