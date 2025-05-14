import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); // to detect current path

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="logo"><img src="/logo.png" alt="Logo" className="logo-image" /></Link>

      <button 
        className={`menu-button ${isMenuOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <li><Link to="/" className={isActive('/') ? 'active-link' : ''}>Home</Link></li>
        <li><Link to="/upload" className={isActive('/upload') ? 'active-link' : ''}>Upload</Link></li>
        <li><Link to="/verified-papers" className={isActive('/verified-papers') ? 'active-link' : ''}>Verified Papers</Link></li>
        <li><Link to="/" className={isActive('/about') ? 'active-link' : ''}>About</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
