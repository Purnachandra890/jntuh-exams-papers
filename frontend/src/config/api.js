/**
 * REST traffic goes through the load balancer.
 * WebSocket (Socket.IO) connects directly to one backend — LB is REST-only.
 */
const trimSlash = (url) => (url ? url.replace(/\/$/, "") : "");

export const API_BASE_URL = trimSlash(import.meta.env.VITE_LOAD_BALANCER_URL);

export const SOCKET_URL = trimSlash(import.meta.env.VITE_SOCKET_URL);

if (!API_BASE_URL) {
  console.warn(
    "VITE_LOAD_BALANCER_URL is not set. REST API calls will fail until you configure it."
  );
}
