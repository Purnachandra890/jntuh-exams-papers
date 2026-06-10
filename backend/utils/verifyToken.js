/**
 * Signed tokens for approve/reject links in admin emails.
 * Allows one-click actions from email without Bearer auth.
 */

const crypto = require("crypto");

const TOKEN_TTL_DAYS = parseInt(process.env.VERIFY_TOKEN_TTL_DAYS, 10) || 30;

function getSecret() {
  return process.env.TOKEN_SECRET || "jntuh-secret-salt-key-2026";
}

/**
 * Generate a signed token for an email approve/reject link.
 *
 * @param {string} paperId - MongoDB File _id
 * @param {'approve'|'reject'} action
 */
function generateVerifyToken(paperId, action) {
  const expires = Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${paperId}:${action}:${expires}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(`${expires}:${sig}`).toString("base64url");
}

/**
 * Validate a token from ?token= query param on verify routes.
 */
function verifyEmailToken(paperId, action, token) {
  if (!token || !paperId || !action) return false;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const colonIdx = decoded.indexOf(":");
    if (colonIdx === -1) return false;

    const expiresStr = decoded.slice(0, colonIdx);
    const sig = decoded.slice(colonIdx + 1);
    const expires = parseInt(expiresStr, 10);

    if (!Number.isFinite(expires) || Date.now() > expires) return false;

    const payload = `${paperId}:${action}:${expires}`;
    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");

    if (sig.length !== expected.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(sig, "utf8"),
      Buffer.from(expected, "utf8")
    );
  } catch {
    return false;
  }
}

module.exports = {
  generateVerifyToken,
  verifyEmailToken,
};
