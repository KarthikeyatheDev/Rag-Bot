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
        query_embeddings=[query_embedding],
        n_results=5,
        where={"conversation_id": conversation_id},
    )
    documents = query_result.get("documents") or []
    chroma_chunks = documents[0] if documents and documents[0] else []
    chunk_texts = [chunk.content for chunk in all_chunks]
    if not chunk_texts:
        return []
    top_k = min(5, len(chunk_texts))
    keyword_chunks = keyword_retrieval(chunk_texts, message_content, top_k=top_k) or []
    hybrid_chunks = list(dict.fromkeys(chroma_chunks + list(keyword_chunks)))
    # print("CHROMA:", chroma_chunks)
    # print("BM25:", keyword_chunks)
    # print("HYBRID:", hybrid_chunks)
    if not hybrid_chunks:
        return []
    return hybrid_chunks
