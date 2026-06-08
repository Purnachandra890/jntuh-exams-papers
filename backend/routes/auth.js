const express = require('express');
const router = express.Router();
const crypto = require('crypto');

router.post('/login', (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const TOKEN_SECRET = process.env.TOKEN_SECRET || "jntuh-secret-salt-key-2026";
    const token = crypto.createHash('sha256').update(ADMIN_PASSWORD + TOKEN_SECRET).digest('hex');

    res.status(200).json({ success: true, token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
