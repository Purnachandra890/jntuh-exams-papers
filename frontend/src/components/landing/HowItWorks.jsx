import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <section className="how-it-works section section-bg-alt">
      <div className="container">
        <div className="hiw-header">
          <h2>How it works</h2>
          <p>Get your study material in three simple steps</p>
        </div>
        <div className="hiw-grid">
          <div className="hiw-step">
            <div className="step-number">1</div>
            <h3>Filter</h3>
            <p>Select your branch, year, and subject to easily sort through our database.</p>
          </div>
          <div className="hiw-step">
            <div className="step-number">2</div>
            <h3>Browse</h3>
            <p>View verified question papers matched exactly to your curriculum requirements.</p>
          </div>
          <div className="hiw-step">
            <div className="step-number">3</div>
            <h3>Download</h3>
            <p>Get instant access to the PDF in one click, zero logins or payment required.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
