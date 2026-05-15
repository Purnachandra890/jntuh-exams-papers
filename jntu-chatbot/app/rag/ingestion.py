import json
import os
import logging
from app.config import settings

logger = logging.getLogger(__name__)

def load_exam_papers(path):
    if not os.path.exists(path):
        logger.warning(f"Data file {path} not found. Skipping ingestion.")
        return []

    with open(path, "r", encoding="utf-8") as f:
        text = f.read().strip()

    if not text:
        return []

    if text.startswith("["):
        papers = json.loads(text)
    else:
        papers = json.loads("[" + text.rstrip(",") + "]")

    return papers

def clean_value(value):
    if value is None:
        return ""
    return str(value).strip()

def paper_to_text(paper):
    return f"""
Subject: {clean_value(paper.get("subject"))}
Degree: {clean_value(paper.get("degree"))}
Regulation: {clean_value(paper.get("regulation"))}
Semester: {clean_value(paper.get("semester"))}
Branch: {clean_value(paper.get("branch"))}
Exam Type: {clean_value(paper.get("examType", paper.get("examtype")))}
Status: {clean_value(paper.get("status"))}
""".strip()

def paper_to_metadata(paper):
    return {
        "_id": clean_value(paper.get("_id")),
        "fileUrl": clean_value(paper.get("fileUrl")),
        "subject": clean_value(paper.get("subject")),
        "degree": clean_value(paper.get("degree")),
        "regulation": clean_value(paper.get("regulation")),
        "semester": clean_value(paper.get("semester")),
        "branch": clean_value(paper.get("branch")),
        "examType": clean_value(paper.get("examType", paper.get("examtype"))),
        "status": clean_value(paper.get("status")),
        "createdAt": clean_value(paper.get("createdAt")),
        "updatedAt": clean_value(paper.get("updatedAt")),
    }

def ingest_data():
    papers = load_exam_papers(settings.DATA_FILE)
    logger.info("Loaded %s papers from %s.", len(papers), settings.DATA_FILE)
    return papers
