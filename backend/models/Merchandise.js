import mongoose from 'mongoose';

const MerchandiseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  description: { type: String },
  category: { type: String },
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

const Merchandise = mongoose.model('Merchandise', MerchandiseSchema);
export default Merchandise; 