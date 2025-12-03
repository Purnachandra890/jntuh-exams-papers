import React from "react";

const BackButton = ({ onClick }) => {
  return (
    <div className="back-button-container">
      <button className="back-button" onClick={onClick}>
        ← Back
      </button>
    </div>
  );
};

export default BackButton;
