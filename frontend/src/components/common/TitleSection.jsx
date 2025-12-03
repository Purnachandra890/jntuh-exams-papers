import React from "react";

const TitleSection = ({ title, subtitle }) => {
  return (
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <h1 style={{ fontSize: "2rem", color: "#333", marginBottom: "10px" }}>
        {title}
      </h1>

      {subtitle && (
        <p style={{ fontSize: "1rem", color: "#555" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default TitleSection;
