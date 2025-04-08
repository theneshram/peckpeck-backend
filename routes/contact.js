const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const sendMail = require('../utils/mailer');

// POST: Submit new contact
router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const newContact = new Contact({
      name,
      email,
      phone,
      message,
      status: 'New'
    });

    await newContact.save();

    // Send email to admin
    await sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: `📞 New Contact Form from ${name}`,
      html: `
        <div style="max-width:600px;margin:auto;font-family:sans-serif;border:1px solid #eee;border-radius:8px;overflow:hidden;">
          <div style="background-color:#e50914;padding:20px;text-align:center;">
            <img src="http://yourdomain.com/uploads/logo.png" alt="Peck Peck Logo" style="height:60px;" />
            <h2 style="color:#fff;margin-top:10px;">New Contact Request</h2>
          </div>
          <div style="padding:20px;background-color:#fff;color:#333;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p style="background:#f8f8f8;padding:10px;border-radius:4px;">${message}</p>
          </div>
          <div style="background-color:#1b1b1b;padding:10px;text-align:center;color:#ccc;">
            <small>Contact received at ${new Date().toLocaleString()}</small>
          </div>
        </div>
      `
    });

    res.status(201).json({ message: 'Contact form submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Submission failed. ' + err.message });
  }
});

// GET: All contact entries
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update contact status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['New', 'In Process', 'Pending', 'Closed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Contact entry not found' });

    res.json({ message: 'Status updated successfully', updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove contact by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Contact entry not found' });
    res.json({ message: 'Contact deleted successfully', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
