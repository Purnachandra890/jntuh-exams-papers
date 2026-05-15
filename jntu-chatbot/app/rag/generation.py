from groq import Groq
from app.config import settings

def get_llm():
    return Groq(api_key=settings.GROQ_API_KEY)

def generate_answer(query: str, retrieved_docs: list) -> str:
    context = "\n\n".join([f"Source: {doc['fileUrl']}\nContent: {doc['document']}" for doc in retrieved_docs]) if retrieved_docs else ""

    # if not context:
    #     return "We found no relevant context for the given query."

    prompt = f"""
You are an intelligent university exam paper assistant.

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

CONTEXT:
{context}

USER QUERY:
{query}

ANSWER:
"""
    client = get_llm()
    response = client.chat.completions.create(
        model=settings.LLM_MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=1000,
    )
    return response.choices[0].message.content or ""
