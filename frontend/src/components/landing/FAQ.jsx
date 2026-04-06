import React, { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is JNTUH Papers platform?",
      answer: "It is a community-driven platform where students can find, download, and share previous year question papers for JNTUH easily."
    },
    {
      question: "Do I need to create an account to download?",
      answer: "No, you do not need an account. All downloads are free and accessible instantly without any login."
    },
    {
      question: "How can I trust the papers are accurate?",
      answer: "Every uploaded paper is manually reviewed by our administrative team. We verify the subject code, year, and content before it's listed on the site."
    },
    {
      question: "How do I upload a paper?",
      answer: "Click the 'Share Paper' button on the navigation bar, fill in the subject details, and select your PDF file. Once submitted, it will be reviewed and published."
    }
  ];

  return (
    <section id="faq" className="faq section section-bg-alt">
      <div className="container faq-container">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
