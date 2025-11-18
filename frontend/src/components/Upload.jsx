import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Upload.css";
import InfoBar from "./InfoBar";

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

  const API = import.meta.env.VITE_BACKEND_URL;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

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

    // Important: Correct names so Multer works
    formData.append("front", frontImage);
    if (paperSides === "two") formData.append("back", backImage);

    try {
      setIsUploading(true);

      const res = await axios.post(`${API}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201) {
        alert("Upload successful! and is pending review");

        // RESET FORM
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
      }
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed. Check console.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Back Button */}
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>

      {/* Main Container */}
      <div className="upload-container">
        <h1>Upload Image</h1>

        {/* Dropdowns */}
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>

          <label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="">-- Select Branch --</option>
              <option>CSE</option>
              <option>ECE</option>
              <option>EEE</option>
              <option>MECH</option>
              <option>CIVIL</option>
            </select>
          </label>

          <label className="subject-input-container">
            <input
              type="text"
              placeholder="Enter Subject Name"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>

          <label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
            >
              <option value="">-- Select Exam Type --</option>
              <option>Mid-1</option>
              <option>Mid-2</option>
              <option>Semester</option>
            </select>
          </label>

          <label>
            <select
              value={paperSides}
              onChange={(e) => setPaperSides(e.target.value)}
            >
              <option value="">-- Exam Paper Sides --</option>
              <option value="one">One Side</option>
              <option value="two">Two Sides</option>
            </select>
          </label>
        </div>

        {/* ONE-SIDE UPLOAD */}
        {paperSides === "one" && (
          <div className="upload-box">
            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={(e) => {
                const file = e.dataTransfer.files[0];
                if (file?.type.startsWith("image/")) {
                  setFrontImage(file);
                  setFrontPreview(URL.createObjectURL(file));
                }
              }}
            >
              {frontImage ? (
                <div className="selected-file">
                  {frontPreview && (
                    <div className="image-preview">
                      <img src={frontPreview} alt="Preview" />
                    </div>
                  )}

                  <p>
                    <span className="check-icon">✓</span>
                    {frontImage.name}
                  </p>

                  <button
                    className="browse-button"
                    onClick={() => {
                      setFrontImage(null);
                      setFrontPreview(null);
                    }}
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <>
                  <p>Drag and drop your photo here</p>
                  <p>or</p>

                  <button
                    className="browse-button"
                    onClick={() => frontInputRef.current.click()}
                  >
                    Browse Photos
                  </button>

                  <input
                    type="file"
                    name="front"
                    ref={frontInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={(e) => {
                      setFrontImage(e.target.files[0]);
                      setFrontPreview(URL.createObjectURL(e.target.files[0]));
                    }}
                  />
                </>
              )}

              <p className="file-types">Supported formats: JPG, PNG</p>
            </div>
          </div>
        )}

        {/* TWO SIDES — HORIZONTAL LAYOUT */}
        {paperSides === "two" && (
          <div className="two-sides-wrapper">
            
            {/* FRONT SIDE BOX */}
            <div className="side-container">
              <h3>Front Side</h3>
              <div className="upload-box">
                <div
                  className="upload-area"
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    const file = e.dataTransfer.files[0];
                    if (file?.type.startsWith("image/")) {
                      setFrontImage(file);
                      setFrontPreview(URL.createObjectURL(file));
                    }
                  }}
                >
                  {frontImage ? (
                    <div className="selected-file">
                      {frontPreview && (
                        <div className="image-preview">
                          <img src={frontPreview} alt="Preview" />
                        </div>
                      )}

                      <p>
                        <span className="check-icon">✓</span>
                        {frontImage.name}
                      </p>

                      <button
                        className="browse-button"
                        onClick={() => {
                          setFrontImage(null);
                          setFrontPreview(null);
                        }}
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <>
                      <p>Drag & drop front side</p>
                      <p>or</p>
                      <button
                        className="browse-button"
                        onClick={() => frontInputRef.current.click()}
                      >
                        Browse Photos
                      </button>

                      <input
                        type="file"
                        name="front"
                        ref={frontInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => {
                          setFrontImage(e.target.files[0]);
                          setFrontPreview(URL.createObjectURL(e.target.files[0]));
                        }}
                      />
                    </>
                  )}

                  <p className="file-types">Supported formats: JPG, PNG</p>
                </div>
              </div>
            </div>

            {/* BACK SIDE BOX */}
            <div className="side-container">
              <h3>Back Side</h3>
              <div className="upload-box">
                <div
                  className="upload-area"
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    const file = e.dataTransfer.files[0];
                    if (file?.type.startsWith("image/")) {
                      setBackImage(file);
                      setBackPreview(URL.createObjectURL(file));
                    }
                  }}
                >
                  {backImage ? (
                    <div className="selected-file">
                      {backPreview && (
                        <div className="image-preview">
                          <img src={backPreview} alt="Preview" />
                        </div>
                      )}

                      <p>
                        <span className="check-icon">✓</span>
                        {backImage.name}
                      </p>

                      <button
                        className="browse-button"
                        onClick={() => {
                          setBackImage(null);
                          setBackPreview(null);
                        }}
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <>
                      <p>Drag & drop back side</p>
                      <p>or</p>
                      <button
                        className="browse-button"
                        onClick={() => backInputRef.current.click()}
                      >
                        Browse Photos
                      </button>

                      <input
                        type="file"
                        name="back"
                        ref={backInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => {
                          setBackImage(e.target.files[0]);
                          setBackPreview(URL.createObjectURL(e.target.files[0]));
                        }}
                      />
                    </>
                  )}

                  <p className="file-types">Supported formats: JPG, PNG</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Upload Button */}
        {degree &&
          regulation &&
          semester &&
          branch &&
          subject &&
          examType &&
          paperSides &&
          ((paperSides === "one" && frontImage) ||
            (paperSides === "two" && frontImage && backImage)) && (
            <div className="upload-paper-button-container">
              <button
                className="upload-paper-button"
                disabled={isUploading}
                onClick={handleUpload}
              >
                {isUploading ? "Uploading..." : "Upload Paper"}
              </button>
            </div>
          )}

      </div>

      <InfoBar />
    </div>
  );
};

export default Upload;
