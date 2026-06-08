import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./components/landing/Landing";
import Upload from "./components/uploads/Upload";
import VerifiedPapers from "./components/verified/VerifiedPapers";
import AdminPapers from "./components/admin/AdminPapers";
import OnlineUsersBadge from "./components/OnlineUsersBadge";
import Chatbot from "./components/chatbot/Chatbot";
import { API_BASE_URL } from "./config/api";

function App() {
  useEffect(() => {
    if (!API_BASE_URL) return;

    fetch(`${API_BASE_URL}/api/ping`).catch(() => {});
  }, []);

  return (
    <Router>
      <Chatbot />
      <OnlineUsersBadge />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/verified-papers" element={<VerifiedPapers />} />
        <Route path="/admin" element={<AdminPapers />} />
      </Routes>
    </Router>
  );
}

export default App;
