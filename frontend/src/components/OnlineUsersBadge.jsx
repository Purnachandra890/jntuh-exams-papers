import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

export default function OnlineUsersBadge() {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // ✅ FIX: correct event name (case-sensitive)
    socket.on("OnlineUsers", (count) => {
      setOnlineUsers(count);
    });

    // detect screen size changes
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      socket.off("onlineUsers");
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

      {/* ✅ Hide text on mobile */}
      {!isMobile && <span>Live Users:</span>}

      <strong>{onlineUsers}</strong>
    </div>
  );
}
