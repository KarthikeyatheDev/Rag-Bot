# # utils/rag_orchestrator.py

# from utils.redis_client import get_cache, set_cache
# from utils.semantic_cache import get_semantic_cache, save_semantic_cache
# from utils.bm25_retreival import keyword_retrieval
# from utils.vector_store import collection
# from utils.embeddings import generate_embedding
# from utils.reranker import rerank


# def rag_pipeline(
#     conversation_id: int,
#     message_content: str,
#     conversation_history: list ,
#     db,
#     model,
#     client
# ):

#     # Retrieval Cache and Embedding Cache
#     embed_key = f"embed:{conversation_id}:{message_content}"
#     query_embedding = get_cache(embed_key)
#     if query_embedding is None:
#         query_embedding = generate_embedding(message_content)
#         set_cache(embed_key, query_embedding, ttl=86400)

#     # Semantic Cache
#     cached = get_semantic_cache(query_embedding, conversation_id)
#     if cached:
#         return {"response": cached, "source": "semantic_cache"}

#     # hybrid retrieval
#     query_result = collection.query(
#         query_embeddings=[query_embedding],
#         n_results=5,
#         where={"conversation_id": conversation_id},
#     )
#     documents = query_result.get("documents") or []
#     chroma_chunks = documents[0] if documents else []
#     chunk_texts = chroma_chunks  # OR DB chunks if needed
#     keyword_chunks = keyword_retrieval(chunk_texts, message_content, top_k=5)
#     hybrid_chunks = list(dict.fromkeys(chroma_chunks + keyword_chunks))

#     # Reranking
#     reranked_chunks = rerank(message_content, hybrid_chunks, top_k=5)
#     context = "\n\n".join(reranked_chunks)

#     # Prompt Building
#     def build_prompt(context: str, conversation_history: list):
#         prompt = f"""
# You are a helpful AI assistant.

# Use the context below to answer.

# Context:
# {context}

# Conversation:
# """
#         for msg in conversation_history:
#             role = "User" if getattr(msg, "role", None) == "user" or msg.get("role") == "user" else "Assistant"
#             content = getattr(msg, "content", None) if hasattr(msg, "content") else msg.get("content")
#             prompt += f"{role}: {content}\n"

#         prompt += "Assistant:"
#         return prompt

#     if conversation_history is None:
#         conversation_history = []

#     response = client.models.generate_content(
#         model=model,
#         contents=build_prompt(context, conversation_history),
#     )

#     final_answer = response.text

#     save_semantic_cache(
#         query_embedding=query_embedding,
#         query_text=message_content,
#         response=final_answer,
#         conversation_id=conversation_id,
#     )
#     set_cache(
#         f"chat:{conversation_id}:{message_content}",
#         final_answer,
#         ttl=3600,
#     )
#     return {
#         "response": final_answer,
#         "source": "llm",
#     }

from Model import Chunk, Document

from utils.redis_client import get_cache, set_cache
from utils.semantic_cache import get_semantic_cache, save_semantic_cache
from utils.bm25_retreival import keyword_retrieval
from utils.vector_store import get_collection
from utils.embeddings import generate_embedding
from utils.reranker import rerank


def build_prompt(context: str, conversation_history: list):
    prompt = f"""
You are a helpful AI assistant.

Use the provided context to answer the user's question.

If the answer is not present in the context, say you do not know.

Context:
{context}

Conversation:
"""

    for msg in conversation_history:
        role = "User" if str(msg.role).lower() == "user" else "Assistant"
        prompt += f"{role}: {msg.content}\n"

    prompt += "Assistant:"
    return prompt


def rag_pipeline(
    conversation_id: int,
    message_content: str,
    conversation_history: list,
    db,
    model: str,
    client,
):
    # -------------------------
    # Embedding Cache
    # -------------------------

    embed_key = f"embed:{message_content}"

    query_embedding = get_cache(embed_key)

    if query_embedding is None:
        query_embedding = generate_embedding(message_content)
        set_cache(embed_key, query_embedding, ttl=86400)

    # -------------------------
    # Semantic Cache
    # -------------------------

    semantic_hit = get_semantic_cache(
        query_embedding=query_embedding,
        conversation_id=conversation_id,
    )

    if semantic_hit:
        return {
            "response": semantic_hit,
            "source": "semantic_cache",
        }

    # -------------------------
    # Get all chunks for BM25
    # -------------------------

    all_chunks = (
        db.query(Chunk)
        .join(Document)
        .filter(Document.conversation_id == conversation_id)
        .all()
    )

    chunk_texts = [chunk.content for chunk in all_chunks]

    # -------------------------
    # Chroma Retrieval
    # -------------------------

    collection = get_collection()
    query_result = collection.query(
        query_embeddings=[query_embedding],
        n_results=5,
        where={"conversation_id": conversation_id},
    )

    documents = query_result.get("documents") or []

    chroma_chunks = documents[0] if documents else []

    # -------------------------
    # BM25 Retrieval
    # -------------------------

    keyword_chunks = []

    if chunk_texts:
        keyword_chunks = keyword_retrieval(
            chunk_texts,
            message_content,
            top_k=min(5, len(chunk_texts)),
        )

    # -------------------------
    # Hybrid Retrieval
    # -------------------------

    hybrid_chunks = list(
        dict.fromkeys(
            chroma_chunks + list(keyword_chunks)
        )
    )

    # -------------------------
    # Reranking
    # -------------------------

    if hybrid_chunks:
        reranked_chunks = rerank(
            message_content,
            hybrid_chunks,
            top_k=min(5, len(hybrid_chunks)),
        )
    else:
        reranked_chunks = []

    context = "\n\n".join(reranked_chunks)

    # -------------------------
    # LLM
    # -------------------------

    prompt = build_prompt(
        context=context,
        conversation_history=conversation_history,
    )

    response = client.models.generate_content(
        model=model,
        contents=prompt,
    )

    final_answer = response.text

    # -------------------------
    # Save Semantic Cache
    # -------------------------

    save_semantic_cache(
        query_embedding=query_embedding,
        query_text=message_content,
        response=final_answer,
        conversation_id=conversation_id,
    )

    return {
        "response": final_answer,
        "source": "llm",
    }