import React from "react";

const VerifiedFileCard = ({ file, onOpenModal }) => {
  return (
    <div className="file-card">
      <div className="file-card-content">
        <div className="file-card-header">
          <svg className="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4>{file.subject || "Exam Paper"}</h4>
          <span className="verified-badge">
             <span className="badge-dot"></span> Verified
          </span>
        </div>
        
        <p className="file-date">
          <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Uploaded: {new Date(file.createdAt).toLocaleDateString()}
        </p>
      </div>

      <button className="btn btn-primary view-button" onClick={() => onOpenModal(file.fileUrl)}>
        View File
      </button>
    </div>
  );
};

export default VerifiedFileCard;
