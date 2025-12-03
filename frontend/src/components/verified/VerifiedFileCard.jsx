import React from "react";

const VerifiedFileCard = ({ file }) => {
  return (
    <div className="file-card">
      <h4>{file.subject || "Paper"}</h4>

      <p>
        Uploaded on:{" "}
        {new Date(file.createdAt).toLocaleDateString()}
      </p>

      <a
        href={file.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <button className="view-button">View / Download</button>
      </a>
    </div>
  );
};

export default VerifiedFileCard;
