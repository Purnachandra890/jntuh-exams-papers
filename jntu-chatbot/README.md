# RAG Exam Paper Backend

FastAPI backend for retrieving JNTUH exam papers with a lightweight search pipeline and Groq for response generation. This version is designed to fit low-memory hosts such as Render's free web service.

## Why This Fits Render Free

Render's free Python service can run out of memory at 512 MB when an app loads ChromaDB, PyTorch, Transformers, and a local sentence-transformer model. This backend avoids those heavy runtime dependencies.

The app now:
- reads `data/exam_papers.txt` into a small cached list
- ranks papers with keyword and metadata scoring
- calls Groq only for the final answer
- does not build embeddings during startup
- does not run ChromaDB in the web service

## Requirements

```bash
pip install -r requirements.txt
```

## Environment Variables

Create `.env` locally:

```env
GROQ_API_KEY=your_actual_key_here
LLM_MODEL_NAME=llama3-8b-8192
```

On Render, set `GROQ_API_KEY` in the service Environment tab.

## Run Locally

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

## API

Send chat requests to:

```text
POST /chat
```

Example body:

```json
{
  "query": "show cse 3-1 r18 data structures papers"
}
```

Health check:

```text
GET /health
```

## Deploy On Render

1. Push this folder to GitHub.
2. Create or redeploy the Render web service.
3. Use the existing `render.yaml`.
4. Set `GROQ_API_KEY` manually in Render.
5. Redeploy.

If you previously deployed the heavier version, trigger a fresh deploy so Render installs the new smaller `requirements.txt`.
