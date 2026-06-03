# RAG Bot - Retrieval-Augmented Generation Chat Application

A full-stack intelligent chat application that combines document retrieval with generative AI to provide context-aware responses. Built with FastAPI backend, Next.js frontend, and powered by Google's Gemini API.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [How It Works](#how-it-works)

---

## Overview

RAG Bot is a Retrieval-Augmented Generation system that allows users to:
1. Upload documents for indexing
2. Chat with an AI assistant that retrieves relevant information from uploaded documents
3. Get accurate, context-aware responses grounded in the provided knowledge base

The system uses a hybrid retrieval approach combining semantic search (embeddings) with keyword-based search (BM25) for optimal document retrieval, followed by re-ranking to provide the most relevant chunks to the language model.

---

## Architecture

### High-Level Flow

```
User Query
    ↓
[Frontend - Chat Interface]
    ↓
[FastAPI Backend]
    ├─ Text Extraction & Chunking
    ├─ Embedding Generation (Gemini)
    ├─ Hybrid Retrieval (Vector + BM25)
    ├─ Re-ranking
    └─ LLM Response Generation (Gemini)
    ↓
[Response to User]
```

### Components

1. **Document Processing Pipeline**
   - Extract text from uploaded files
   - Split text into manageable chunks
   - Generate embeddings for each chunk
   - Store in vector database (Chroma) and relational database

2. **Retrieval System**
   - Vector search (semantic similarity via embeddings)
   - Keyword search (BM25 algorithm)
   - Hybrid combination of both approaches
   - Re-ranking for quality filtering

3. **Conversation Management**
   - Store conversations and messages
   - Link documents to conversations
   - Maintain chat history

4. **User Interface**
   - Real-time chat interface
   - Document upload capability
   - Message history display

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Vector Store**: Chroma DB
- **LLM & Embeddings**: Google Gemini API
- **Text Processing**: Custom chunking and extraction utilities
- **Search**: BM25 keyword retrieval

### Frontend
- **Framework**: Next.js 16.2.6
- **UI Library**: React 19.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tools**: ESLint, PostCSS

### Infrastructure
- **API Communication**: REST with CORS support
- **Environment**: Docker-ready, Python 3.x

---

## Project Structure

```
rag-bot/
├── backend/                    # Python FastAPI backend
│   ├── main.py                # FastAPI application & endpoints
│   ├── Model.py               # SQLAlchemy ORM models
│   ├── schema.py              # Pydantic schemas for validation
│   ├── database.py            # Database connection & session management
│   ├── test_chroma.py         # Chroma DB testing
│   ├── chroma_db/             # Vector database storage
│   │   ├── chroma.sqlite3     # Chroma vector store
│   │   └── 87f65fad.../       # Embedding vectors
│   ├── uploads/               # Uploaded document storage
│   └── utils/                 # Utility modules
│       ├── extractor.py       # Text extraction from files
│       ├── chunker.py         # Text chunking logic
│       ├── embeddings.py      # Embedding generation
│       ├── vector_store.py    # Vector store operations
│       ├── hybrid_retrieval.py# Hybrid search implementation
│       ├── bm25_retreival.py  # BM25 keyword search
│       ├── reranker.py        # Document re-ranking
│       └── similarity.py      # Similarity calculations
│
├── frontend/                  # Next.js React frontend
│   ├── app/                   # Next.js app directory
│   │   ├── layout.tsx         # Root layout component
│   │   ├── page.tsx           # Home page
│   │   ├── api.ts             # API client
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── chatInput.tsx      # Message input component
│   │   └── chatMessages.tsx   # Message display component
│   ├── public/                # Static assets
│   ├── package.json           # Dependencies & scripts
│   ├── tsconfig.json          # TypeScript configuration
│   ├── next.config.ts         # Next.js configuration
│   └── README.md              # Frontend-specific docs
│
├── README.md                  # This file
└── BloodHound.md              # Additional documentation
```

---

## Features

### Document Management
- ✅ Upload documents (text, PDF, etc.)
- ✅ Automatic text extraction
- ✅ Smart text chunking for optimal retrieval
- ✅ Persistent storage in database

### Intelligent Retrieval
- ✅ Vector semantic search using embeddings
- ✅ BM25 keyword-based search
- ✅ Hybrid retrieval combining both approaches
- ✅ Document re-ranking for quality assurance
- ✅ Conversation-scoped retrieval

### Chat Capabilities
- ✅ Context-aware responses from Gemini LLM
- ✅ Real-time chat interface
- ✅ Conversation history management
- ✅ Multiple conversations support

### Technical Features
- ✅ CORS-enabled API
- ✅ Asynchronous file uploads
- ✅ SQLAlchemy ORM for type-safe database operations
- ✅ Chroma vector database for efficient similarity search

---

## Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher (for frontend)
- **npm** or **yarn**: Package manager
- **Google Gemini API Key**: Required for embeddings and LLM
- **SQLite**: Included with Python

---

## Installation & Setup

### 1. Clone the Repository

```bash
cd e:\B-Tech\Projects\Rag-bot
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
# or
yarn install
```

### 4. Configuration

Create a `.env` file in the `backend` directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
DATABASE_URL=sqlite:///./rag_bot.db
```

**Obtaining Gemini API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Create a new API key
3. Copy the key and paste it in your `.env` file

---

## Configuration

### Backend Configuration

**Environment Variables** (`.env` in backend/):
```env
GEMINI_API_KEY=<your-api-key>
DATABASE_URL=sqlite:///./rag_bot.db
```

**Database Models** are defined in `Model.py`:
- `Conversation`: Store conversation sessions
- `Message`: Store chat messages
- `Document`: Store uploaded documents
- `Chunk`: Store text chunks with embeddings

**Vector Store** (Chroma):
- Stored locally in `backend/chroma_db/`
- Uses persistent storage for vector embeddings
- Organized by conversation_id for scoped retrieval

### Frontend Configuration

**Next.js Config** (`next.config.ts`):
- TypeScript support enabled
- Tailwind CSS integration

**API Client** (`app/api.ts`):
- Configure backend API endpoint
- Default: `http://localhost:8000`

---

## Usage

### Starting the Application

**Terminal 1 - Backend:**
```bash
cd backend
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend

# Development mode
npm run dev
# or
yarn dev

# Application will be available at http://localhost:3000
```

### Workflow

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Upload Document**: Use the upload feature to add documents
3. **Wait for Processing**: Backend processes, chunks, and indexes the document
4. **Chat**: Ask questions about the uploaded document
5. **View Results**: Receive AI-generated responses based on retrieved context

---

## API Endpoints

### Core Endpoints

#### Upload Document
```
POST /upload
Content-Type: multipart/form-data

Parameters:
- file: File (document to upload)
- conversation_id: Integer (ID of conversation)

Response:
{
  "filename": "document.txt",
  "status": "processed"
}
```

#### Send Message
```
POST /message
Content-Type: application/json

Body:
{
  "conversation_id": 1,
  "content": "User message"
}

Response:
{
  "id": 1,
  "role": "assistant",
  "content": "AI response based on document context"
}
```

#### Create Conversation
```
POST /conversation
Response:
{
  "id": 1
}
```

#### Get Conversation History
```
GET /conversation/{conversation_id}
Response:
{
  "messages": [
    {"id": 1, "role": "user", "content": "..."},
    {"id": 2, "role": "assistant", "content": "..."}
  ]
}
```

---

## How It Works

### 1. Document Upload & Processing

```
User uploads file
    ↓
Extract text content
    ↓
Split into chunks
    ↓
Generate embeddings (Gemini)
    ↓
Store in vector DB (Chroma) + relational DB (SQLite)
```

### 2. Query Processing

```
User sends message
    ↓
Generate embedding for query
    ↓
Vector search in Chroma (semantic similarity)
    ↓
BM25 keyword search
    ↓
Combine & merge results
    ↓
Re-rank candidates
    ↓
Select top-k chunks
    ↓
Format context for LLM
    ↓
Generate response (Gemini)
    ↓
Return to user
```

### 3. Hybrid Retrieval

The system uses **hybrid retrieval** combining:

- **Vector Search**: Uses semantic embeddings to find conceptually similar chunks
  - Generated via Gemini embedding model
  - Stored in Chroma vector database
  - Efficient similarity matching

- **BM25 Search**: Uses keyword-based relevance scoring
  - Excellent for exact term matching
  - Fast keyword-in-document search
  - Complements semantic search

- **Combination**: Merges both result sets, re-ranks by relevance

### 4. Re-ranking

Retrieved chunks are re-ranked using a ranking algorithm to ensure:
- Most relevant chunks appear first
- Redundant information is filtered
- Highest quality context reaches the LLM

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI app & endpoint definitions |
| `backend/Model.py` | Database models (ORM) |
| `backend/utils/hybrid_retrieval.py` | Core retrieval logic |
| `backend/utils/embeddings.py` | Embedding generation |
| `backend/utils/chunker.py` | Text chunking strategy |
| `backend/utils/reranker.py` | Re-ranking logic |
| `frontend/app/page.tsx` | Main chat page |
| `frontend/components/chatInput.tsx` | Input component |
| `frontend/components/chatMessages.tsx` | Message display |

---

## Troubleshooting

### Issue: "GEMINI_API_KEY not found"
**Solution**: Ensure `.env` file is in `backend/` directory with valid API key

### Issue: "Connection refused" to backend
**Solution**: Verify backend is running on `localhost:8000`

### Issue: Embeddings not generating
**Solution**: Check Gemini API key and rate limits

### Issue: Document not retrieving correctly
**Solution**: Verify documents are stored in `backend/uploads/` and chunks exist in database

---

## Contributing

1. Create a feature branch
2. Make changes following project conventions
3. Test thoroughly
4. Submit pull request

---

## License

Project for B-Tech Studies

---

## Contact & Support

For issues or questions, refer to:
- `BloodHound.md` - Additional documentation
- `frontend/README.md` - Frontend-specific details

---

**Last Updated**: June 2026
