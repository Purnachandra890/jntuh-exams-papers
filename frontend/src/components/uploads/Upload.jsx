import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Upload.css";
import Navbar from "../Navbar";
import DropdownSection from "./DropdownSection";
import UploadOneSide from "./UploadOneSide";
import UploadTwoSides from "./UploadTwoSides";
import UploadButton from "./UploadButton";
import Footer from "../landing/Footer";
import { API_BASE_URL } from "../../config/api";

const Upload = () => {
  const navigate = useNavigate();

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const [degree, setDegree] = useState("");
  const [regulation, setRegulation] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [paperSides, setPaperSides] = useState("");

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!paperSides) return alert("Please select paper sides.");
    if (!frontImage) return alert("Front image required.");
    if (paperSides === "two" && !backImage)
      return alert("Back image required.");

    if (!API_BASE_URL) {
      return alert("API URL is not configured.");
    }

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
        timeout: 8000,
      };

      const res = await axios.post(`${API_BASE_URL}/api/upload`, formData, config);

      if (res.status === 201) {
        alert("Upload successful (Pending review)");
        resetForm();
      }
    } catch (error) {
      alert("Upload failed. Please try again later.");
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
    <div className="upload-page-container">
      <Navbar />

      <div className="container">
        <div className="upload-header">
          <h1>Upload Paper</h1>
          <p>Help the community by sharing verified exam papers.</p>
        </div>

        <div className="upload-card">
          <h2 className="upload-card-title">1. Paper Details</h2>
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
        </div>

        {paperSides && (
          <div className="upload-card">
            <h2 className="upload-card-title">2. Upload Images</h2>
            <div className="file-upload-section">
              {paperSides === "one" && (
                <UploadOneSide
                  frontImage={frontImage}
                  setFrontImage={setFrontImage}
                  frontPreview={frontPreview}
                  setFrontPreview={setFrontPreview}
                  frontInputRef={frontInputRef}
                />
              )}

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
            </div>
          </div>
        )}

        <div className="upload-action-container">
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
      </div>

      <Footer />
    </div>
  );
};

export default Upload;
