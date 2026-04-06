import React from "react";
import "./ImageModal.css";

const ImageModal = ({ fileUrl, onClose }) => {
  if (!fileUrl) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="modal-image-container">
          <img src={fileUrl} alt="Exam Paper" className="modal-image" />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
