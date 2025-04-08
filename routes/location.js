const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new location
router.post('/', async (req, res) => {
  const {
    name,
    branchCode,
    address,
    city,
    state,
    postalCode,
    phone,
    email,
    lat,
    lng
  } = req.body;

  if (!name || !address || lat == null || lng == null || !city) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const newLocation = new Location({
      name,
      branchCode,
      address,
      city,
      state,
      postalCode,
      phone,
      email,
      geo: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      }
    });

    await newLocation.save();
    res.status(201).json({ message: 'Location added successfully', location: newLocation });
  } catch (error) {
    res.status(400).json({ error: 'Failed to save location', detail: error.message });
  }
});

// Update a location by ID
router.put('/:id', async (req, res) => {
  const {
    name,
    branchCode,
    address,
    city,
    state,
    postalCode,
    phone,
    email,
    lat,
    lng
  } = req.body;

  try {
    const updated = await Location.findByIdAndUpdate(
      req.params.id,
      {
        name,
        branchCode,
        address,
        city,
        state,
        postalCode,
        phone,
        email,
        geo: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ message: 'Location updated successfully', location: updated });
  } catch (error) {
    res.status(400).json({ error: 'Update failed', detail: error.message });
  }
});

// Delete location
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Location.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Location not found' });
    res.json({ message: 'Deleted successfully', location: deleted });
  } catch (error) {
    res.status(400).json({ error: 'Delete failed', detail: error.message });
  }
});

module.exports = router;
