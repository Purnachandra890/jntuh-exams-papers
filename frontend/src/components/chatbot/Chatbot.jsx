import { useCallback, useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../../services/chatApi";
import MessageBubble from "./MessageBubble";
import "./Chatbot.css";

const EXAMPLE_QUERIES = [
  "AI previous papers",
  "DevOps",
  "DBMS",
];

const PLACEHOLDER_SUBJECTS = [
  "Operating System",
  "Advanced algorithm",
  "Data structure",
  "Discrete Mathematics",
  "Software Engineering",
];

let messageId = 0;
function nextId() {
  messageId += 1;
  return messageId;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_SUBJECTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, open, scrollToBottom]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text },
    ]);
    setLoading(true);

    try {
      const { answer, sources } = await sendChatMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          text: answer,
          sources,
        },
      ]);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "error", text: msg },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const applyExample = (q) => {
    setInput(q);
    inputRef.current?.focus();
  };

  return (
    <div className="chatbot-root" aria-live="polite">
      <button
        type="button"
        className={`chatbot-fab ${open ? "chatbot-fab--hidden" : ""}`}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="chatbot-panel"
        title="Open assistant"
      >
        <span className="chatbot-fab__icon" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C7.03 3 3 6.58 3 11c0 2.27 1.07 4.33 2.82 5.8L4.5 20.5l4.2-1.18A8.96 8.96 0 0012 19c4.97 0 9-3.58 9-8s-4.03-8-9-8z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M8.5 11h.01M12 11h.01M15.5 11h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="chatbot-fab__pulse" aria-hidden="true" />
      </button>

      <div
        id="chatbot-panel"
        className={`chatbot-panel ${open ? "chatbot-panel--open" : ""}`}
        role="dialog"
        aria-label="Exam paper assistant"
        aria-modal="false"
        aria-hidden={!open}
        inert={!open}
      >
        <header className="chatbot-header">
          <div className="chatbot-header__titles">
            <span className="chatbot-header__badge" aria-hidden="true" />
            <div>
              <h2 className="chatbot-header__title">Paper Assistant</h2>
              <p className="chatbot-header__subtitle">
                Ask about JNTUH exam papers
              </p>
            </div>
          </div>
          <button
            type="button"
            className="chatbot-close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="chatbot-body">
          <div className="chatbot-messages" ref={listRef}>
            {messages.length === 0 && !loading && (
              <div className="chatbot-empty">
                <p className="chatbot-empty__title">Hi there</p>
                <p className="chatbot-empty__text">
                  I can help you find previous exam papers. Try one of
                  these:
                </p>
                <div className="chatbot-chips">
                  {EXAMPLE_QUERIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className="chatbot-chip"
                      onClick={() => applyExample(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role === "assistant" ? "assistant" : m.role}
                text={m.text}
                sources={m.sources}
              />
            ))}
            {loading && (
              <div className="chatbot-loading" aria-busy="true">
                <span className="chatbot-loading__dot" />
                <span className="chatbot-loading__dot" />
                <span className="chatbot-loading__dot" />
                <span className="visually-hidden">Assistant is typing</span>
              </div>
            )}
          </div>

          <div className="chatbot-composer">
            <div className="chatbot-input-row">
              <div className="chatbot-input-container">
                <input
                  ref={inputRef}
                  className="chatbot-input"
                  placeholder=""
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={loading}
                  maxLength={2000}
                  autoComplete="off"
                />
                {!input && (
                  <span key={placeholderIndex} className="chatbot-placeholder-animate">
                    {PLACEHOLDER_SUBJECTS[placeholderIndex]} exam papers
                  </span>
                )}
              </div>
              <button
                type="button"
                className="chatbot-send"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 12l16-8-8 16-2-6-6-2z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
