import React, { useState } from "react";
import "./ChatbotTipToast.css";

export default function ChatbotTipToast() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <aside
      className="bottom-left-toast animate-slide-up"
      role="status"
      aria-live="polite"
    >
      <div className="toast-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3C7.03 3 3 6.58 3 11c0 2.27 1.07 4.33 2.82 5.8L4.5 20.5l4.2-1.18A8.96 8.96 0 0012 19c4.97 0 9-3.58 9-8s-4.03-8-9-8z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 11h.01M12 11h.01M15.5 11h.01"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="toast-content">
        <p className="toast-title">Can't find your papers?</p>
        <p className="toast-message">
          If papers are not available through searching, please use our chatbot to get exam papers using the subject name <strong>ACA</strong>, <strong>ECC</strong>.
        </p>
        <div className="toast-actions">
          <button
            type="button"
            className="toast-action-btn"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent("open-chatbot", { detail: { query: "ACA" } })
              );
            }}
          >
            Ask ACA
          </button>
          <button
            type="button"
            className="toast-action-btn"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent("open-chatbot", { detail: { query: "ECC" } })
              );
            }}
          >
            Ask ECC
          </button>
          <button
            type="button"
            className="toast-action-btn toast-action-btn--primary"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-chatbot"));
            }}
          >
            Open Chatbot
          </button>
        </div>
      </div>
      <button
        type="button"
        className="toast-close-btn"
        onClick={() => setVisible(false)}
        aria-label="Close notification"
      >
        &times;
      </button>
    </aside>
  );
}
