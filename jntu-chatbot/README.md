# RAG Exam Paper Backend

This is a production-ready FastAPI backend for retrieving university exam papers using a RAG (Retrieval-Augmented Generation) pipeline. It uses ChromaDB for vector storage, SentenceTransformers for embeddings, and LangChain with Groq for LLM generation.

## Features
- **FastAPI**: Asynchronous web framework with Pydantic models.
- **RAG Pipeline**: Separated into ingestion, retrieval, and generation logic.
- **Startup Ingestion**: Embeddings and ChromaDB collection are initialized on startup to avoid rebuilding on every request.
- **CORS Middleware**: Pre-configured for React frontend integration.
- **Render Deployment**: Ready with `render.yaml` and `requirements.txt`.

## Folder Structure
```
.
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app and endpoints
│   ├── models.py            # Pydantic request/response models
│   ├── config.py            # Environment variables and settings
│   └── rag/
│       ├── __init__.py
│       ├── dependencies.py  # Model and DB client singletons
│       ├── ingestion.py     # Data loading and embedding generation
│       ├── retrieval.py     # Vector search logic
│       └── generation.py    # LLM prompt and response generation
├── data/
│   ├── exam_papers.txt      # Source data (JSON list of papers)
│   ├── vector_store/        # ChromaDB persistent storage (auto-created)
│   └── model_cache/         # HuggingFace model cache (auto-created)
├── .env.example             # Environment variable template
├── .gitignore               # Git ignores (avoids committing large DB/models)
├── render.yaml              # Render deployment configuration
└── requirements.txt         # Python dependencies
```

## How to Run Locally

1. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and add your `GROQ_API_KEY`. (Optionally update `LLM_MODEL_NAME`).

4. **Add Data**:
   - Ensure your JSON array of exam papers is saved in `data/exam_papers.txt`.
   - On the first run, the app will read this file, generate embeddings, and persist them to `data/vector_store`.

5. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`. You can test it via Swagger UI at `http://localhost:8000/docs`.

## How Frontend React Should Call the API

In your React MERN stack application, you can call the `/chat` endpoint using `fetch` or `axios`.

Example using `fetch`:
```javascript
const askQuestion = async (userQuery) => {
  try {
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: userQuery }),
    });

    const data = await response.json();
    if (data.success) {
      console.log("Answer:", data.answer);
      console.log("Sources:", data.sources);
      // Update your chatbot UI here
    }
  } catch (error) {
    console.error("Error communicating with RAG backend:", error);
  }
};
```
*Note: Make sure to replace `http://localhost:8000` with your deployed Render URL in production.*

## How Startup Ingestion Works

In `app/main.py`, FastAPI's `lifespan` context manager is used.
When the server starts:
1. It initializes the `SentenceTransformer` model and caches it in `data/model_cache`.
2. It initializes the `chromadb.PersistentClient`.
3. It calls `ingest_data()`.
4. `ingest_data()` checks if the collection already has documents. If it does, it skips ingestion. If not, it reads `data/exam_papers.txt`, generates embeddings, and adds them to ChromaDB.

This ensures that the database is only built once and not rebuilt on every `/chat` request.

## How to Structure Environment Variables

Use a `.env` file in the root directory for local development. `app/config.py` uses `pydantic-settings` to automatically load these variables.

```env
GROQ_API_KEY=your_actual_key_here
LLM_MODEL_NAME=qwen-2.5-32b
```

## How to Deploy on Render

1. **Push your code to GitHub** (Ensure `data/vector_store` and `data/model_cache` are ignored via `.gitignore`). You can keep `data/exam_papers.txt` in the repository so Render has the data to build the vector DB on startup.
2. Go to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` file and configure the Web Service.
6. **Important**: Go to the Environment section of your new Web Service in Render and add the `GROQ_API_KEY` secret variable manually (since `render.yaml` is set to `sync: false` for the API key to keep it secure).
7. Deploy. Render will install dependencies and start the app using Gunicorn/Uvicorn.
