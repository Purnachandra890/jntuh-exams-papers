/**
 * Logs cache source (Redis/MongoDB) and which backend served the response.
 * Requires backend CORS exposedHeaders:
 * X-Cache, X-Data-Source, X-Server-Id, X-Upstream-Server
 */
function getBackendId(headers = {}) {
  return (
    headers["x-server-id"] ||
    headers["x-upstream-server"] ||
    "unknown"
  );
}

export function logDataSource(response, label = "GET /api/getfile") {
  const headers = response?.headers ?? {};
  const source =
    headers["x-data-source"] ||
    (headers["x-cache"] === "HIT" ? "redis" : "mongodb");

  const backend = getBackendId(headers);
  const fromRedis = source === "redis";

  const cachePart = fromRedis
    ? "Redis (cache hit)"
    : "MongoDB (cache miss)";

  const message = `${label} · ${cachePart} · backend: ${backend}`;

  if (fromRedis) {
    console.info(`%c${message}`, "color: #22c55e; font-weight: bold;");
  } else {
    console.info(`%c${message}`, "color: #3b82f6; font-weight: bold;");
  }
}
