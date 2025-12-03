import React from "react";
import FileUploadBox from "./FileUploadBox";

const UploadOneSide = ({
  frontImage,
  setFrontImage,
  frontPreview,
  setFrontPreview,
  frontInputRef,
}) => {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <FileUploadBox
        label="Upload Exam Paper"
        file={frontImage}
        setFile={setFrontImage}
        preview={frontPreview}
        setPreview={setFrontPreview}
        inputRef={frontInputRef}
      />
    </div>
  );
};

export default UploadOneSide;
