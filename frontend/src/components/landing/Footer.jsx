import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 className="footer-logo">JNTUH <span className="logo-accent">Papers</span></h3>
            <p className="footer-desc">
              Built to make exam resources accessible to everyone. Verified via email for absolute accuracy.
            </p>
          </div>
          <div className="footer-links">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/verified-papers">Browse Papers</Link></li>
              <li><Link to="/upload">Upload Papers</Link></li>
              <li><Link to="/">Home</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="/terms">Terms of Use</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Connect</h4>
            <ul>
              <li><a href="/contact">Contact Support</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub Source</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} JNTUH Papers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
