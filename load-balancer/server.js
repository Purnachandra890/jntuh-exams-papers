/**
 * REST-only load balancer. Socket.IO / WebSocket traffic is not proxied here.
 * Point the frontend WebSocket client directly at a single backend if needed.
 */
require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const httpProxy = require("http-proxy");

const {
  getBackends,
  getNextHealthyBackend,
  validateBackends,
} = require("./backends");
const { startHealthChecker } = require("./healthChecker");

validateBackends();

const app = express();
const port = process.env.PORT || 8080;

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  xfwd: true,
  proxyTimeout: 60000,
  timeout: 60000,
});

app.use(morgan("combined"));

proxy.on("proxyReq", (proxyReq, req) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (clientIp) {
    proxyReq.setHeader("X-Real-IP", clientIp);
  }
});

proxy.on("proxyRes", (proxyRes, req) => {
  const backend = req.selectedBackend;
  if (!backend) return;

  proxyRes.headers["x-upstream-server"] = backend.id;

  const exposed = proxyRes.headers["access-control-expose-headers"];
  const extra = "X-Upstream-Server, X-Server-Id, X-Cache, X-Data-Source";
  proxyRes.headers["access-control-expose-headers"] = exposed
    ? `${exposed}, X-Upstream-Server`
    : extra;

  console.log(
    `[PROXY] ${req.method} ${req.originalUrl || req.url} → ${backend.id} (${proxyRes.statusCode})`
  );
});

proxy.on("error", (error, req, res) => {
  const backend = req.selectedBackend;
  console.error(
    `[PROXY] Error forwarding to ${backend?.id || "unknown"}: ${error.message}`
  );

  if (res.writeHead) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Bad Gateway",
        message: "Failed to reach backend server",
      })
    );
  }
});

app.get("/health", (req, res) => {
  const backends = getBackends().map((backend) => ({
    id: backend.id,
    url: backend.url,
    healthy: backend.healthy,
    lastChecked: backend.lastChecked,
  }));

  const anyHealthy = backends.some((b) => b.url && b.healthy);

  res.status(anyHealthy ? 200 : 503).json({
    status: anyHealthy ? "healthy" : "degraded",
    service: "node-load-balancer",
    backends,
  });
});

app.use((req, res) => {
  const backend = getNextHealthyBackend();

  if (!backend) {
    console.error(`[PROXY] No healthy backends for ${req.method} ${req.url}`);
    return res.status(503).json({
      error: "Service Unavailable",
      message: "No healthy backend servers available",
    });
  }

  req.selectedBackend = backend;
  res.setHeader("X-Upstream-Server", backend.id);

  proxy.web(req, res, { target: backend.url });
});

startHealthChecker(
  Number(process.env.HEALTH_CHECK_INTERVAL_MS) || 15000
);

app.listen(port, () => {
  console.log(`Load balancer listening on port ${port}`);
  getBackends().forEach((backend) => {
    if (backend.url) {
      console.log(`  ${backend.id}: ${backend.url}`);
    }
  });
});
