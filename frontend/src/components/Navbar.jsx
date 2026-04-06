import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar if scrolling up or at the very top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } 
      // Hide navbar if scrolling down and past the threshold
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`navbar ${isVisible ? '' : 'navbar--hidden'}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          JNTUH <span className="logo-accent">Papers</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/verified-papers" className="nav-link">Papers</Link>
          <Link to="/upload" className="nav-link">Upload</Link>
          <a href="#faq" className="nav-link">FAQ</a>
        </div>
        <div className="navbar-actions">
          <Link to="/upload" className="btn btn-primary nav-upload-btn">
            Share Paper
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
