const crypto = require("crypto");
const { verifyEmailToken } = require("../utils/verifyToken");

function getExpectedAdminToken() {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  const TOKEN_SECRET = process.env.TOKEN_SECRET || "jntuh-secret-salt-key-2026";
  return crypto
    .createHash("sha256")
    .update(ADMIN_PASSWORD + TOKEN_SECRET)
    .digest("hex");
}

function isValidBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.split(" ")[1];
  return token === getExpectedAdminToken();
}

const requireAdmin = (req, res, next) => {
  try {
    if (!isValidBearerToken(req)) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Accept Bearer token (admin panel) OR signed ?token= from email links.
 */
function requireAdminOrEmailToken(action) {
  return (req, res, next) => {
    try {
      if (isValidBearerToken(req)) {
        return next();
      }

      const emailToken = req.query.token;
      const paperId = req.params.id;

      if (emailToken && verifyEmailToken(paperId, action, emailToken)) {
        return next();
      }

      return res.status(401).json({ message: "Unauthorized: No token provided" });
    } catch (err) {
      console.error("Auth Middleware Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = { requireAdmin, requireAdminOrEmailToken };
