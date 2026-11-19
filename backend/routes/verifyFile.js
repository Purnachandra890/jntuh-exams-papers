const express = require('express');
const router = express.Router();

const File = require('../models/File');
const { invalidateAllGetfileCache } = require('../utils/cacheInvalidation');
const { requireAdminOrEmailToken } = require('../middlewares/auth.middleware');

// Approve file (Bearer token from admin UI OR signed ?token= from email)
const handleApprove = async (req, res) => {
  try {
    const fileId = req.params.id;

    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      { status: 'verified' }, // Set status as 'verified'
      { new: true }
    );

    if (!updatedFile) {
      if (req.headers.authorization || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ message: 'File not found' });
      }
      return res.status(404).send('File not found');
    }

    await invalidateAllGetfileCache();

    if (req.headers.authorization || req.headers.accept?.includes('application/json')) {
      return res.status(200).json({
        success: true,
        message: 'File approved successfully',
        file: updatedFile,
      });
    }

    res.send('<h2>File Approved Successfully ✅</h2>');
  } catch (err) {
    console.error('Approval Error:', err);
    if (req.headers.authorization || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(500).send('Server error');
  }
};

// Reject file (Bearer token from admin UI OR signed ?token= from email)
const handleReject = async (req, res) => {
  try {
    const fileId = req.params.id;

    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      { status: 'rejected' }, // Set status as 'rejected'
      { new: true }
    );

    if (!updatedFile) {
      if (req.headers.authorization || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ message: 'File not found' });
      }
      return res.status(404).send('File not found');
    }

    await invalidateAllGetfileCache();

    if (req.headers.authorization || req.headers.accept?.includes('application/json')) {
      return res.status(200).json({
        success: true,
        message: 'File rejected successfully',
        file: updatedFile,
      });
    }

    res.send('<h2>File Rejected Successfully ❌</h2>');
  } catch (err) {
    console.error('Rejection Error:', err);
    if (req.headers.authorization || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(500).send('Server error');
  }
};

// Approve routes (GET for email links; PUT, PATCH and /accept alias for admin UI/API)
router.get('/:id/approve', requireAdminOrEmailToken('approve'), handleApprove);
router.put('/:id/approve', requireAdminOrEmailToken('approve'), handleApprove);
router.patch('/:id/approve', requireAdminOrEmailToken('approve'), handleApprove);

router.get('/:id/accept', requireAdminOrEmailToken('approve'), handleApprove);
router.put('/:id/accept', requireAdminOrEmailToken('approve'), handleApprove);
router.patch('/:id/accept', requireAdminOrEmailToken('approve'), handleApprove);

// Reject routes (GET for email links; PUT, PATCH for admin UI/API)
router.get('/:id/reject', requireAdminOrEmailToken('reject'), handleReject);
router.put('/:id/reject', requireAdminOrEmailToken('reject'), handleReject);
router.patch('/:id/reject', requireAdminOrEmailToken('reject'), handleReject);

module.exports = router;
