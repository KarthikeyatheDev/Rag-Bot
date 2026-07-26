# 🤖 RAG Bot

> A production-ready Retrieval-Augmented Generation (RAG) chatbot built with **FastAPI**, **Next.js**, **Redis**, **ChromaDB**, and **Google Gemini**.

RAG Bot enables users to upload documents and chat with them naturally using a hybrid retrieval pipeline combining semantic search, keyword search, reranking, and intelligent caching.

---

## ✨ Features

* 📄 Upload PDF and TXT documents
* 💬 Multi-conversation document chat
* 🔍 Hybrid Retrieval

  * Semantic Search (ChromaDB)
  * BM25 Keyword Search
* 🎯 Cross-Encoder Reranking
* ⚡ Multi-level Caching

  * Response Cache
  * Embedding Cache
  * Retrieval Cache
  * Semantic Cache
* 🚦 Redis-based Rate Limiting
* 🧠 Google Gemini 2.5 Flash Integration
* 🗄️ Persistent Conversation History
* 🐳 Docker & Docker Compose Support
* 📱 Modern Next.js + Tailwind UI

---

# Demo

> *(Temporary Placeholder)*

```
Home Page

Chat Interface

Document Upload

Swagger API
```

---

# Architecture

```text
                        ┌─────────────────────┐
                        │    Next.js Frontend │
                        └──────────┬──────────┘
                                   │ REST API
                                   ▼
                        ┌─────────────────────┐
                        │   FastAPI Backend   │
                        └──────────┬──────────┘
                                   │
         ┌───────────────┬─────────┴──────────┬───────────────┐
         ▼               ▼                    ▼               ▼
     SQLite         ChromaDB              Redis          Gemini API
 Conversations   Vector Database      Cache + Rate       LLM
 & Metadata                           Limiting

```

---

# RAG Pipeline

```text
Upload Document
        │
        ▼
Extract Text
        │
        ▼
Chunk Document
        │
        ▼
Generate Embeddings
        │
        ▼
Store in ChromaDB
        │
        ▼
──────────────────────────────────────────────

User Query
        │
        ▼
Embedding Cache
        │
        ▼
Semantic Cache
        │
        ▼
Hybrid Retrieval
   ├── ChromaDB
   └── BM25
        │
        ▼
Merge Results
        │
        ▼
Cross Encoder Reranker
        │
        ▼
Prompt Construction
        │
        ▼
Gemini 2.5 Flash
        │
        ▼
Assistant Response
        │
        ▼
Response Cache
```

---

# Caching Strategy

To improve latency and reduce API usage, the project implements four caching layers.

| Cache           | Purpose                                             |
| --------------- | --------------------------------------------------- |
| Embedding Cache | Avoid regenerating embeddings for repeated queries  |
| Retrieval Cache | Cache retrieval pipeline output                     |
| Semantic Cache  | Return responses for semantically similar questions |
| Response Cache  | Return identical responses for repeated prompts     |

---

# Tech Stack

## Backend

* FastAPI
* SQLAlchemy
* SQLite
* ChromaDB
* Redis
* Sentence Transformers
* BM25s
* Google Gemini API

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Infrastructure

* Docker
* Docker Compose
* GitHub Actions (CI)

---

# Project Structure

```text
rag-bot/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── Model.py
│   ├── schema.py
│   ├── requirements.txt
│   └── utils/
│       ├── embeddings.py
│       ├── hybrid_retrieval.py
│       ├── reranker.py
│       ├── semantic_cache.py
│       ├── redis_client.py
│       └── ...
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── package.json
│
├── docker-compose.yml
├── README.md
└── .github/
    └── workflows/
```

---

# Getting Started

## Prerequisites

* Docker
* Docker Compose

---

## Clone Repository

```bash
git clone https://github.com/<your-username>/rag-bot.git
cd rag-bot
```

---

## Configure Environment

Create:

```text
backend/.env
```

```env
GEMINI_API_KEY=your_api_key
DATABASE_URL=sqlite:///./data/chat.db
```

---

## Run

```bash
docker compose up --build
```

Frontend

```
http://localhost:3000
```

Swagger

```
http://localhost:8000/docs
```

---

# API

## Conversations

```
GET /conversations
POST /conversations
```

## Upload Documents

```
POST /upload/{conversation_id}
```

## Chat

```
POST /chat/{conversation_id}
```

Example

```json
{
  "content": "Summarize the uploaded document."
}
```

---

# Performance Optimizations

* Hybrid Retrieval (Semantic + BM25)
* Cross Encoder Reranking
* Redis Response Cache
* Embedding Cache
* Semantic Cache
* Retrieval Cache
* Dockerized Deployment
* Production-ready API Structure

---

# License

This project is licensed under the MIT License.