import React, { useState, useEffect, useRef } from 'react';
import './Stats.css';

const easeOutQuart = (x) => {
  return 1 - Math.pow(1 - x, 4);
};

const AnimatedNumber = ({ end, duration = 2000, suffix = "+" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const currentVal = Math.floor(easeOutQuart(progress) * end);
      setCount(currentVal);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

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
            <h3 className="stat-number"><AnimatedNumber end={1000} /></h3>
            <p className="stat-label">Papers Uploaded</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number"><AnimatedNumber end={800} /></h3>
            <p className="stat-label">Downloads</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number"><AnimatedNumber end={50} /></h3>
            <p className="stat-label">Contributors</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
