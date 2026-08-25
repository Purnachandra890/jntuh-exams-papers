/**
 * Chat with the RAG exam-paper assistant (FastAPI).
 * Set VITE_CHATBOT_BASE_URL in .env (default: http://127.0.0.1:8000).
 */

const getBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_CHATBOT_BASE_URL;
  if (fromEnv && typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://127.0.0.1:8000";
};

export function stripThinkingTags(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/<(think|thought|reasoning)>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(think|thought|reasoning)>[\s\S]*/gi, "")
    .replace(/<\/?(think|thought|reasoning)>/gi, "")
    .trim();
}

/**
 * @param {string} query
 * @returns {Promise<{ success: boolean, answer?: string, sources?: unknown[] }>}
 */
export async function sendChatMessage(query) {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Please enter a question.");
  }

  const url = `${getBaseUrl()}/chat`;
  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: trimmed }),
    });
  } catch (networkError) {
    const message =
      networkError instanceof Error
        ? networkError.message
        : "Network error";
    throw new Error(
      `Could not reach the assistant (${message}). Is the FastAPI server running?`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an unexpected response.");
  }

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
          ? data.detail.map((d) => d?.msg || d).join(" ")
          : data?.message;
    throw new Error(
      detail || `Request failed with status ${response.status}.`
    );
  }

  if (!data || data.success !== true) {
    const msg =
      typeof data?.message === "string"
        ? data.message
        : "The assistant could not complete this request.";
    throw new Error(msg);
  }

  if (typeof data.answer !== "string") {
    throw new Error("The assistant returned an empty answer.");
  }

  const cleanedAnswer = stripThinkingTags(data.answer);

  return {
    success: true,
    answer: cleanedAnswer || "I couldn't find an answer for that request.",
    sources: Array.isArray(data.sources) ? data.sources : [],
  };
}

