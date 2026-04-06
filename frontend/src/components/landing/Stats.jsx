import React from 'react';
import './Stats.css';

const Stats = () => {
  return (
    <section className="stats section">
      <div className="container">
        <div className="stats-header">
          <h2 className="stats-title">Trusted by students everywhere</h2>
          <p className="stats-subtitle">No more planning around your study time. Verified papers always available.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-number">1,000+</h3>
            <p className="stat-label">Papers Uploaded</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">800+</h3>
            <p className="stat-label">Downloads</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">500+</h3>
            <p className="stat-label">Contributors</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
