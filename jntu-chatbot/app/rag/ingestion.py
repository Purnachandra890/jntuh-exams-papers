import json
import os
import logging
from app.config import settings
from app.rag.dependencies import get_embedding_model, get_chroma_client

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
    if not papers:
        logger.info("No papers to ingest.")
        return

    client = get_chroma_client()
    try:
        collection = client.get_collection(settings.COLLECTION_NAME)
        if collection.count() > 0:
            logger.info(f"Collection {settings.COLLECTION_NAME} already exists with {collection.count()} docs. Skipping ingestion.")
            return collection
    except Exception:
        pass

    documents = [paper_to_text(paper) for paper in papers]
    metadatas = [paper_to_metadata(paper) for paper in papers]
    ids = [
        metadata["_id"] if metadata["_id"] else f"paper_{i}"
        for i, metadata in enumerate(metadatas)
    ]

    logger.info("Loading model and generating embeddings...")
    model = get_embedding_model()
    embeddings = model.encode(documents, show_progress_bar=False).tolist()

    try:
        client.delete_collection(settings.COLLECTION_NAME)
        logger.info("Old collection deleted.")
    except Exception:
        logger.info("No old collection found.")

    collection = client.create_collection(name=settings.COLLECTION_NAME)

    logger.info("Adding documents to Chroma...")
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings,
    )
    
    logger.info(f"Ingestion complete. {collection.count()} documents added.")
    return collection
