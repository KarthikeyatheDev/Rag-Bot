# utils/semantic_cache.py

import uuid
from utils.vector_store import get_semantic_cache_collection

SIMILARITY_THRESHOLD = 0.85


def get_semantic_cache(query_embedding, conversation_id):
    semantic_cache = get_semantic_cache_collection()
    result = semantic_cache.query(
        query_embeddings=[query_embedding],
        n_results=1,
        where={"conversation_id": conversation_id},
    )

    docs = result.get("documents", [[]])
    distances = result.get("distances", [[]])

    if not docs[0]:
        return None

    similarity = 1 - distances[0][0]

    if similarity >= SIMILARITY_THRESHOLD:
        print("🔥 SEMANTIC CACHE HIT")
        return docs[0][0]
    print("❌ SEMANTIC CACHE MISS")
    return None


def save_semantic_cache(query_embedding, query_text, response, conversation_id):
    semantic_cache = get_semantic_cache_collection()
    semantic_cache.add(
        ids=[str(uuid.uuid4())],
        embeddings=[query_embedding],
        documents=[response],
        metadatas=[{"query": query_text, "conversation_id": conversation_id}],
    )
