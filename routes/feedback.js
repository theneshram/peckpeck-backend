const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const sendMail = require('../utils/mailer');

// POST: Submit new feedback
router.post('/', async (req, res) => {
  const { name, email, message, rating } = req.body;

  if (!name || !message || !rating) {
    return res.status(400).json({ error: 'Name, message, and rating are required.' });
  }

  try {
    const newFeedback = new Feedback({
      name,
      email,
      message,
      rating,
      status: 'New'
    });
    await newFeedback.save();

    // Send email to admin
    await sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: `📬 New Feedback from ${name}`,
      html: `
        <div style="max-width:600px;margin:auto;font-family:sans-serif;border:1px solid #eee;border-radius:8px;overflow:hidden;">
          <div style="background-color:#e50914;padding:20px;text-align:center;">
            <img src="http://yourdomain.com/uploads/logo.png" alt="Peck Peck Logo" style="height:60px;" />
            <h2 style="color:#fff;margin-top:10px;">New Feedback Received</h2>
          </div>
          <div style="padding:20px;background-color:#fff;color:#333;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email || 'N/A'}</p>
            <p><strong>Rating:</strong> ${rating}</p>
            <p><strong>Message:</strong></p>
            <p style="background:#f8f8f8;padding:10px;border-radius:4px;">${message}</p>
          </div>
          <div style="background-color:#1b1b1b;padding:10px;text-align:center;color:#ccc;">
            <small>Feedback received at ${new Date().toLocaleString()}</small>
          </div>
        </div>
      `
    });

    // Send confirmation email to user if email provided
    if (email) {
      await sendMail({
        to: email,
        subject: '🙏 Thank you for your feedback!',
        html: `
          <div style="max-width:600px;margin:auto;font-family:sans-serif;border:1px solid #eee;border-radius:8px;overflow:hidden;">
            <div style="background-color:#e50914;padding:20px;text-align:center;">
              <img src="http://yourdomain.com/uploads/logo.png" alt="Peck Peck Logo" style="height:60px;" />
              <h2 style="color:#fff;margin-top:10px;">Thank You, ${name}!</h2>
            </div>
            <div style="padding:20px;background-color:#fff;color:#333;">
              <p>We appreciate your feedback.</p>
              <p><strong>Your Rating:</strong> ${rating}</p>
              <p><strong>Your Message:</strong></p>
              <p style="background:#f8f8f8;padding:10px;border-radius:4px;">${message}</p>
            </div>
            <div style="background-color:#1b1b1b;padding:10px;text-align:center;color:#ccc;">
              <small>© ${new Date().getFullYear()} Peck Peck. All rights reserved.</small>
            </div>
          </div>
        `
      });
    }

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Submission failed. ' + err.message });
  }
});

// GET: All feedback entries (with pagination)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update feedback status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['New', 'In Process', 'Pending', 'Closed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const updated = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Feedback not found' });
    res.json({ message: 'Status updated successfully', updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Send reply to feedback (admin reply)
router.post('/reply', async (req, res) => {
  const { to, name, subject, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Recipient and message are required for reply.' });
  }
  try {
    await sendMail({
      to,
      subject: subject || `Reply from Peck Peck regarding your feedback`,
      html: `
        <div style="max-width:600px;margin:auto;font-family:sans-serif;border:1px solid #eee;border-radius:8px;overflow:hidden;">
          <div style="background-color:#e50914;padding:20px;text-align:center;">
            <img src="http://yourdomain.com/uploads/logo.png" alt="Peck Peck Logo" style="height:60px;" />
            <h2 style="color:#fff;margin-top:10px;">Hello ${name},</h2>
          </div>
          <div style="padding:20px;background-color:#fff;color:#333;">
            <p>${message}</p>
          </div>
          <div style="background-color:#1b1b1b;padding:10px;text-align:center;color:#ccc;">
            <small>© ${new Date().getFullYear()} Peck Peck. All rights reserved.</small>
          </div>
        </div>
      `
    });
    res.json({ message: 'Reply sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Reply failed. ' + err.message });
  }
});

// DELETE: Remove feedback by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Feedback not found' });
    res.json({ message: 'Feedback deleted successfully', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
