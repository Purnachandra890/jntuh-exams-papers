import React from 'react';
import './InfoBar.css';

const InfoBar = () => {
  return (
    <div className="info-bar">
      <p className="main-text">
        Built to make exam resources accessible. Verified via email for accuracy.
      </p>
      <div className="links">
        <a href="/contact">Contact</a>
        <span className="separator">|</span>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
        <span className="separator">|</span>
        <a href="/terms">Terms of Use</a>
      </div>
    </div>
  );
};

export default InfoBar;
