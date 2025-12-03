import React from "react";
import VerifiedFileCard from "./VerifiedFileCard";

const VerifiedFileList = ({ loading, error, showSlowMessage, files, filtersSelected }) => {
  // Show loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p>Loading files...</p>
        {showSlowMessage && (
          <p style={{ color: "#555", marginTop: "8px" }}>
            If this is your first request, please wait 10 seconds for the server
            to wake up.
          </p>
        )}
      </div>
    );
  }

  // Show error message
  if (error) {
    return <p className="error-message">{error}</p>;
  }

  // Show empty message
  if (filtersSelected && files.length === 0) {
    return <p>No files found for the selected criteria.</p>;
  }

  // Show exam papers
  return (
    <div className="file-list">
      {files.map((file) => (
        <VerifiedFileCard key={file._id} file={file} />
      ))}
    </div>
  );
};

export default VerifiedFileList;
