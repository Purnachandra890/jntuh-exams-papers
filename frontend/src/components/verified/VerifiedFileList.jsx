import React, { useState } from "react";
import VerifiedFileCard from "./VerifiedFileCard";
import ImageModal from "./ImageModal";

const VerifiedFileList = ({ loading, error, showSlowMessage, files, filtersSelected }) => {
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);

  if (loading) {
    return (
      <div className="status-message">
        <div className="spinner"></div>
        <p>Searching for papers...</p>
        {showSlowMessage && (
          <p className="slow-message">
            Our free servers might be waking up. Thanks for your patience!
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (filtersSelected && files.length === 0) {
    return (
      <div className="empty-state">
        <p>No verified papers found for the selected criteria.</p>
        <p className="text-muted">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <>
      <div className="file-list-grid">
        {files.map((file) => (
          <VerifiedFileCard key={file._id} file={file} onOpenModal={setSelectedFileUrl} />
        ))}
      </div>

      <ImageModal 
        fileUrl={selectedFileUrl} 
        onClose={() => setSelectedFileUrl(null)} 
      />
    </>
  );
};

export default VerifiedFileList;
