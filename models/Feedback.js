const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location', // Make sure this matches the name of your Location model
    required: false
  },
  status: {
    type: String,
    enum: ['New', 'In Process', 'Pending', 'Closed'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
