const express = require('express');
const router = express.Router();

const File = require('../models/File');
// Approve file
router.get('/:id/approve', async (req, res) => {
  try {
    const fileId = req.params.id;

    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      { status: 'verified' }, // Set status as 'approved'
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).send('File not found');
    }

    res.send('<h2>File Approved Successfully ✅</h2>');
  } catch (err) {
    console.error('Approval Error:', err);
    res.status(500).send('Server error');
  }
});

// Reject file
router.get('/:id/reject', async (req, res) => {
  try {
    const fileId = req.params.id;

    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      { status: 'rejected' }, // Set status as 'rejected'
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).send('File not found');
    }

    res.send('<h2>File Rejected Successfully ❌</h2>');
  } catch (err) {
    console.error('Rejection Error:', err);
    res.status(500).send('Server error');
  }
});
module.exports = router;
