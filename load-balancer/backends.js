/**
 * Backend pool: URLs from env, round-robin selection, health flags.
 */

function normalizeUrl(url) {
  if (!url) return null;
  return url.replace(/\/$/, "");
}

const backends = [
  {
    id: "backend-1",
    url: normalizeUrl(process.env.BACKEND_1_URL),
    healthy: true,
    lastChecked: null,
  },
  {
    id: "backend-2",
    url: normalizeUrl(process.env.BACKEND_2_URL),
    healthy: true,
    lastChecked: null,
  },
];

let roundRobinIndex = 0;

function getBackends() {
  return backends;
}

function setBackendHealth(id, healthy) {
  const backend = backends.find((b) => b.id === id);
  if (backend) {
    backend.healthy = healthy;
    backend.lastChecked = new Date().toISOString();
  }
}

/**
 * Pick the next healthy backend using round-robin.
 * Skips unhealthy instances; returns null if none are available.
 */
function getNextHealthyBackend() {
  const poolSize = backends.length;
  if (poolSize === 0) return null;

  for (let attempt = 0; attempt < poolSize; attempt++) {
    const backend = backends[roundRobinIndex];
    roundRobinIndex = (roundRobinIndex + 1) % poolSize;

    if (backend.url && backend.healthy) {
      return backend;
    }
  }

  return null;
}

function validateBackends() {
  const configured = backends.filter((b) => b.url);
  if (configured.length === 0) {
    throw new Error(
      "No backends configured. Set BACKEND_1_URL and BACKEND_2_URL in environment variables."
    );
  }
  return configured;
}

module.exports = {
  getBackends,
  getNextHealthyBackend,
  setBackendHealth,
  validateBackends,
};
