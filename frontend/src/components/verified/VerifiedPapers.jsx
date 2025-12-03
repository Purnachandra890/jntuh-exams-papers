import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VerifiedPapers.css";
import VerifiedFilters from "./VerifiedFilters";
import VerifiedFileList from "./VerifiedFileList";
import BackButton from "../common/BackButton";
import TitleSection from "../common/TitleSection";

const VerifiedPapers = () => {
  const navigate = useNavigate();

  const [degree, setDegree] = useState("");
  const [regulation, setRegulation] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [examType, setExamType] = useState(""); // New state for exam type

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  // console.log("API : " + API);
  const API_1 = import.meta.env.VITE_BACKEND_URL_1;
  const API_2 = import.meta.env.VITE_BACKEND_URL_2;

  useEffect(() => {
    if (degree && regulation && semester && branch && examType) {
      fetchFiles();
    }
  }, [degree, regulation, semester, branch, examType]);

  // const fetchFiles = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");
  //     const response = await axios.get(`${API}/api/getfile`, {
  //       params: {
  //         degree,
  //         regulation,
  //         semester,
  //         branch,
  //         examType,
  //         status: "verified",
  //       },
  //     });
  //     // console.log("Response Data:", response.data);
  //     // console.log("Params Sent:", {
  //     //   degree,
  //     //   regulation,
  //     //   semester,
  //     //   branch,
  //     //   examType,
  //     //   status: "verified",
  //     // });

  //     setFiles(response.data);
  //   } catch (err) {
  //     setError("Failed to fetch files. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        degree,
        regulation,
        semester,
        branch,
        examType,
        status: "verified",
      };

      try {
        // Try FIRST backend
        const response = await axios.get(`${API_1}/api/getfile`, { params });
        setFiles(response.data);
        return; // success, stop here
      } catch (error1) {
        console.warn("Primary backend failed, trying backup...");

        // Try SECOND backend
        const response = await axios.get(`${API_2}/api/getfile`, { params });
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
      }, 3000); // show after 3 seconds
    } else {
      setShowSlowMessage(false); // hide when loading finishes
    }

    return () => clearTimeout(timer);
  }, [loading]);

  const handleBack = () => navigate("/");
  return (
    <div className="page-container">
      <BackButton onClick={handleBack} />
      <TitleSection title="View Verified Papers" />

      <div className="verified-papers-container">
        {/* dropdown container */}
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
        {!loading && degree && regulation && semester && branch && examType && (
          <p className="paper-count">
            {files.length > 0 ? `${files.length} papers found` : ""}
          </p>
        )}
        {/* exams papers */}
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
  );
};

export default VerifiedPapers;
