import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VerifiedPapers.css";

const VerifiedPapers = () => {
  const navigate = useNavigate();

  const [degree, setDegree] = useState("");
  const [regulation, setRegulation] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBack = () => navigate("/");

  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (degree && regulation && semester && branch) {
      fetchFiles();
    }
  }, [degree, regulation, semester, branch]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API}/api/getfile`, {
        params: { degree, regulation, semester, branch, status: "verified" },
      });
      setFiles(response.data);
    } catch (err) {
      setError("Failed to fetch files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="back-button-container">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
      </div>

      <div className="verified-papers-container">
        <h1>View Verified Papers</h1>

        <div className="dropdown-container">
          <label>
            <select value={degree} onChange={(e) => setDegree(e.target.value)}>
              <option value="">-- Select Degree --</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
            </select>
          </label>
          <label>
            <select
              value={regulation}
              onChange={(e) => setRegulation(e.target.value)}
            >
              <option value="">-- Select Regulation --</option>
              <option value="R22">R22</option>
              <option value="R20">R20</option>
              <option value="R18">R18</option>
            </select>
          </label>
          <label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="">-- Select Semester --</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </label>
          <label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="">-- Select Branch --</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </label>
        </div>

        {loading && <p>Loading files...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && files.length > 0 && (
          <div className="file-list">
            {files.map((file) => (
              <div className="file-card" key={file._id}>
                <h4>{file.subject || "paper"}</h4>
                <p>
                  Uploaded on: {new Date(file.createdAt).toLocaleDateString()}
                </p>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="view-button">View / Download</button>
                </a>
              </div>
            ))}
          </div>
        )}

        {!loading &&
          files.length === 0 &&
          degree &&
          regulation &&
          semester &&
          branch && <p>No files found for the selected criteria.</p>}
      </div>
    </div>
  );
};

export default VerifiedPapers;
