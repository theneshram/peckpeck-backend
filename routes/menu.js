const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Menu = require('../models/Menu');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Use in-memory storage for multer
const upload = multer({ storage: multer.memoryStorage() });

// Azure Blob Config
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_BLOB_CUSTOM_DOMAIN = process.env.AZURE_BLOB_CUSTOM_DOMAIN;
const CONTAINER_NAME = process.env.AZURE_BLOB_CONTAINER;

// Upload image to Azure Blob
async function uploadToBlob(buffer, originalname, mimetype) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  const blobName = `menu/${Date.now()}-${originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimetype }
  });

  return `${AZURE_BLOB_CUSTOM_DOMAIN}/${CONTAINER_NAME}/${blobName}`;
}

// GET all menu items
router.get('/', async (req, res) => {
  try {
    const items = await Menu.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new menu item
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, subCategory, price, calories, isAvailable } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToBlob(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const newItem = new Menu({
      name,
      description,
      category,
      subCategory,
      price,
      calories,
      isAvailable: isAvailable === 'false' ? false : true,
      image: imageUrl
    });

    await newItem.save();
    res.status(201).json({ message: 'Menu item added successfully', item: newItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a menu item by ID
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, subCategory, price, calories, isAvailable } = req.body;

    const updateData = {
      name,
      description,
      category,
      subCategory,
      price,
      calories,
      isAvailable: isAvailable === 'false' ? false : true
    };

    if (req.file) {
      const imageUrl = await uploadToBlob(req.file.buffer, req.file.originalname, req.file.mimetype);
      updateData.image = imageUrl;
    }

    const updatedItem = await Menu.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedItem) return res.status(404).json({ error: 'Menu item not found' });

    res.json({ message: 'Menu item updated successfully', item: updatedItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE menu item by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Menu.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ message: 'Menu item deleted successfully', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Checkout stub
router.post('/checkout', async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    if (paymentMethod === 'cod') {
      return res.json({ message: 'Order placed with Cash on Delivery' });
    } else if (paymentMethod === 'online') {
      return res.json({ message: 'Order placed with Online Payment' });
    } else {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
