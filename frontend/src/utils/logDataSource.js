/**
 * Logs whether a GET /api/getfile response came from Redis or MongoDB.
 * Requires backend CORS exposedHeaders: X-Cache, X-Data-Source.
 */
export function logDataSource(response, label = "GET /api/getfile") {
  const headers = response?.headers ?? {};
  const source =
    headers["x-data-source"] ||
    (headers["x-cache"] === "HIT" ? "redis" : "mongodb");

  const fromRedis = source === "redis";
  const message = fromRedis
    ? `${label} served from Redis (cache hit)`
    : `${label} served from MongoDB (cache miss)`;

  if (fromRedis) {
    console.info(`%c${message}`, "color: #22c55e; font-weight: bold;");
  } else {
    console.info(`%c${message}`, "color: #3b82f6; font-weight: bold;");
  }
}
