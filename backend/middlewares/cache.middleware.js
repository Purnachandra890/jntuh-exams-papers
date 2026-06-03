/**
 * Cache-aside middleware for GET /api/getfile.
 *
 * Flow:
 * 1. Build cache key from query params.
 * 2. Redis GET — on hit, return JSON immediately (MongoDB not queried).
 * 3. On miss, run the route handler; intercept res.json to SET cache on 200.
 */

const redisService = require("../services/redis.service");
const { buildGetfileCacheKey } = require("../utils/cacheKeys");

function getfileCacheMiddleware() {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = buildGetfileCacheKey(req.query);

    // --- Cache HIT: return stored response ---
    const cached = await redisService.cacheGet(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("X-Data-Source", "redis");
      try {
        return res.status(200).json(JSON.parse(cached));
      } catch {
        await redisService.cacheDel(cacheKey);
      }
    }

    // --- Cache MISS: run handler and store successful responses ---
    res.setHeader("X-Cache", "MISS");
    res.setHeader("X-Data-Source", "mongodb");

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200 && body != null) {
        const payload = JSON.stringify(body);
        redisService
          .cacheSet(cacheKey, payload)
          .catch((err) => console.error("Cache write failed:", err.message));
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = {
  getfileCacheMiddleware,
};
