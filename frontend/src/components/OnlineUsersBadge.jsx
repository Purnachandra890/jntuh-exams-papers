import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./OnlineUsersBadge.css";

const SOCKET_URL_1 = import.meta.env.VITE_BACKEND_URL_1;
const SOCKET_URL_2 = import.meta.env.VITE_BACKEND_URL_2;

export default function OnlineUsersBadge() {
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    let socket;

    const connectSocket = () => {
      socket = io(SOCKET_URL_1, {
        transports: ["websocket"],
        timeout: 5000,
      });

      socket.on("connect", () => {
        console.log("✅ Connected to Primary Backend");
      });

      socket.on("OnlineUsers", (count) => {
        setOnlineUsers(count);
      });

      socket.on("connect_error", () => {
        console.warn("❌ Primary server failed. Switching to backup...");
        socket.disconnect();

        socket = io(SOCKET_URL_2, {
          transports: ["websocket"],
          timeout: 5000,
        });

        socket.on("connect", () => {
          console.log("✅ Connected to Backup Backend");
        });

        socket.on("OnlineUsers", (count) => {
          setOnlineUsers(count);
        });
      });
    };

    connectSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return (
    <div className="online-users-badge">
      <span className="status-indicator"></span>
      <span className="status-label">Live Users:</span>
      <span className="status-count">{onlineUsers}</span>
    </div>
  );
}

