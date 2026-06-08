const crypto = require('crypto');

const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
    const TOKEN_SECRET = process.env.TOKEN_SECRET || "jntuh-secret-salt-key-2026";
    const expectedToken = crypto.createHash('sha256').update(ADMIN_PASSWORD + TOKEN_SECRET).digest('hex');

    if (token !== expectedToken) {
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { requireAdmin };
