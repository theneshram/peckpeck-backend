const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  applicableCategories: [String], // e.g., ['Burgers', 'Beverages']
  applicableMenuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  priority: { type: Number, default: 0 } // Higher priority means this offer is applied first if multiple offers are valid
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
