# RAG Bot 🤖

A Retrieval-Augmented Generation (RAG) chatbot that allows users to upload PDF and TXT documents and interact with them using natural language.

The application combines semantic vector search, keyword retrieval, reranking, caching, and Google's Gemini API to provide accurate, context-aware responses from uploaded documents.

## Features

* 📄 Upload and chat with PDF and TXT documents
* 🔍 Hybrid retrieval using vector search and BM25 keyword search
* 🎯 Neural reranking for improved context selection
* ⚡ Redis-powered caching for faster responses and reduced API usage
* 🛡️ IP-based rate limiting
* 💬 Persistent conversation history
* 🐳 Fully containerized with Docker Compose
* 📱 Responsive web interface built with Next.js

## Architecture

```text
Frontend (Next.js)
        │
        ▼
Backend (FastAPI)
        │
        ├── SQLite (Conversations & Metadata)
        ├── Redis (Caching & Rate Limiting)
        └── Retrieval Pipeline
                │
                ├── ChromaDB Vector Search
                ├── BM25 Keyword Search
                └── Cross-Encoder Reranker
                        │
                        ▼
                  Gemini 2.5 Flash
```

## Tech Stack

### Backend

* FastAPI
* SQLAlchemy
* SQLite
* ChromaDB
* Redis
* Sentence Transformers
* BM25s
* Google Gemini API

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Infrastructure

* Docker
* Docker Compose

## Retrieval Pipeline

1. User uploads a PDF or TXT document.
2. Text is extracted and split into chunks.
3. Chunks are embedded using a Sentence Transformer model.
4. Embeddings are stored in ChromaDB.
5. BM25 indexes are created for keyword retrieval.
6. User queries trigger both vector and keyword search.
7. Retrieved results are merged and reranked.
8. The top-ranked context is sent to Gemini for response generation.

## Project Structure

```text
rag-bot/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── schema.py
│   ├── Model.py
│   └── utils/
├── frontend/
│   ├── app/
│   ├── components/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

* Docker & Docker Compose

### Environment Variables

Create a `.env` file inside the `backend` directory:

```env
GEMINI_API_KEY=your_api_key
DATABASE_URL=sqlite:///./data/chat.db
```

### Run with Docker

```bash
docker compose up --build
```

Services:

* Frontend: http://localhost:3000
* Backend: http://localhost:8000
* API Docs: http://localhost:8000/docs

## API Overview

### Conversations

```http
GET  /conversations
POST /conversations
```

### Documents

```http
POST /upload/{conversation_id}
```

### Messages

```http
GET  /messages/{conversation_id}
POST /chat/{conversation_id}
```

Example request:

```json
{
  "content": "Summarize the uploaded document."
}
```

## Future Improvements

* Authentication and user accounts
* Streaming LLM responses
* Multi-document collections
* Source citations in responses
* PostgreSQL support
* Background document processing

## License

This project is provided for educational and portfolio purposes.
