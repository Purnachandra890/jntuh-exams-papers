import React from "react";

const FileUploadBox = ({
  label,
  file,
  setFile,
  preview,
  setPreview,
  inputRef,
}) => {
  return (
    <div className="upload-box">
      <h3>{label}</h3>

      <div
        className={`upload-area ${file ? "has-file" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("drag-active");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("drag-active");
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("drag-active");
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile?.type.startsWith("image/")) {
            setFile(droppedFile);
            setPreview(URL.createObjectURL(droppedFile));
          }
        }}
        onClick={() => {
          if (!file) inputRef.current.click();
        }}
      >
        {file ? (
          <div className="selected-file" onClick={(e) => e.stopPropagation()}>
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" />
              </div>
            )}

            <p className="file-name">
              <span className="check-icon">✓</span>
              {file.name}
            </p>

            <button
              type="button"
              className="browse-button"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              Remove Image
            </button>
          </div>
        ) : (
          <>
            <svg className="upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 14.9V5.5l-2.6 2.6L7 6.7 12 1.7l5 5-1.4 1.4-2.6-2.6v9.4h-2zm-6.6 4.3v-3.7H3v3.7c0 .6.2 1.2.7 1.6.4.5 1 .7 1.6.7h13.4c.6 0 1.2-.2 1.6-.7.5-.4.7-1 .7-1.6v-3.7h-1.4v3.7c0 .2-.1.4-.2.6-.2.1-.4.2-.6.2H5.3c-.2 0-.4-.1-.6-.2-.1-.2-.2-.4-.2-.6z"/>
            </svg>
            <p>Drag & drop your image here</p>
            <p className="file-types">or click to browse from device</p>

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
      </div>
    </div>
  );
};

export default FileUploadBox;
