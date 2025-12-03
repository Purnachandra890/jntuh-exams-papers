import React from "react";
import FileUploadBox from "./FileUploadBox";

const UploadTwoSides = ({
  frontImage,
  setFrontImage,
  frontPreview,
  setFrontPreview,
  frontInputRef,
  backImage,
  setBackImage,
  backPreview,
  setBackPreview,
  backInputRef,
}) => {
  return (
    <div className="two-sides-wrapper">

      {/* Front side */}
      <FileUploadBox
        label="Front Side"
        file={frontImage}
        setFile={setFrontImage}
        preview={frontPreview}
        setPreview={setFrontPreview}
        inputRef={frontInputRef}
      />

      {/* Back side */}
      <FileUploadBox
        label="Back Side"
        file={backImage}
        setFile={setBackImage}
        preview={backPreview}
        setPreview={setBackPreview}
        inputRef={backInputRef}
      />
    </div>
  );
};

export default UploadTwoSides;
