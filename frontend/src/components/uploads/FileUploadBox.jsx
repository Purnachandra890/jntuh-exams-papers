import React from "react";

const FileUploadBox = ({
  label,
  file,
  setFile,
  preview,
  setPreview,
  inputRef,
  onDropFile,
}) => {
  return (
    <div className="upload-box">
      <h3>{label}</h3>

      <div
        className="upload-area"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile?.type.startsWith("image/")) {
            setFile(droppedFile);
            setPreview(URL.createObjectURL(droppedFile));
          }
        }}
      >
        {/* If file exists, show preview + remove */}
        {file ? (
          <div className="selected-file">
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" />
              </div>
            )}

            <p>
              <span className="check-icon">✓</span>
              {file.name}
            </p>

            <button
              className="browse-button"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              Remove File
            </button>
          </div>
        ) : (
          // If file not selected, show upload box UI
          <>
            <p>Drag & drop your photo here</p>
            <p>or</p>

            <button
              className="browse-button"
              onClick={() => inputRef.current.click()}
            >
              Browse Photos
            </button>

            <input
              type="file"
              ref={inputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={(e) => {
                const selected = e.target.files[0];
                if (selected) {
                  setFile(selected);
                  setPreview(URL.createObjectURL(selected));
                }
              }}
            />
          </>
        )}

        <p className="file-types">Supported formats: JPG, PNG</p>
      </div>
    </div>
  );
};

export default FileUploadBox;
