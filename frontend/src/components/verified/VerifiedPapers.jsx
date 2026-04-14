import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VerifiedPapers.css";
import VerifiedFilters from "./VerifiedFilters";
import VerifiedFileList from "./VerifiedFileList";
import Navbar from "../Navbar";
import Footer from "../landing/Footer";

const VerifiedPapers = () => {
  const navigate = useNavigate();

  const [degree, setDegree] = useState("");
  const [regulation, setRegulation] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [examType, setExamType] = useState("");

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  const API_1 = import.meta.env.VITE_BACKEND_URL_1;
  const API_2 = import.meta.env.VITE_BACKEND_URL_2;

  useEffect(() => {
    if (degree && regulation && semester && branch && examType) {
      fetchFiles();
    }
  }, [degree, regulation, semester, branch, examType]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (degree) params.append("degree", degree);
      if (regulation) params.append("regulation", regulation);
      if (semester) {
        params.append("semester", semester);
        params.append("semester", semester.replace("Semester ", "").trim());
      }
      if (branch) params.append("branch", branch);
      if (examType) params.append("examType", examType);
      params.append("status", "verified");

      const queryStr = params.toString();

      try {
        // Try FIRST backend
        const response = await axios.get(`${API_1}/api/getfile?${queryStr}`);
        setFiles(response.data);
        return; // success, stop here
      } catch (error1) {
        console.warn("Primary backend failed, trying backup...");

        // Try SECOND backend
        const response = await axios.get(`${API_2}/api/getfile?${queryStr}`);
        setFiles(response.data);
      }
    } catch (finalError) {
      console.error("Both backends failed:", finalError);
      setError("Both servers are down. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;

    if (loading) {
      timer = setTimeout(() => {
        setShowSlowMessage(true);
      }, 3000);
    } else {
      setShowSlowMessage(false);
    }

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div className="verified-page-container">
      <Navbar />

      <div className="container">
        <div className="verified-header">
          <h1>Verified Papers</h1>
          <p>Browse our collection of verified student-uploaded question papers.</p>
        </div>

        <div className="verified-card filters-card">
          <VerifiedFilters
            degree={degree}
            setDegree={setDegree}
            regulation={regulation}
            setRegulation={setRegulation}
            semester={semester}
            setSemester={setSemester}
            branch={branch}
            setBranch={setBranch}
            examType={examType}
            setExamType={setExamType}
          />
        </div>

        <div className="results-container">
          <div className="results-header">
            <h2>Search Results</h2>
            {!loading && degree && regulation && semester && branch && examType && (
              <span className="paper-count-badge">
                {files.length} papers found
              </span>
            )}
          </div>
          
          <VerifiedFileList
            loading={loading}
            error={error}
            showSlowMessage={showSlowMessage}
            files={files}
            filtersSelected={
              degree && regulation && semester && branch && examType
            }
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VerifiedPapers;
