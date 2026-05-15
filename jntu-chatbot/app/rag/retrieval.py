import re
from collections import Counter
from app.rag.dependencies import get_paper_index

STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "can", "for", "from",
    "give", "i", "in", "is", "me", "need", "of", "on", "paper", "papers",
    "question", "questions", "show", "the", "to", "want", "with",
}

FIELD_WEIGHTS = {
    "subject": 6,
    "branch": 4,
    "semester": 4,
    "examType": 4,
    "degree": 3,
    "regulation": 3,
    "status": 2,
}

def tokenize(text: str) -> list[str]:
    return [
        token
        for token in re.findall(r"[a-z0-9]+", text.lower())
        if token not in STOP_WORDS and (len(token) > 1 or token.isdigit())
    ]

def contains_value(query_text: str, value: str) -> bool:
    normalized = " ".join(tokenize(value))
    if not normalized:
        return False
    return re.search(rf"(?<![a-z0-9]){re.escape(normalized)}(?![a-z0-9])", query_text) is not None

def score_paper(query_tokens: list[str], query_text: str, paper: dict) -> float:
    metadata = paper["metadata"]
    document = paper["document"].lower()
    document_tokens = Counter(tokenize(document))

    score = 0.0
    for token in query_tokens:
        score += document_tokens[token]
        for field, weight in FIELD_WEIGHTS.items():
            value = str(metadata.get(field) or "").lower()
            if token in tokenize(value):
                score += weight

    subject = str(metadata.get("subject") or "").lower()
    branch = str(metadata.get("branch") or "").lower()
    if contains_value(query_text, subject):
        score += 12
    if contains_value(query_text, branch):
        score += 8

    return score

def retrieve_papers(query: str, top_k: int = 5):
    index = get_paper_index()
    query_text = query.lower()
    query_tokens = tokenize(query)

    if not index or not query_tokens:
        return []

    scored = [
        (score_paper(query_tokens, query_text, paper), paper)
        for paper in index
    ]
    matches = [
        (score, paper)
        for score, paper in sorted(scored, key=lambda item: item[0], reverse=True)
        if score > 0
    ][:top_k]

    max_score = matches[0][0] if matches else 1
    output = []
    for score, paper in matches:
        metadata = paper["metadata"]
        output.append({
            "id": paper["id"],
            "subject": metadata.get("subject"),
            "branch": metadata.get("branch"),
            "semester": metadata.get("semester"),
            "examType": metadata.get("examType"),
            "status": metadata.get("status"),
            "fileUrl": metadata.get("fileUrl"),
            "distance": round(1 - (score / max_score), 4),
            "document": paper["document"],
        })

    return output
