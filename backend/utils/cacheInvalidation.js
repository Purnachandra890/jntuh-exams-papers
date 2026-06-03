/**
 * Invalidates GET /api/getfile cache entries after mutations.
 * Upload (pending) does not affect verified listings — no invalidation on upload.
 */

const redisService = require("../services/redis.service");
const { getGetfileCachePattern } = require("./cacheKeys");

/**
 * Remove every cached /api/getfile response.
 * Used when a verified paper is approved or deleted.
 */
async function invalidateAllGetfileCache() {
  const deleted = await redisService.cacheDelByPattern(getGetfileCachePattern());
  if (deleted > 0) {
    console.log(`Cache invalidated: ${deleted} getfile key(s)`);
  }
  return deleted;
}

module.exports = {
  invalidateAllGetfileCache,
};
