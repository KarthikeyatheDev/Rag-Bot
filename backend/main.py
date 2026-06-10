from email import message
import shutil

from click import prompt
from fastapi import Depends, FastAPI, UploadFile, File
from sqlalchemy.orm import Session


from database import get_db, engine

from Model import Base, Chunk, Document
from schema import MessageCreate
from Model import Message, Conversation
from utils.extractor import extract_text
from utils.chunker import chunk_text
from utils.embeddings import generate_embedding
from utils.vector_store import collection
from utils.redis_client import get_cache, set_cache
from utils.rag_orchestrator import rag_pipeline


from fastapi.middleware.cors import CORSMiddleware

import os
from dotenv import load_dotenv
from google import genai


from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

model_name = "gemini-2.5-flash"

app = FastAPI()


# Which library has the digital archive room?
# When did East Library open?
# Which library is the newest?

Base.metadata.create_all(bind=engine)

messages = [
    {"id": 1, "role": "assistant", "content": "Hello!"},
    {"id": 2, "role": "user", "content": "Hi there!"},
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/conversations")
def get_conversations(db: Session = Depends(get_db)):

    return db.query(Conversation).all()


@app.post("/conversations")
def create_conversation(db: Session = Depends(get_db)):

    conversation = Conversation()

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
            client=client,
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

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    content = extract_text(file_path, str(file.filename))
    chunks = chunk_text(content)
    document = Document(
        filename=file.filename,
        filepath=file_path,
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
