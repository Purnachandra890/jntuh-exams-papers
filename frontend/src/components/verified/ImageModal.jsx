import React, { useState, useEffect } from "react";
import "./ImageModal.css";

const ImageModal = ({ fileUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => {
      if (document.hasFocus()) setIsBlurred(false);
    };
    
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        alert("Printing is disabled for security reasons.");
      }
      // Aggressive check for Mac/Win screenshot shortcuts
      if ((e.metaKey && e.shiftKey) || e.key === 'PrintScreen') {
        setIsBlurred(true);
        try { navigator.clipboard.writeText(''); } catch(err) {}
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        setIsBlurred(true);
        try { navigator.clipboard.writeText(''); } catch(err) {}
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState !== 'visible') {
        setIsBlurred(true);
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mouseleave", handleBlur); // Blur if mouse leaves browser

    // Initial check
    if (!document.hasFocus()) {
      setIsBlurred(true);
    }

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mouseleave", handleBlur);
    };
  }, []);

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

        <div className={`modal-image-container ${isLoading ? 'hidden' : ''} ${isBlurred ? 'blurred' : ''}`}>
          <img 
            src={fileUrl} 
            alt="Exam Paper" 
            className="modal-image" 
            onLoad={() => setIsLoading(false)}
            onContextMenu={(e) => e.preventDefault()} /* Disable right-click */
            onDragStart={(e) => e.preventDefault()} /* Disable drag */
          />
          {isBlurred && (
            <div className="blur-overlay-message">
              <div className="blur-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3>Protection Active</h3>
              <p>Please click inside the window to view the paper.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
