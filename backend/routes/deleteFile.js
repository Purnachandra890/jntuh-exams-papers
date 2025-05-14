const express = require('express');
const router = express.Router();
const File = require('../models/File');

// DELETE route to remove a file from the database
router.delete('/:id', async (req, res) => {
  try {
    const fileId = req.params.id;

    // Find and delete the file by its ID
    const deletedFile = await File.findByIdAndDelete(fileId);

    if (!deletedFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    // If file is deleted, send success message
    res.status(200).json({ message: 'File deleted successfully', file: deletedFile });
  } catch (err) {
    console.error('Deletion Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
