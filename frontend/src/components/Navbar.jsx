import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const isActive = (path) => location.pathname === path;

  // configure these
  const reportEmail = 'purnachandra.n17@gmail.com';
  const reportSubject = 'Bug Report';
  const reportBody = 'Hi,\n\nI found a bug in your app.\nplease write here \n\nThanks,\n';

  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(reportEmail)}&su=${encodeURIComponent(reportSubject)}&body=${encodeURIComponent(reportBody)}`;

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src="/logo.png" alt="Logo" className="logo-image" />
      </Link>

      <button
        className={`menu-button ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <li><Link to="/" className={isActive('/') ? 'active-link' : ''} onClick={() => setIsMenuOpen(false)}>Home</Link></li>
        <li><Link to="/verified-papers" className={isActive('/verified-papers') ? 'active-link' : ''} onClick={() => setIsMenuOpen(false)}>Verified Papers</Link></li>
        <li>
          <a
            href={gmailHref}
            target="_blank"
            rel="noopener noreferrer"
            className={isActive('/report-bug') ? 'active-link' : ''}
            onClick={() => setIsMenuOpen(false)}
          >
            Report Bug
          </a>
        </li>
        <li><Link to="/" className={isActive('/about') ? 'active-link' : ''} onClick={() => setIsMenuOpen(false)}>About Us</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
