import React, { useState } from "react";
import "./ImageModal.css";

const ImageModal = ({ fileUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!fileUrl) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {isLoading && (
          <div className="modal-loader">
            <div className="modern-spinner"></div>
            <span className="loader-text">Loading paper...</span>
          </div>
        )}

        <div className={`modal-image-container ${isLoading ? 'hidden' : ''}`}>
          <img 
            src={fileUrl} 
            alt="Exam Paper" 
            className="modal-image" 
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
