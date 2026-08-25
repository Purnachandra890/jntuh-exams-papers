import re
from groq import Groq
from app.config import settings

def get_llm():
    return Groq(api_key=settings.GROQ_API_KEY)

def clean_llm_response(text: str) -> str:
    """Remove any thinking/reasoning tags and internal thoughts from LLM output."""
    if not text:
        return ""
    # Remove closed thinking/reasoning tags
    cleaned = re.sub(r"<(think|thought|reasoning)>[\s\S]*?</\1>", "", text, flags=re.IGNORECASE)
    # Remove unclosed thinking tag in case of token cutoff
    cleaned = re.sub(r"<(think|thought|reasoning)>[\s\S]*", "", cleaned, flags=re.IGNORECASE)
    # Remove stray opening or closing tags
    cleaned = re.sub(r"</?(think|thought|reasoning)>", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()

SYSTEM_PROMPT = """You are an intelligent university exam paper assistant for JNTUH.
Your job is to help students find relevant exam papers using ONLY the provided context.

RULES:
1. Answer ONLY from the given context.
2. Do NOT make up papers, subjects, URLs, semesters, or branches.
3. If relevant papers are found:
   - Mention the subject name
   - Mention branch, semester, exam type if available
   - Provide the file URL clearly
4. If multiple papers are relevant, show them as a numbered list.
5. If exam-paper-related query has no relevant papers, politely say no matching papers were found.
6. If the user greets or thanks you, respond naturally and briefly.
7. If the user asks unrelated questions, politely explain that you only help with JNTUH exam paper searches.
8. Keep responses concise and friendly.
9. Never hallucinate or generate fake information.
10. Output ONLY the final response for the user. Do NOT include any internal thoughts, chain of thought, reasoning process, or <think> tags."""

def generate_answer(query: str, retrieved_docs: list) -> str:
    context = "\n\n".join([f"Source: {doc['fileUrl']}\nContent: {doc['document']}" for doc in retrieved_docs]) if retrieved_docs else "No exam papers found for this query."

    user_prompt = f"""CONTEXT:
{context}

USER QUERY:
{query}

ANSWER:"""

    client = get_llm()
    response = client.chat.completions.create(
        model=settings.LLM_MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,
        max_tokens=1000,
    )
    raw_content = response.choices[0].message.content or ""
    return clean_llm_response(raw_content)

