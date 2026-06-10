/**
 * Shared Redis connection for BullMQ (Queue, Worker, QueueEvents).
 * BullMQ requires ioredis — separate from the node-redis client used for GET caching.
 *
 * Uses REDIS_URL from environment. Optional REDIS_BULLMQ_DB (default 0) for DB index.
 */

const IORedis = require("ioredis");

let connection = null;

function getBullmqConnection() {
  if (connection) return connection;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error(
      "REDIS_URL is required for BullMQ. Set it in .env or set REDIS_ENABLED=false only for cache — queue still needs Redis."
    );
  }

  const db = parseInt(process.env.REDIS_BULLMQ_DB, 10);
  const connectionOptions = {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
  };

  if (Number.isFinite(db) && db >= 0) {
    connectionOptions.db = db;
  }

  connection = new IORedis(redisUrl, connectionOptions);

  connection.on("error", (err) => {
    console.error("[BullMQ Redis] Connection error:", err.message);
  });

  connection.on("connect", () => {
    console.log("[BullMQ Redis] Connected");
  });

  return connection;
}

async function closeBullmqConnection() {
  if (connection) {
    await connection.quit();
    connection = null;
  }
}

module.exports = {
  getBullmqConnection,
  closeBullmqConnection,
};
