import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Upload.css";
import InfoBar from "../InfoBar";
import DropdownSection from "./DropdownSection";
import UploadOneSide from "./UploadOneSide";
import UploadTwoSides from "./UploadTwoSides";
import UploadButton from "./UploadButton";
import BackButton from "../common/BackButton";
import TitleSection from "../common/TitleSection";

const Upload = () => {
  const navigate = useNavigate();

  // Refs
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  // Dropdown states
  const [degree, setDegree] = useState("");
  const [regulation, setRegulation] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [paperSides, setPaperSides] = useState("");

  // File states
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const API_1 = import.meta.env.VITE_BACKEND_URL_1;
  const API_2 = import.meta.env.VITE_BACKEND_URL_2;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleBack = () => navigate("/");

  const handleUpload = async () => {
    if (!paperSides) return alert("Please select paper sides.");
    if (!frontImage) return alert("Front image required.");
    if (paperSides === "two" && !backImage)
      return alert("Back image required.");

    const formData = new FormData();
    formData.append("degree", degree);
    formData.append("regulation", regulation);
    formData.append("semester", semester);
    formData.append("branch", branch);
    formData.append("subject", subject);
    formData.append("examType", examType);
    formData.append("paperSides", paperSides);

    formData.append("front", frontImage);
    if (paperSides === "two") formData.append("back", backImage);

    try {
      setIsUploading(true);

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 8000, // 8 seconds max per server
      };

      try {
        console.log("Trying Primary Backend...");
        const res = await axios.post(`${API_1}/api/upload`, formData, config);

        if (res.status === 201) {
          alert("Upload successful (Pending review)");
          resetForm();
          return;
        }
      } catch (primaryErr) {
        console.warn("Primary backend failed, switching to backup...");
      }

      // Try Backup backend
      try {
        const res = await axios.post(`${API_2}/api/upload`, formData, config);

        if (res.status === 201) {
          alert("Upload successful (Pending review)");
          resetForm();
        }
      } catch (backupErr) {
        console.error("Both backends failed:", backupErr);
        alert("Both servers are down. Please try again later.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setDegree("");
    setRegulation("");
    setSemester("");
    setBranch("");
    setSubject("");
    setExamType("");
    setPaperSides("");

    setFrontImage(null);
    setBackImage(null);
    setFrontPreview(null);
    setBackPreview(null);
  };

  return (
    <div className="page-container">
      {/* Back Button */}
      <BackButton onClick={handleBack} />
      <TitleSection title="Upload Image" />

      {/* Main Container */}
      <div className="upload-container">
        {/* Dropdowns */}
        <DropdownSection
          degree={degree}
          setDegree={setDegree}
          regulation={regulation}
          setRegulation={setRegulation}
          semester={semester}
          setSemester={setSemester}
          branch={branch}
          setBranch={setBranch}
          subject={subject}
          setSubject={setSubject}
          examType={examType}
          setExamType={setExamType}
          paperSides={paperSides}
          setPaperSides={setPaperSides}
        />

        {/* ONE-SIDE UPLOAD */}
        {paperSides === "one" && (
          <UploadOneSide
            frontImage={frontImage}
            setFrontImage={setFrontImage}
            frontPreview={frontPreview}
            setFrontPreview={setFrontPreview}
            frontInputRef={frontInputRef}
          />
        )}

        {/* TWO SIDES — HORIZONTAL LAYOUT */}
        {paperSides === "two" && (
          <UploadTwoSides
            frontImage={frontImage}
            setFrontImage={setFrontImage}
            frontPreview={frontPreview}
            setFrontPreview={setFrontPreview}
            frontInputRef={frontInputRef}
            backImage={backImage}
            setBackImage={setBackImage}
            backPreview={backPreview}
            setBackPreview={setBackPreview}
            backInputRef={backInputRef}
          />
        )}

        {/* Upload Button */}
        <UploadButton
          canUpload={
            degree &&
            regulation &&
            semester &&
            branch &&
            subject &&
            examType &&
            paperSides &&
            ((paperSides === "one" && frontImage) ||
              (paperSides === "two" && frontImage && backImage))
          }
          isUploading={isUploading}
          handleUpload={handleUpload}
        />
      </div>

      <InfoBar />
    </div>
  );
};

export default Upload;
