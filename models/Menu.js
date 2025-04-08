const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  calories: { type: Number },
  image: { type: String }, // Stores local path, e.g., "/uploads/menu/filename.jpg"
  category: { type: String, required: true },
  subCategory: { type: String },
  isAvailable: { type: Boolean, default: true },
  isNewItem: { type: Boolean, default: true }, // Flag to indicate a new menu item
  restaurantId: { type: String } // For multi-location support, if needed
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
