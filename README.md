# 🤖 RAG Bot

**A from-scratch Retrieval-Augmented Generation chatbot** — built to understand what actually happens inside a RAG system instead of hiding it behind a framework like LangChain.

Upload a PDF or `.txt` file, then chat with it. Under the hood, every stage of the pipeline — chunking, embeddings, hybrid retrieval, reranking, caching, prompting — is hand-written so the mechanics stay visible.

**Stack:** FastAPI · Next.js · SQLite · ChromaDB · Redis · Google Gemini

---

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [How a query is answered](#how-a-query-is-answered)
- [Caching](#caching)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [API reference](#api-reference)
- [Known limitations](#known-limitations)
- [License](#license)

---

## Features

- 📄 Upload `.pdf` and `.txt` documents per conversation
- 💬 Multiple, persistent conversations (SQLite-backed history)
- 🔍 **Hybrid retrieval** — semantic search (ChromaDB) merged with keyword search (BM25)
- 🎯 **Cross-encoder reranking** of retrieved chunks before they hit the prompt
- ⚡ Three-layer caching (embedding, semantic, response) to cut latency and Gemini API calls
- 🚦 Redis-backed rate limiting on the chat endpoint
- 🧠 Google Gemini 2.5 Flash for generation
- 🐳 One-command startup with Docker Compose

---

## Architecture

```
                       ┌──────────────────────┐
                       │   Next.js Frontend    │
                       │  (localhost:3000)     │
                       └───────────┬───────────┘
                                   │ REST
                                   ▼
                       ┌──────────────────────┐
                       │   FastAPI Backend     │
                       │  (localhost:8000)     │
                       └───────────┬───────────┘
                                   │
        ┌───────────────┬─────────┴──────────┬────────────────┐
        ▼                ▼                    ▼                ▼
    SQLite            ChromaDB              Redis          Gemini API
 conversations,    chunk embeddings +   response cache,     generation
 messages,         semantic cache       embedding cache,
 documents,                             rate limiting
 chunks
```

Each service runs in its own container via `docker-compose.yml`: `backend`, `frontend`, and `redis`. ChromaDB and SQLite are embedded/persisted to Docker volumes rather than run as separate services.

---

## How a query is answered

This is the actual sequence in [`utils/rag_orchestrator.py`](backend/utils/rag_orchestrator.py):

```
1. Embedding Cache     → reuse the query embedding if seen before (Redis, 24h TTL)
2. Semantic Cache      → return a cached answer if a near-identical question
                          was already asked in this conversation (Chroma,
                          cosine similarity ≥ 0.85)
3. Retrieval           → semantic search in ChromaDB (top 5)
                        + BM25 keyword search over the conversation's chunks (top 5)
                        → merged and de-duplicated
4. Reranking           → a cross-encoder scores every candidate chunk
                          against the query and keeps the top 5
5. Prompt construction → reranked context + full conversation history
6. Generation          → Gemini 2.5 Flash
7. Response Cache      → the final answer is cached (Redis, 1h TTL) and the
                          semantic cache is updated for future similar queries
```

Document ingestion (on upload) is simpler: extract text → split into overlapping chunks → embed each chunk → store in both SQLite (for BM25) and ChromaDB (for semantic search), scoped to the conversation.

---

## Caching

| Layer | Store | What it avoids |
| --- | --- | --- |
| Embedding cache | Redis (24h TTL) | Re-embedding a query it has seen before |
| Semantic cache | ChromaDB (similarity ≥ 0.85) | A full retrieval + generation round-trip for near-duplicate questions |
| Response cache | Redis (1h TTL) | Calling Gemini again for an identical prompt |

All retrieval is also scoped **per conversation** — chunks from one conversation's documents never leak into another's answers.

---

## Tech stack

**Backend**
- FastAPI, Uvicorn
- SQLAlchemy + SQLite (conversations, messages, documents, chunks)
- ChromaDB (vector store + semantic cache)
- Redis (response/embedding cache, rate limiting)
- `sentence-transformers` — `all-MiniLM-L6-v2` for embeddings, `cross-encoder/ms-marco-MiniLM-L-6-v2` for reranking
- `bm25s` for keyword retrieval
- `pypdf` for PDF text extraction
- Google Gemini API (`google-genai`)

**Frontend**
- Next.js (App Router), React, TypeScript
- Tailwind CSS

**Infrastructure**
- Docker, Docker Compose
- GitHub Actions — compiles the backend and builds both Docker images on every push/PR to `main`

---

## Project structure

```
Rag-Bot/
├── backend/
│   ├── main.py                    # FastAPI app, routes, CORS, rate-limit middleware
│   ├── database.py                # SQLAlchemy engine/session (SQLite)
│   ├── Model.py                   # Conversation, Message, Document, Chunk models
│   ├── schema.py                  # Pydantic request/response schemas
│   ├── requirements.txt
│   ├── Dockerfile
│   └── utils/
│       ├── extractor.py           # PDF/TXT text extraction
│       ├── chunker.py             # Fixed-size overlapping chunking
│       ├── embeddings.py          # SentenceTransformer embeddings
│       ├── vector_store.py        # ChromaDB client + collections
│       ├── bm25_retreival.py      # BM25 keyword search
│       ├── reranker.py            # Cross-encoder reranking
│       ├── rag_orchestrator.py    # Ties retrieval + reranking + Gemini together
│       ├── semantic_cache.py      # Similarity-based response cache
│       ├── redis_client.py        # Redis cache helpers
│       └── rate_limiter.py        # Fixed-window rate limiting
│
├── frontend/
│   ├── app/                       # Next.js App Router pages + API client
│   ├── components/                # Chat UI components
│   └── package.json
│
├── docker-compose.yml
└── .github/workflows/             # CI: compiles the backend, builds both Docker images
```

---

## Getting started

### Prerequisites

- Docker and Docker Compose
- A [Google Gemini API key](https://ai.google.dev/)

### 1. Clone the repository

```bash
git clone https://github.com/KarthikeyatheDev/Rag-Bot.git
cd Rag-Bot
```

### 2. Configure the backend environment

Create `backend/.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

> That's the only variable the app actually reads at runtime — the database path and Redis host are currently fixed in code (`backend/database.py`, `backend/utils/redis_client.py`), not environment-driven.

### 3. Run everything

```bash
docker compose up --build
```

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend / Swagger docs | http://localhost:8000/docs |
| Redis | localhost:6379 |

Conversations, uploaded documents, and the Chroma index persist across restarts in the `sqlite_data` and `chroma_data` Docker volumes.

### Running the backend outside Docker (optional)

The backend currently expects Redis to be reachable at the hostname `redis` (see `utils/redis_client.py`), which Docker Compose provides automatically via its internal network. If you run `uvicorn main:app --reload` directly on your machine instead of in a container, either:

- run Redis with `docker run --name redis -p 6379:6379 redis:7-alpine` and add `127.0.0.1 redis` to your hosts file, or
- point `redis_client.py` at `localhost` for local development.

---

## API reference

Interactive docs are always available at `/docs` once the backend is running. Summary:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/conversations` | List all conversations |
| `POST` | `/conversations` | Create a new conversation |
| `DELETE` | `/conversations/{conversation_id}` | Delete a conversation, its messages, documents, and vector data |
| `GET` | `/messages/{conversation_id}` | Get all messages in a conversation |
| `POST` | `/chat/{conversation_id}` | Send a message and get the assistant's reply |
| `POST` | `/upload/{conversation_id}` | Upload a `.pdf` or `.txt` document to a conversation |

**`POST /chat/{conversation_id}`**

```json
// request
{ "content": "Summarize the uploaded document." }
```
```json
// response
{ "id": 12, "role": "assistant", "content": "...", "conversation_id": 3 }
```

**`POST /upload/{conversation_id}`** — multipart form with a `file` field.

```json
{ "message": "File uploaded successfully", "document_id": 4 }
```

The chat endpoint is rate-limited to **20 requests per 60 seconds per client IP**; exceeding it returns `429 Too Many Requests`.

---

## Known limitations

- Only `.pdf` and `.txt` uploads are parsed; other file types are silently stored with no extracted text.
- No authentication — anything reachable at the backend URL can read/write any conversation.
- SQLite and the Redis hostname are hardcoded rather than configurable via environment variables.
- Single LLM provider (Gemini); no fallback if the API is unavailable or the key is invalid.

---

## License

This project is open to contributions.