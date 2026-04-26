import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero section">
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title animate-fade-in-up">
            Find your university exam papers <span className="hero-highlight">instantly.</span>
          </h1>
          <p className="hero-subtitle animate-fade-in-up animate-delay-1">
            Browse, download, and share verified JNTUH question papers — no login required.
          </p>
          <div className="hero-actions animate-fade-in-up animate-delay-2">
            <Link to="/verified-papers" className="btn btn-primary hero-btn">
              Browse Papers
            </Link>
            <Link to="/upload" className="btn btn-outline hero-btn">
              Upload Papers
            </Link>
          </div>
        </div>
        <div className="hero-visual animate-fade-in-scale animate-delay-3">
          <div className="phones-wrapper">
             {/* Replace the src below with your actual image file (e.g., phones.png) once added to the public folder */}
             <img 
               src="/phones.png" 
               alt="JNTUH Exams App on Phones" 
               className="phones-mockup" 
             />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
