import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import "./Upload.css";
import InfoBar from "./InfoBar";

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [degree, setDegree] = useState("");
  const [regulation, setRegulation] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setexamType] = useState(""); // New state

  const [isUploading, setIsUploading] = useState(false); // New state to track upload process

   const API = import.meta.env.VITE_BACKEND_URL;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    } else {
      alert("Please select an image file (JPG, PNG)");
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      console.log("Dropped file:", file.name);
    } else {
      alert("Please drop an image file (JPG, PNG)");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleUpload = async () => {
    // Check if all required fields are filled
    if (
      !selectedFile ||
      !degree ||
      !regulation ||
      !semester ||
      !branch ||
      !subject||
      !examType
    ) {
      alert("All fields including file and subject are required");
      return;
    }
    // Set uploading to true to disable the button
    setIsUploading(true);

    // Prepare FormData to send data as multipart/form-data
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("degree", degree);
    formData.append("regulation", regulation);
    formData.append("semester", semester);
    formData.append("branch", branch);
    formData.append("subject", subject);
    formData.append("examType", examType);


    try {
      // Make a POST request to the server with the FormData
      const response = await axios.post(`${API}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 201) {
        alert("File uploaded successfully and is pending review");
        // Clear form after successful upload
        setSelectedFile(null);
        setPreviewUrl(null);
        setDegree("");
        setRegulation("");
        setSemester("");
        setBranch("");
        setSubject("");
        setexamType("");

      }
    } catch (error) {
      console.error("Upload Error:", error);

      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        alert(
          `Upload failed: ${
            error.response.data.message || "Server error occurred"
          }`
        );
      } else if (error.request) {
        // The request was made but no response was received
        alert(
          "Upload failed: No response from server. Please check your internet connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        alert(`Upload failed: ${error.message}`);
      }
    } finally {
      // Set uploading to false once the upload is complete
      setIsUploading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="back-button-container">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
      </div>

      <div className="upload-container">
        <h1>Upload Image</h1>

        {/* Dropdown selections */}
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

          <div className="subject-input-container">
            <label>
              <input
                type="text"
                placeholder="Enter Subject Name"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </label>
          </div>
          <label>
            <select
              value={examType}
              onChange={(e) => setexamType(e.target.value)}
            >
              <option value="">-- Select Exam Type --</option>
              <option value="Mid-1">Mid-1</option>
              <option value="Mid-2">Mid-2</option>
              <option value="Semester">Semester</option>
            </select>
          </label>
        </div>

        {/* Upload Section */}
        <div className="upload-box">
          <div
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="selected-file">
                {previewUrl && (
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                )}
                <p>
                  <span className="check-icon">✓</span>
                  Selected file: {selectedFile.name}
                </p>
                <button className="browse-button" onClick={handleRemoveFile}>
                  Remove File
                </button>
              </div>
            ) : (
              <>
                <p>Drag and drop your photo here</p>
                <p>or</p>
                <button className="browse-button" onClick={handleBrowseClick}>
                  Browse Photos
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  accept=".jpg,.jpeg,.png"
                />
              </>
            )}
            <p className="file-types">Supported formats: JPG, PNG</p>
          </div>
        </div>
      </div>
      {/* Upload Paper Button */}
      {selectedFile && degree && regulation && semester && branch && subject && examType &&(
        <div className="upload-paper-button-container">
          <button
            className="upload-paper-button"
            onClick={handleUpload}
            disabled={isUploading} // Disable button while uploading
          >
            {isUploading ? "Uploading..." : "Upload Paper"}
          </button>
        </div>
      )}
      <InfoBar />
    </div>
  );
};

export default Upload;
