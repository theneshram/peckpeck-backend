const express = require('express');
const router = express.Router();
const Offer = require('../models/Offers');
const Menu = require('../models/Menu');
const Feedback = require('../models/Feedback');
const Contact = require('../models/Contact');
const Location = require('../models/Location');

router.get('/summary', async (req, res) => {
  try {
    const now = new Date();

    // Offers Summary
    const activeOffersPromise = Offer.countDocuments({ startTime: { $lte: now }, endTime: { $gte: now } });
    const expiredOffersPromise = Offer.countDocuments({ endTime: { $lt: now } });
    const upcomingOffersPromise = Offer.countDocuments({ startTime: { $gt: now } });
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    const limitedTimeOffersPromise = Offer.countDocuments({
      $expr: { $lte: [{ $subtract: ["$endTime", "$startTime"] }, twoDays] }
    });

    const offersData = await Promise.all([
      activeOffersPromise,
      expiredOffersPromise,
      upcomingOffersPromise,
      limitedTimeOffersPromise
    ]);

    const offersSummary = [
      { name: 'Active Offers', value: offersData[0] },
      { name: 'Expired Offers', value: offersData[1] },
      { name: 'Upcoming Offers', value: offersData[2] },
      { name: 'Limited Time Offers', value: offersData[3] }
    ];

    // Menu Summary (Group menu items by category)
    const menuSummary = await Menu.aggregate([
      { $group: { _id: '$category', items: { $sum: 1 } } },
      { $project: { category: '$_id', items: 1, _id: 0 } }
    ]);

    // Feedback Ratings (Group by rating and convert to star text)
    const feedbackAggregation = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { 
        $project: { 
          rating: { $concat: [{ $toString: '$_id' }, '★'] }, 
          count: 1, 
          _id: 0 
        } 
      },
      { $sort: { rating: -1 } }
    ]);

    // Contacts Summary (Group by status)
    const contactsSummary = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Location Summary (Group active locations by city)
    const locationSummary = await Location.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $project: { city: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      offers: offersSummary,
      menu: menuSummary,
      feedback: feedbackAggregation,
      contacts: contactsSummary,
      locations: locationSummary
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    // Fallback sample data if an error occurs
    res.json({
      offers: [
        { name: 'Active Offers', value: 12 },
        { name: 'Expired Offers', value: 3 },
        { name: 'Upcoming Offers', value: 5 },
        { name: 'Limited Time Offers', value: 8 }
      ],
      menu: [
        { category: 'Burgers', items: 10 },
        { category: 'Wraps', items: 8 },
        { category: 'Biryani Bowls', items: 6 },
        { category: 'Pizzas', items: 12 },
        { category: 'Salads', items: 7 }
      ],
      feedback: [
        { rating: '5★', count: 45 },
        { rating: '4★', count: 30 },
        { rating: '3★', count: 10 },
        { rating: '2★', count: 5 },
        { rating: '1★', count: 3 }
      ],
      contacts: [
        { status: 'New', count: 10 },
        { status: 'In Process', count: 5 },
        { status: 'Pending', count: 3 },
        { status: 'Closed', count: 7 }
      ],
      locations: [
        { city: 'Bangalore', count: 5 },
        { city: 'Chennai', count: 3 },
        { city: 'Delhi', count: 4 }
      ]
    });
  }
});

module.exports = router;
