const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
require('dotenv').config();

// Admin login endpoint with hashed password check
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing username or password' });
    }
    // Compare with .env
    const envUser = process.env.ADMIN_USERNAME || 'admin';
    const envHash = process.env.ADMIN_HASHED_PASSWORD || '';

    if (username === envUser) {
      const match = await bcrypt.compare(password, envHash);
      if (match) {
        return res.status(200).json({ message: 'Admin logged in', token: 'dummy-token' });
      }
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
