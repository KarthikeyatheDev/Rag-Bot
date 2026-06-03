# RAG Bot

A Retrieval-Augmented Generation (RAG) chat application that allows users to upload documents and ask questions about them. The system retrieves relevant document content and uses Google's Gemini API to generate context-aware responses.

## Features

* Upload and index documents
* Semantic search using embeddings
* BM25 keyword search
* Hybrid retrieval with re-ranking
* Context-aware AI responses
* Conversation history management

## Tech Stack

### Backend

* FastAPI
* SQLite + SQLAlchemy
* ChromaDB
* Google Gemini API

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Project Structure

```text
rag-bot/
├── backend/
│   ├── main.py
│   ├── Model.py
│   ├── schema.py
│   ├── database.py
│   └── utils/
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── public/
│
└── README.md
```

## How It Works

```text
Document Upload
      ↓
Text Extraction
      ↓
Chunking
      ↓
Embedding Generation
      ↓
Storage (ChromaDB + SQLite)

User Query
      ↓
Hybrid Retrieval
(Vector Search + BM25)
      ↓
Re-ranking
      ↓
Gemini Response
```

## Setup

### Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key
DATABASE_URL=sqlite:///./rag_bot.db
```

### Frontend

```bash
cd frontend
npm install
```

## Run

### Backend

```bash
cd backend
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm run dev
```

Open: `http://localhost:3000`

## Architecture

```text
Frontend (Next.js)
        ↓
Backend (FastAPI)
        ↓
Hybrid Retrieval
   ├── ChromaDB
   └── BM25
        ↓
Gemini API
```
