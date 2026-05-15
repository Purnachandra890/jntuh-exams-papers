from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.models import ChatRequest, ChatResponse
from app.rag.ingestion import ingest_data
from app.rag.retrieval import retrieve_papers
from app.rag.generation import generate_answer
from app.rag.dependencies import get_embedding_model, get_chroma_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Starting up... Initializing RAG components.")
    # Initialize models and ChromaDB, and run ingestion
    get_embedding_model()
    get_chroma_client()
    ingest_data()
    logger.info("Startup complete.")
    yield
    # Shutdown actions
    logger.info("Shutting down...")

app = FastAPI(
    title="RAG Exam Paper API",
    description="FastAPI backend for retrieving university exam papers.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development. Restrict this in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Retrieve relevant papers
        results = retrieve_papers(request.query, top_k=5)
        
        # Generate answer using LLM
        answer = generate_answer(request.query, results)
        
        return ChatResponse(
            success=True,
            answer=answer,
            sources=results
        )
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request."
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
