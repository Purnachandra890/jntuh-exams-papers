import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

export default function OnlineUsersBadge() {
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    socket.on("OnlineUsers", (count) => {
      setOnlineUsers(count);
    });
    return () => {
      socket.off("onlineUsers");
    };
  }, []);

 return (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      left: "20px",
      background: "#b0dbb2",
      color: "#333",
      padding: "10px 18px",
      borderRadius: "25px",
      fontSize: "0.95rem",
      fontWeight: "600",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      zIndex: 9999,

      display: "flex",
      alignItems: "center",     // ✅ vertical center
      justifyContent: "center",
      gap: "8px",

      lineHeight: "1",          // ✅ prevents text jumping
      whiteSpace: "nowrap"      // ✅ keeps everything in one line
    }}
  >
    <span style={{ display: "flex", alignItems: "center" }}>👥</span>
    <span>Live Users:</span>
    <strong>{onlineUsers}</strong>
  </div>
);


}
