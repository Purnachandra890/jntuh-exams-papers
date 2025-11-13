const express = require('express');
const router = express.Router();

const File = require('../models/File');
router.get('/', async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 }); // Get all files, latest first
    res.status(200).json(files);
  } catch (err) {
    console.error('Fetch Files Error:', err);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});
module.exports = router;
