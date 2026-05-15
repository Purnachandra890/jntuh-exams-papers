import os
import chromadb
from sentence_transformers import SentenceTransformer
from app.config import settings

# Global instances to avoid reloading models/DB on every request
embedding_model = None
chroma_client = None

def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        os.makedirs(settings.MODEL_CACHE, exist_ok=True)
        embedding_model = SentenceTransformer(settings.MODEL_NAME, cache_folder=settings.MODEL_CACHE)
    return embedding_model

def get_chroma_client():
    global chroma_client
    if chroma_client is None:
        chroma_client = chromadb.PersistentClient(path=settings.PERSIST_DIR)
    return chroma_client

def get_chroma_collection():
    client = get_chroma_client()
    try:
        return client.get_collection(settings.COLLECTION_NAME)
    except Exception:
        return None
