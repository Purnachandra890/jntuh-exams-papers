import React, { useState } from "react";
import "./ImageModal.css";

const ImageModal = ({ fileUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!fileUrl) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
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
