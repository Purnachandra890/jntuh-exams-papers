import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL_1 = import.meta.env.VITE_BACKEND_URL_1;
const SOCKET_URL_2 = import.meta.env.VITE_BACKEND_URL_2;

export default function OnlineUsersBadge() {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    let socket;

    const connectSocket = () => {
      console.log("Connecting to primary socket...");
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

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (socket) socket.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "7px",
        left: "20px",
        background: "#b0dbb2",
        color: "#333",
        padding: isMobile ? "8px 12px" : "10px 18px",
        borderRadius: "25px",
        fontSize: isMobile ? "0.85rem" : "0.95rem",
        fontWeight: "600",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        lineHeight: "1",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "flex", alignItems: "center" }}>👥</span>
      {!isMobile && <span>Live Users:</span>}
      <strong>{onlineUsers}</strong>
    </div>
  );
}
