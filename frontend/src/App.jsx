import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import InfoBar from "./components/InfoBar";
import Upload from "./components/uploads/Upload";
import VerifiedPapers from "./components/verified/VerifiedPapers";
import OnlineUsersBadge from "./components/OnlineUsersBadge";

function App() {
  const API_1 = import.meta.env.VITE_BACKEND_URL_1;
  const API_2 = import.meta.env.VITE_BACKEND_URL_2;
  useEffect(() => {
    const wake = async (url) => {
      try {
        // console.log("calling servers..");
        const res = await fetch(url + "/api/ping");
        const text=await res.text();
        console.log(text);
        // console.log("Response from", url, ":", text);
      } catch {
        console.error("Server error:", url, error.message);
      }
    };

    wake(API_1);
    wake(API_2);
  }, []);
  return (
    <Router>
      <OnlineUsersBadge />
      <Routes>
        {/* Home Page Route with Navbar */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Header />
              <InfoBar />
            </>
          }
        />

        {/* Upload Page Route without Navbar */}
        <Route path="/upload" element={<Upload />} />

        {/* Verified Papers Page Route without Navbar */}
        <Route path="/verified-papers" element={<VerifiedPapers />} />
      </Routes>
    </Router>
  );
}

export default App;
