import "./MessageBubble.css";

const EXAM_PAPER_LINK_TEXT = "Click here to visit the exam paper";

function stripThinkingTags(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/<(think|thought|reasoning)>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(think|thought|reasoning)>[\s\S]*/gi, "")
    .replace(/<\/?(think|thought|reasoning)>/gi, "")
    .trim();
}

/**
 * Split plain text into segments; URLs become clickable links (no markdown).
 */
function splitTextWithLinks(text) {
  if (!text) return [];
  text = stripThinkingTags(text);
  if (!text) return [];
  // Ensure list items start on a new line
  text = text.replace(/([^\n])\s+(\d+\.\s)/g, '$1\n\n$2');

  const re = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
  const parts = [];
  let last = 0;
  let match;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }
    let href = match[1];
    let trailing = "";
    while (/[.,;:!?)]+$/.test(href)) {
      trailing = href.slice(-1) + trailing;
      href = href.slice(0, -1);
    }
    parts.push({ type: "link", value: href });
    if (trailing) {
      parts.push({ type: "text", value: trailing });
    }
    last = match.index + match[1].length;
  }
  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }
  return parts.length ? parts : [{ type: "text", value: text }];
}

function LinkifiedText({ text }) {
  const parts = splitTextWithLinks(text);
  return (
    <span className="message-bubble__plain">
      {parts.map((part, i) =>
        part.type === "link" ? (
          <a
            key={i}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className="message-bubble__link"
          >
            {EXAM_PAPER_LINK_TEXT}
          </a>
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </span>
  );
}

function normalizeSource(source, index) {
  if (typeof source === "string") {
    const trimmed = source.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return { key: `s-${index}`, label: EXAM_PAPER_LINK_TEXT, href: trimmed };
    }
    return { key: `s-${index}`, label: trimmed, href: null };
  }
  if (source && typeof source === "object") {
    const href =
      typeof source.url === "string"
        ? source.url
        : typeof source.href === "string"
          ? source.href
          : typeof source.link === "string"
            ? source.link
            : null;
    const label =
      typeof source.title === "string"
        ? source.title
        : typeof source.name === "string"
          ? source.name
          : href
            ? EXAM_PAPER_LINK_TEXT
            : `Source ${index + 1}`;
    return { key: `s-${index}`, label, href };
  }
  return { key: `s-${index}`, label: String(source), href: null };
}

/**
 * @param {{ role: 'user' | 'assistant' | 'error'; text: string; sources?: unknown[] }} props
 */
export default function MessageBubble({ role, text, sources = [] }) {
  const isUser = role === "user";
  const isError = role === "error";

  return (
    <div
      className={`message-bubble message-bubble--${isUser ? "user" : "bot"}${isError ? " message-bubble--error" : ""}`}
      role="article"
    >
      <div className="message-bubble__content">
        <LinkifiedText text={text} />
      </div>
      {false && (
        <ul className="message-bubble__sources">
          {sources.map((src, i) => {
            const item = normalizeSource(src, i);
            return (
              <li key={item.key} className="message-bubble__source-item">
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="message-bubble__link"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
