import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./OnlineUsersBadge.css";
import { SOCKET_URL } from "../config/api";

export default function OnlineUsersBadge() {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!SOCKET_URL) {
      console.warn("VITE_SOCKET_URL is not set. Online users badge disabled.");
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      setConnected(false);
      console.warn("Socket.IO connection failed:", error.message);
    });

    socket.on("OnlineUsers", (count) => {
      setOnlineUsers(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div
      className={`online-users-badge${connected ? "" : " online-users-badge--offline"}`}
      title={connected ? "Connected to live user feed" : "Disconnected from live user feed"}
    >
      <span className="status-indicator"></span>
      <span className="status-label">Live Users:</span>
      <span className="status-count">{connected ? onlineUsers : "—"}</span>
    </div>
  );
}
