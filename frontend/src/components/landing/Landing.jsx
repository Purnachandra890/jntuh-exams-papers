import React from 'react';
import Navbar from '../Navbar';
import Hero from './Hero';
import Stats from './Stats';
import HowItWorks from './HowItWorks';
import Features from './Features';
import FAQ from './FAQ';
import Footer from './Footer';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Landing;
