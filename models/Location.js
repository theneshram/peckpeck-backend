const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },            // Restaurant name
  branchCode: { type: String, unique: true },        // Internal branch ID (optional)
  address: { type: String, required: true },         // Full address
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String },
  phone: { type: String },
  email: { type: String },
  isOrderingEnabled: { type: Boolean, default: true },


  geo: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  isActive: { type: Boolean, default: true },         // Can disable a location
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for geospatial queries (required for distance calculations)
locationSchema.index({ geo: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);
