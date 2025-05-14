import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <div className="header">
      <h1>Upload and Share Exam Papers Instantly</h1>
      <p className="subtitle">
        No login required. Help students by sharing question papers. Our admin
        verifies each submission via email!
      </p>
      <Link to="/upload" className="upload-button">
        Upload Now
      </Link>
    </div>
  );
};

export default Header;
