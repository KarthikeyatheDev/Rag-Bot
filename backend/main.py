from email import message
import shutil
import os
import uuid


from click import prompt
from fastapi import Depends, FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from sqlalchemy import func
from sqlalchemy import func
from sqlalchemy.orm import Session


from database import get_db, engine

from Model import Base, Chunk, Document
from schema import MessageCreate, ConversationUpdate
from Model import Message, Conversation
from utils.extractor import extract_text
from utils.chunker import chunk_text
from utils.embeddings import generate_embedding
from utils.vector_store import get_collection
from utils.redis_client import get_cache, set_cache
from utils.rag_orchestrator import rag_pipeline
from fastapi import Request
from utils.rate_limiter import check_rate_limit


from fastapi.middleware.cors import CORSMiddleware

import os
from dotenv import load_dotenv
from google import genai


from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

from functools import lru_cache


@lru_cache(maxsize=1)
def get_gemini_client():
    return genai.Client(api_key=os.environ["GEMINI_API_KEY"])


model_name = "gemini-2.5-flash"

app = FastAPI()


Base.metadata.create_all(bind=engine)

messages = [
    {"id": 1, "role": "assistant", "content": "Hello!"},
    {"id": 2, "role": "user", "content": "Hi there!"},
]

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://13.219.72.7:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def cors_headers_middleware(request, call_next):
    if request.method == "OPTIONS":
        response = Response(status_code=200)
        response.headers["Access-Control-Allow-Origin"] = request.headers.get(
            "origin", "*"
        )
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, PUT, DELETE, OPTIONS"
        )
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    response = await call_next(request)

    origin = request.headers.get("origin")
    response.headers["Access-Control-Allow-Origin"] = origin or "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"

    return response


@app.middleware("http")
async def rate_limit_middleware(request, call_next):

    if request.url.path.startswith("/chat"):
        check_rate_limit(request)

    response = await call_next(request)

    return response


@app.get("/conversations")
def get_conversations(db: Session = Depends(get_db)):

    return db.query(Conversation).all()


@app.post("/conversations")
def create_conversation(db: Session = Depends(get_db)):

    count = db.query(func.count(Conversation.id)).scalar() or 0

    conversation = Conversation(title=f"Conversation {count + 1}")

    db.add(conversation)

    db.commit()

    db.refresh(conversation)

    return conversation


@app.get("/messages/{conversation_id}")
def get_messages(conversation_id: int, db: Session = Depends(get_db)):

    return db.query(Message).filter(Message.conversation_id == conversation_id).all()


@app.post("/chat/{conversation_id}")
def chat(conversation_id: int, message: MessageCreate, db: Session = Depends(get_db)):

    cache_key = f"chat:{conversation_id}:{message.content}"
    cached_response = get_cache(cache_key)

    user_message = Message(
        role="user", content=message.content, conversation_id=conversation_id
    )

    db.add(user_message)

    db.commit()

    db.refresh(user_message)

    conversation = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.id.asc())
        .all()
    )
    if cached_response:

        assistant_message = Message(
            role="assistant", content=cached_response, conversation_id=conversation_id
        )
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)
        return assistant_message

    try:
        result = rag_pipeline(
            conversation_id=conversation_id,
            message_content=message.content,
            db=db,
            model=model_name,
            client=get_gemini_client(),
            conversation_history=conversation,
        )
        assistant_content = result["response"]

        set_cache(cache_key, assistant_content, ttl=3600)
    except Exception as e:
        assistant_content = f"Error: {str(e)}"

    assistant_message = Message(
        role="assistant", content=assistant_content, conversation_id=conversation_id
    )

    db.add(assistant_message)

    db.commit()

    db.refresh(assistant_message)

    return assistant_message


@app.post("/upload/{conversation_id}")
def upload_file(
    conversation_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)
):

    file_bytes = file.file.read()

    content = extract_text(file_bytes, file.filename)
    chunks = chunk_text(content)

    document = Document(
        filename=file.filename,
        content=content,
        conversation_id=conversation_id,
    )

    db.add(document)

    db.commit()

    db.refresh(document)

    for index, chunk in enumerate(chunks):
        embedding = generate_embedding(chunk)
        chunk_entry = Chunk(
            content=chunk,
            chunk_index=index,
            document_id=document.id,
        )
        db.add(chunk_entry)
        db.flush()

        collection = get_collection()
        collection.add(
            documents=[chunk],
            embeddings=[embedding],
            ids=[str(int(chunk_entry.id))],
            metadatas=[
                {
                    "conversation_id": int(conversation_id),
                    "document_id": int(document.id),
                }
            ],
        )

    db.commit()

    return {"message": "File uploaded successfully", "document_id": document.id}


@app.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    # Check if conversation exists
    conversation = (
        db.query(Conversation).filter(Conversation.id == conversation_id).first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get all documents
    documents = (
        db.query(Document).filter(Document.conversation_id == conversation_id).all()
    )

    # Delete all chunks belonging to those documents
    for doc in documents:
        db.query(Chunk).filter(Chunk.document_id == doc.id).delete()

    # Delete embeddings from Chroma
    try:
        collection = get_collection()
        collection.delete(where={"conversation_id": int(conversation_id)})
    except Exception as e:
        print(f"Error deleting from ChromaDB: {e}")

    # Delete documents
    db.query(Document).filter(Document.conversation_id == conversation_id).delete()

    # Delete messages
    db.query(Message).filter(Message.conversation_id == conversation_id).delete()

    # Delete conversation
    db.delete(conversation)

    db.commit()

    return {"message": "Conversation deleted successfully"}
