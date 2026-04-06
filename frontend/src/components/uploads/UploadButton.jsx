import React from "react";

const UploadButton = ({ canUpload, isUploading, handleUpload }) => {
  return (
    <button
      className="btn btn-primary btn-large"
      disabled={!canUpload || isUploading}
      onClick={handleUpload}
    >
      {isUploading ? "Uploading..." : "Upload Paper"}
    </button>
  );
};

export default UploadButton;
