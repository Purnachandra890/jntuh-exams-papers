import React from "react";

const UploadButton = ({ canUpload, isUploading, handleUpload }) => {
  if (!canUpload) return null; // don't show button if required fields missing

  return (
    <div className="upload-paper-button-container">
      <button
        className="upload-paper-button"
        disabled={isUploading}
        onClick={handleUpload}
      >
        {isUploading ? "Uploading..." : "Upload Paper"}
      </button>
    </div>
  );
};

export default UploadButton;
