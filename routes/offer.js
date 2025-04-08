const express = require('express');
const router = express.Router();
const Offer = require('../models/Offers');

// GET: Fetch all offers (optionally filter active offers)
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    let query = {};
    if (active === 'true') {
      const now = new Date();
      query = { startTime: { $lte: now }, endTime: { $gte: now } };
    }
    const offers = await Offer.find(query).sort({ priority: -1, startTime: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST: Create a new offer
router.post('/', async (req, res) => {
  const { title, description, discountType, discountValue, startTime, endTime, applicableCategories, applicableMenuItems, priority } = req.body;
  try {
    const newOffer = new Offer({ 
      title, 
      description, 
      discountType, 
      discountValue, 
      startTime, 
      endTime, 
      applicableCategories, 
      applicableMenuItems, 
      priority 
    });
    await newOffer.save();
    res.status(201).json(newOffer);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data: ' + error.message });
  }
});

// PUT: Update an offer by ID
router.put('/:id', async (req, res) => {
  const { title, description, discountType, discountValue, startTime, endTime, applicableCategories, applicableMenuItems, priority } = req.body;
  try {
    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id, 
      { title, description, discountType, discountValue, startTime, endTime, applicableCategories, applicableMenuItems, priority },
      { new: true }
    );
    res.json(updatedOffer);
  } catch (error) {
    res.status(400).json({ error: 'Update failed: ' + error.message });
  }
});

// DELETE: Remove an offer by ID
router.delete('/:id', async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Delete failed: ' + error.message });
  }
});

module.exports = router;
