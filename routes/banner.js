const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Multer memory storage (no local file saving)
const upload = multer({ storage: multer.memoryStorage() });

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_BLOB_CUSTOM_DOMAIN = process.env.AZURE_BLOB_CUSTOM_DOMAIN; // e.g., https://storage.aathithgroup.in
const CONTAINER_NAME = process.env.AZURE_BLOB_CONTAINER; // Ensure container exists

// Upload a new banner image
router.post('/', upload.single('banner'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    const blobName = `banner/${Date.now()}-${req.file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
    });

    const publicUrl = `${AZURE_BLOB_CUSTOM_DOMAIN}/${CONTAINER_NAME}/${blobName}`;
    res.status(201).json({
      message: 'Banner uploaded successfully',
      url: publicUrl,
    });
  } catch (err) {
    console.error('Upload Error:', err.message);
    res.status(500).json({ error: 'Upload failed' });
  }
});



// List banner images (list only files under "banner/" prefix)
router.get('/', async (req, res) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    let fileUrls = [];
    for await (const blob of containerClient.listBlobsFlat({ prefix: 'banner/' })) {
      const fileUrl = `${AZURE_BLOB_CUSTOM_DOMAIN}/${CONTAINER_NAME}/${blob.name}`;
      fileUrls.push(fileUrl);
    }

    res.json(fileUrls);
  } catch (err) {
    console.error('List Error:', err.message);
    res.status(500).json({ error: 'Unable to list banners' });
  }
});


/*
// Stream a banner image by filename from Azure Blob
router.get('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const blobName = `banner/${filename}`;

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Check if blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Download blob
    const downloadBlockBlobResponse = await blockBlobClient.download();
    const contentType = downloadBlockBlobResponse.contentType;

    // Set headers explicitly
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', downloadBlockBlobResponse.contentLength);

    // Stream blob content directly
    downloadBlockBlobResponse.readableStreamBody.pipe(res);

  } catch (err) {
    console.error('Streaming Error:', err.message);
    res.status(500).json({ error: 'Unable to stream image' });
  }
});
*/

// Delete a banner by filename
router.delete('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const blobName = `banner/${filename}`;

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();

    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    console.error('Delete Error:', err.message);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
