const { getBackends, setBackendHealth } = require("./backends");

const DEFAULT_HEALTH_PATH = process.env.HEALTH_CHECK_PATH || "/health";
const FALLBACK_HEALTH_PATH = "/api/ping";
const DEFAULT_INTERVAL_MS = 15000;
const DEFAULT_TIMEOUT_MS = 5000;

async function fetchHealth(url, signal) {
  return fetch(url, { method: "GET", signal });
}

async function checkBackend(backend) {
  if (!backend.url) {
    setBackendHealth(backend.id, false);
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const primaryUrl = `${backend.url}${DEFAULT_HEALTH_PATH}`;
    let response = await fetchHealth(primaryUrl, controller.signal);
    let checkedPath = DEFAULT_HEALTH_PATH;

    // Older deployed backends may only expose /api/ping until redeployed
    if (
      response.status === 404 &&
      DEFAULT_HEALTH_PATH !== FALLBACK_HEALTH_PATH
    ) {
      const fallbackUrl = `${backend.url}${FALLBACK_HEALTH_PATH}`;
      response = await fetchHealth(fallbackUrl, controller.signal);
      checkedPath = FALLBACK_HEALTH_PATH;
    }

    const healthy = response.ok;
    setBackendHealth(backend.id, healthy);

    if (!healthy) {
      console.warn(
        `[HEALTH] ${backend.id} unhealthy — GET ${backend.url}${checkedPath} returned ${response.status}`
      );
    }

    return healthy;
  } catch (error) {
    setBackendHealth(backend.id, false);
    console.warn(`[HEALTH] ${backend.id} unreachable — ${error.message}`);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function runHealthChecks() {
  const backends = getBackends().filter((b) => b.url);
  await Promise.all(backends.map((backend) => checkBackend(backend)));
}

function startHealthChecker(intervalMs = DEFAULT_INTERVAL_MS) {
  runHealthChecks();

  const timer = setInterval(runHealthChecks, intervalMs);
  console.log(`[HEALTH] Polling backends every ${intervalMs / 1000}s`);

  return () => clearInterval(timer);
}

module.exports = {
  startHealthChecker,
  runHealthChecks,
};
