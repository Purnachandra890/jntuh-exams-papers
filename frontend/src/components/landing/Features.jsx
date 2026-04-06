import React from 'react';
import './Features.css';

const Features = () => {
  return (
    <section className="features section">
      <div className="container">
        <div className="features-header">
          <h2>Why choose us?</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Easy Upload</h3>
            <p>Contribute to the community effortlessly without creating an account.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Verified Papers</h3>
            <p>Our admin manually verifies each submission for absolute accuracy.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast Access</h3>
            <p>Zero wait times. Find and download what you need instantly.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
