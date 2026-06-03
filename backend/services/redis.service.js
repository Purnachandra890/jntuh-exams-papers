/**
 * Redis client wrapper with graceful degradation.
 * If Redis is disabled, misconfigured, or unreachable, all operations no-op
 * and the app continues to serve data from MongoDB only.
 */

const { createClient } = require("redis");

let client = null;
let isReady = false;
let connectionAttempted = false;
let lastErrorLoggedAt = 0;

function formatRedisError(err) {
  if (!err) return "unknown error";
  if (err.message) return err.message;
  if (err.code) return err.code;
  return String(err);
}

function isRedisEnabled() {
  if (process.env.REDIS_ENABLED === "false") return false;
  return Boolean(process.env.REDIS_URL);
}

function getDefaultTtlSeconds() {
  const ttl = parseInt(process.env.CACHE_TTL_GETFILE_SECONDS, 10);
  return Number.isFinite(ttl) && ttl > 0 ? ttl : 600;
}

async function teardownClient() {
  if (!client) return;
  try {
    client.removeAllListeners();
    if (client.isOpen) {
      await client.disconnect();
    }
  } catch {
    // ignore shutdown errors
  }
  client = null;
  isReady = false;
}

/**
 * Connect once at startup. Failures are logged once; app keeps running without cache.
 */
async function connectRedis() {
  if (!isRedisEnabled()) {
    console.log("Redis cache disabled (no REDIS_URL or REDIS_ENABLED=false)");
    return;
  }

  if (connectionAttempted) return;
  connectionAttempted = true;

  client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 10_000,
      // Do not spam reconnect attempts when Redis is not running locally
      reconnectStrategy: false,
    },
  });

  client.on("error", (err) => {
    isReady = false;
    const now = Date.now();
    if (now - lastErrorLoggedAt < 10_000) return;
    lastErrorLoggedAt = now;
    console.error("Redis client error:", formatRedisError(err));
  });

  client.on("ready", () => {
    isReady = true;
  });

  client.on("end", () => {
    isReady = false;
  });

  try {
    await client.connect();
    isReady = true;
    console.log("Redis connected — GET /api/getfile responses will be cached");
  } catch (err) {
    console.error("Redis connection failed:", formatRedisError(err));
    console.error(
      "App will run without cache. Start Redis locally, fix REDIS_URL, or set REDIS_ENABLED=false in .env"
    );
    await teardownClient();
  }
}

function isRedisAvailable() {
  return Boolean(client && isReady && client.isOpen);
}

async function cacheGet(key) {
  if (!isRedisAvailable()) return null;
  try {
    return await client.get(key);
  } catch (err) {
    console.error("Redis GET failed:", formatRedisError(err));
    isReady = false;
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = getDefaultTtlSeconds()) {
  if (!isRedisAvailable()) return false;
  try {
    await client.set(key, value, { EX: ttlSeconds });
    return true;
  } catch (err) {
    console.error("Redis SET failed:", formatRedisError(err));
    isReady = false;
    return false;
  }
}

async function cacheDel(key) {
  if (!isRedisAvailable()) return false;
  try {
    await client.del(key);
    return true;
  } catch (err) {
    console.error("Redis DEL failed:", formatRedisError(err));
    isReady = false;
    return false;
  }
}

/**
 * Delete all keys matching a pattern (e.g. papers:getfile:v1:*).
 * Uses SCAN to avoid blocking Redis with KEYS.
 */
async function cacheDelByPattern(pattern) {
  if (!isRedisAvailable()) return 0;

  let deleted = 0;
  try {
    for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      await client.del(key);
      deleted += 1;
    }
  } catch (err) {
    console.error("Redis SCAN/DEL failed:", formatRedisError(err));
    isReady = false;
  }

  return deleted;
}

async function disconnectRedis() {
  await teardownClient();
}

module.exports = {
  connectRedis,
  disconnectRedis,
  isRedisAvailable,
  isRedisEnabled,
  getDefaultTtlSeconds,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelByPattern,
};
