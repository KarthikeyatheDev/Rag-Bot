from fastapi import Depends
from sqlalchemy.orm import Session
from Model import Chunk, Document
from database import get_db
from utils.vector_store import collection
from utils.chunker import chunk_text
from utils.embeddings import generate_embedding
from utils.bm25_retreival import keyword_retrieval


def hybrid_retrieval(
    conversation_id: int, message_content: str, db: Session = Depends(get_db)
):
    all_chunks = (
        db.query(Chunk)
        .join(Document)
        .filter(Document.conversation_id == conversation_id)
        .all()
    )
    query_embedding = generate_embedding(message_content)
    query_result = collection.query(
        query_embeddings=query_embedding,
        n_results=5,
        where={"conversation_id": conversation_id},
    )
    documents = query_result.get("documents") or []
    chroma_chunks = documents[0] if len(documents) > 0 else []
    chunk_texts = [chunk.content for chunk in all_chunks]
    keyword_chunks = keyword_retrieval(chunk_texts, message_content, top_k=5)
    hybrid_chunks = list(
    dict.fromkeys(
        chroma_chunks + list(keyword_chunks)
    )
)
    return hybrid_chunks
