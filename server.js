const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ✅ Proper CORS setup for Azure & frontend
app.use(cors({
  origin: 'https://www.peckpeck.in', // 👈 Replace with your actual frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors()); // ✅ Handle preflight requests

// Middleware
app.use(express.json());

// ✅ MongoDB connection with fallback
const connectWithFallback = async () => {
  try {
    console.log('🔌 Attempting connection to PRIMARY_MONGO_URI...');
    await mongoose.connect(process.env.PRIMARY_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true
    });
    console.log('✅ Connected to PRIMARY MongoDB (Cosmos DB)');
  } catch (err) {
    console.warn('⚠️ Primary connection failed. Trying SECONDARY_MONGO_URI...');
    try {
      await mongoose.connect(process.env.SECONDARY_MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        tls: true
      });
      console.log('✅ Connected to SECONDARY MongoDB (Cosmos DB)');
    } catch (err2) {
      console.error('❌ Failed to connect to both PRIMARY and SECONDARY MongoDB URIs.');
      console.error(err2);
      process.exit(1); // Exit if DB can't be reached
    }
  }
};
connectWithFallback();

// ✅ Import Routes
const feedbackRoutes = require('./routes/feedback');
const contactRoutes = require('./routes/contact');
const subscribeRoutes = require('./routes/subscribe');
const adminRoutes = require('./routes/admin');
const menuRoutes = require('./routes/menu');
const bannerRoutes = require('./routes/banner');
const locationRoutes = require('./routes/location');
const offerRoutes = require('./routes/offer');

// ✅ Mount Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/offers', offerRoutes);

// ✅ Optional health check
app.get('/api/health', (req, res) => {
  res.send('✅ API is healthy');
});

// ✅ Serve frontend in production
app.use(express.static(path.join(__dirname, '../frontend/build')));

// ✅ Catch-all route for SPA (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// ✅ Start server with Azure-compatible port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
