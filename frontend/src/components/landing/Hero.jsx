import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero section">
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Find your university exam papers <span className="hero-highlight">instantly.</span>
          </h1>
          <p className="hero-subtitle">
            Browse, download, and share verified JNTUH question papers — no login required.
          </p>
          <div className="hero-actions">
            <Link to="/verified-papers" className="btn btn-primary hero-btn">
              Browse Papers
            </Link>
            <Link to="/upload" className="btn btn-outline hero-btn">
              Upload Papers
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          {/* Simulated UI Mockup */ }
          <div className="mockup-window">
             <div className="mockup-header">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
             </div>
             <div className="mockup-body">
                <div className="mockup-sidebar"></div>
                <div className="mockup-content">
                   <div className="mockup-card">
                      <div className="mock-card-title"></div>
                      <div className="mock-card-line"></div>
                      <div className="mock-card-line short"></div>
                   </div>
                   <div className="mockup-card">
                      <div className="mock-card-title"></div>
                      <div className="mock-card-line"></div>
                      <div className="mock-card-line short"></div>
                   </div>
                   <div className="mockup-card">
                      <div className="mock-card-title"></div>
                      <div className="mock-card-line"></div>
                      <div className="mock-card-line short"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
